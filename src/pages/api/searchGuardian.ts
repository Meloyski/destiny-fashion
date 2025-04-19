import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { getBungieApiKey } from "@/lib/bungie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing or invalid query" });
  }

  try {
    const response = await axios.post(
      "https://www.bungie.net/Platform/User/Search/GlobalName/0/",
      { displayNamePrefix: query },
      {
        headers: {
          "X-API-Key": getBungieApiKey(),
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      "❌ Bungie Search API failed:",
      err.response?.data || err.message
    );
    return res.status(500).json({ error: "Failed to search Bungie users" });
  }
}
