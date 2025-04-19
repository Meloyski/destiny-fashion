import axios from "axios";
import { getBungieApiKey } from "./bungie";

let itemDefs: Record<string, any> | null = null;

export const loadManifest = async () => {
  if (itemDefs) return;

  console.log("📦 Fetching Destiny Manifest index...");

  const manifestRes = await axios.get(
    "https://www.bungie.net/Platform/Destiny2/Manifest/",
    {
      headers: {
        "X-API-Key": getBungieApiKey(),
      },
    }
  );

  const path =
    manifestRes.data.Response.jsonWorldComponentContentPaths.en
      .DestinyInventoryItemDefinition;
  const fullUrl = `https://www.bungie.net${path}`;

  console.log(
    "⬇️ Downloading full DestinyInventoryItemDefinition from:",
    fullUrl
  );

  const definitionRes = await axios.get(fullUrl);
  itemDefs = definitionRes.data;

  console.log(
    "✅ Manifest loaded with",
    Object.keys(itemDefs ?? {}).length,
    "items"
  );
};

export const getItemDefinition = async (
  itemHash: number
): Promise<any | null> => {
  await loadManifest();
  const key = String(itemHash);
  const def = itemDefs?.[key];

  if (!def) {
    console.warn("❌ Item not found in manifest:", itemHash);
  }

  return def ?? null;
};

export const getSocketPlug = async (plugHash: number): Promise<any | null> => {
  await loadManifest();
  const key = String(plugHash);
  const plug = itemDefs?.[key];

  if (!plug) {
    console.warn("❌ Plug not found in manifest:", plugHash);
  }

  return plug ?? null;
};

export const preloadManifest = async () => {
  await loadManifest();
  console.log("✅ Manifest preloaded");
};
