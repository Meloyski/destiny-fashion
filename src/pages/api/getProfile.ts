import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getBungieApiKey } from "@/lib/bungie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { membershipId, membershipType } = req.query;

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
          "X-API-Key": getBungieApiKey(),
        },
      }
    );

    res.status(200).json(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Bungie API error:", err.response?.data || err.message);
    } else {
      console.error("❌ Unknown error:", err);
    }
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
