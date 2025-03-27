export const getBungieConfig = () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    clientId: isProd
      ? process.env.BUNGIE_CLIENT_ID
      : process.env.BUNGIE_CLIENT_ID_LOCAL,
    clientSecret: isProd
      ? process.env.BUNGIE_CLIENT_SECRET
      : process.env.BUNGIE_CLIENT_SECRET_LOCAL,
    redirectUri: isProd
      ? process.env.BUNGIE_REDIRECT_URI
      : process.env.BUNGIE_REDIRECT_URI_LOCAL,
  };
};

export const getBungieApiKey = () => {
  return process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_BUNGIE_API_KEY_LOCAL
    : process.env.NEXT_PUBLIC_BUNGIE_API_KEY;
};

console.log("Using API key:", getBungieApiKey());
