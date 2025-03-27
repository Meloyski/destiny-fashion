import axios from "axios";
import { getBungieApiKey } from "./bungie";

let itemDefs: Record<string, any> | null = null;

export const loadManifest = async () => {
  if (itemDefs) return; // already loaded

  console.log("Fetching Destiny Manifest index...");

  const manifestRes = await axios.get(
    "https://www.bungie.net/Platform/Destiny2/Manifest/",
    {
      headers: {
        "X-API-Key": getBungieApiKey()!,
      },
    }
  );

  const path =
    manifestRes.data.Response.jsonWorldComponentContentPaths.en
      .DestinyInventoryItemDefinition;
  const fullUrl = `https://www.bungie.net${path}`;

  console.log(
    "Downloading full DestinyInventoryItemDefinition JSON from:",
    fullUrl
  );

  const definitionRes = await axios.get(fullUrl);
  itemDefs = definitionRes.data;

  console.log(
    "Manifest loaded into memory with",
    itemDefs ? Object.keys(itemDefs).length : 0,
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
    console.warn("Item not found in manifest:", itemHash);
  }

  return def ?? null;
};
