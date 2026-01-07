import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getBungieApiKey } from "@/lib/bungie";
import type { AxiosError } from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { membershipId, membershipType } = req.query;

  const apiKey = getBungieApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: "Missing Bungie API key" });
  }

  if (!membershipId || !membershipType) {
    return res
      .status(400)
      .json({ error: "Missing membershipId or membershipType" });
  }

  try {
    const response = await axios.get(
      `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200,205,300,305`,
      {
        headers: {
          "X-API-Key": apiKey,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (err: unknown) {
    const axErr = err as AxiosError;
    const bungieData = axErr.response?.data;

    if (axios.isAxiosError(axErr)) {
      console.error("❌ Bungie API error:", bungieData || axErr.message);
      return res
        .status(axErr.response?.status || 500)
        .json({ error: "Failed to fetch profile", detail: bungieData || axErr.message });
    }

    console.error("❌ Unknown error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
