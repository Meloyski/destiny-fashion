import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getBungieConfig } from "@/lib/bungie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: "Missing Bungie auth code" });
  }

  const { clientId, clientSecret } = getBungieConfig();

  if (!clientId || !clientSecret) {
    return res
      .status(500)
      .json({ error: "Missing Bungie credentials in environment." });
  }

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenResponse = await axios.post(
      "https://www.bungie.net/Platform/App/OAuth/Token/",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;
    console.log("🎟️ Access token received:", access_token);

    // Redirect to dashboard with safe URL-encoded token
    res.redirect(`/dashboard?access_token=${encodeURIComponent(access_token)}`);
  } catch (err: unknown) {
    const error = err as { response?: { data?: unknown }; message?: string };
    console.error(
      "❌ Bungie token exchange failed:",
      error.response?.data ?? error.message ?? err
    );
    return res
      .status(500)
      .json({ error: "Failed to authenticate with Bungie" });
  }
}
