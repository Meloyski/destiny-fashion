import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import { getBungieApiKey } from "@/lib/bungie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { membershipId, membershipType } = req.query;

  if (
    !membershipId ||
    !membershipType ||
    Array.isArray(membershipId) ||
    Array.isArray(membershipType)
  ) {
    return res
      .status(400)
      .json({ error: "Missing or invalid membership info" });
  }

  try {
    const bungieRes = await axios.get(
      `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200`,
      {
        headers: { "X-API-Key": getBungieApiKey() },
      }
    );

    return res.status(200).json(bungieRes.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "❌ Bungie profile fetch failed:",
      axiosError.response?.data ?? axiosError.message
    );
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
}
