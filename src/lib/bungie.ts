export const getBungieConfig = () => ({
  clientId: process.env.BUNGIE_CLIENT_ID,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET,
  redirectUri: process.env.BUNGIE_REDIRECT_URI,
});

// Prefer the server-only key, but fall back to NEXT_PUBLIC for backwards compatibility.
export const getBungieApiKey = () =>
  process.env.BUNGIE_API_KEY || process.env.NEXT_PUBLIC_BUNGIE_API_KEY;
