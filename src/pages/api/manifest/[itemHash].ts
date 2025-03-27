import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getBungieApiKey } from "@/lib/bungie";

let itemDefs: Record<string, any> | null = null;

const loadManifest = async () => {
  if (itemDefs) return;

  console.log("🧠 Loading Destiny manifest...");

  const manifestRes = await axios.get(
    "https://www.bungie.net/Platform/Destiny2/Manifest/",
    {
      headers: { "X-API-Key": getBungieApiKey()! },
    }
  );

  const path =
    manifestRes.data.Response.jsonWorldComponentContentPaths.en
      .DestinyInventoryItemDefinition;

  const fullUrl = `https://www.bungie.net${path}`;
  console.log("📦 Fetching full manifest JSON:", fullUrl);

  const definitionRes = await axios.get(fullUrl);
  itemDefs = definitionRes.data;

  // Safe and readable
  if (itemDefs) {
    console.log(
      "✅ Manifest loaded with",
      Object.keys(itemDefs).length,
      "items"
    );
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { itemHash } = req.query;

  if (!itemHash || Array.isArray(itemHash)) {
    return res.status(400).json({ error: "Invalid item hash" });
  }

  const hash = parseInt(itemHash, 10);
  if (isNaN(hash)) {
    return res.status(400).json({ error: "Item hash must be a number" });
  }

  try {
    await loadManifest();

    const item = itemDefs?.[hash];
    if (!item) {
      console.warn("⚠️ Item not found in manifest:", hash);
      return res.status(404).json({ error: "Item not found in manifest" });
    }

    return res.status(200).json(item);
  } catch (err: any) {
    console.error("❌ Manifest API error:", err.message);
    return res.status(500).json({ error: "Failed to load manifest" });
  }
}
