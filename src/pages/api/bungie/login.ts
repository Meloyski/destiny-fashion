import type { NextApiRequest, NextApiResponse } from "next";
import { getBungieConfig } from "@/lib/bungie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { clientId, redirectUri } = getBungieConfig();

  const authUrl = `https://www.bungie.net/en/OAuth/Authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri!
  )}`;

  res.redirect(authUrl);
}
