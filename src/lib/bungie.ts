export const getBungieConfig = () => ({
  clientId: process.env.BUNGIE_CLIENT_ID,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET,
  redirectUri: process.env.BUNGIE_REDIRECT_URI,
});

export const getBungieApiKey = () => process.env.NEXT_PUBLIC_BUNGIE_API_KEY;
