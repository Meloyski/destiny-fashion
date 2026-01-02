import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { getBungieApiKey } from "@/lib/bungie";

type DestinyMembership = {
  membershipId: string;
  membershipType: number;
};

type GlobalNameSearchResult = {
  bungieGlobalDisplayName: string;
  bungieGlobalDisplayNameCode: number;
  destinyMemberships?: DestinyMembership[];
};

type ApiOk = {
  results: Array<{
    displayName: string;
    displayNameCode: number;
    memberships: DestinyMembership[];
  }>;
};

type ApiErr = { error: string; detail?: unknown };

type BungieErrorResponse = {
  ErrorCode?: number;
  Message?: string;
};

const BUNGIE_HEADERS = (apiKey: string) => ({
  "X-API-Key": apiKey,
  "Content-Type": "application/json",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiOk | ApiErr>
) {
  try {
    const apiKey = getBungieApiKey();

    // ✅ Narrow string | undefined -> string
    if (!apiKey) {
      return res.status(500).json({ error: "Missing Bungie API key" });
    }

    // Support either body or querystring
    const raw =
      (typeof req.body?.query === "string" && req.body.query) ||
      (typeof req.query?.query === "string" && req.query.query) ||
      "";

    const query = raw.trim();

    if (!query || query.length < 3) {
      return res.status(400).json({ error: "Missing or invalid query" });
    }

    // Try to match "Name#1234"
    const match = query.match(/^(.*)#(\d{4})$/);

    // 1) Exact-match path for Name#1234
    if (match) {
      const [, rawName, rawCode] = match;
      const displayName = (rawName ?? "").trim();
      const displayNameCode = rawCode ?? "";

      if (!displayName || displayNameCode.length !== 4) {
        return res.status(400).json({ error: "Invalid Bungie Name format" });
      }

      const response = await axios.post(
        "https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/All/",
        { displayName, displayNameCode },
        { headers: BUNGIE_HEADERS(apiKey) }
      );

      const memberships: DestinyMembership[] = (
        response.data?.Response ?? []
      ).map((m: any) => ({
        membershipId: String(m.membershipId),
        membershipType: Number(m.membershipType),
      }));

      return res.status(200).json({
        results: memberships.length
          ? [
              {
                displayName,
                displayNameCode: Number(displayNameCode),
                memberships,
              },
            ]
          : [],
      });
    }

    // 2) Prefix search path (GlobalName)
    const pagesToFetch = [0, 1, 2];

    const pageResponses = await Promise.all(
      pagesToFetch.map((page) =>
        axios.post(
          `https://www.bungie.net/Platform/User/Search/GlobalName/${page}/`,
          { displayNamePrefix: query },
          { headers: BUNGIE_HEADERS(apiKey) }
        )
      )
    );

    const rawResults: GlobalNameSearchResult[] = pageResponses.flatMap((r) => {
      return (r.data?.Response?.searchResults ??
        []) as GlobalNameSearchResult[];
    });

    const filtered = rawResults.filter(
      (r) =>
        Array.isArray(r.destinyMemberships) && r.destinyMemberships.length > 0
    );

    const dedupedMap = new Map<string, ApiOk["results"][number]>();

    for (const r of filtered) {
      const key = `${r.bungieGlobalDisplayName}#${String(
        r.bungieGlobalDisplayNameCode
      ).padStart(4, "0")}`;

      if (!dedupedMap.has(key)) {
        dedupedMap.set(key, {
          displayName: r.bungieGlobalDisplayName,
          displayNameCode: r.bungieGlobalDisplayNameCode,
          memberships: r.destinyMemberships ?? [],
        });
      }
    }

    const results = Array.from(dedupedMap.values());

    const qLower = query.toLowerCase();
    results.sort((a, b) => {
      const aName = a.displayName.toLowerCase();
      const bName = b.displayName.toLowerCase();

      const aStarts = aName.startsWith(qLower) ? 0 : 1;
      const bStarts = bName.startsWith(qLower) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;

      return aName.localeCompare(bName);
    });

    return res.status(200).json({ results });
  } catch (error) {
    const err = error as AxiosError;
    const bungieData = err.response?.data as BungieErrorResponse | undefined;

    if (bungieData?.ErrorCode === 217) {
      // Bungie returns UserCannotResolveCentralAccount when the profile doesn't exist.
      return res.status(404).json({
        error: "Guardian not found",
        detail: bungieData,
      });
    }

    console.error("❌ Bungie Search API failed:", bungieData || err.message);
    return res.status(500).json({
      error: "Failed to search Bungie users",
      detail: bungieData || err.message,
    });
  }
}
