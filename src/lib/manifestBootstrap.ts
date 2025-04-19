import { loadManifest } from "./manifestCache";

// Called once on app boot/server init
export const preloadManifest = async () => {
  try {
    await loadManifest();
    console.log("✅ Manifest preloaded on server");
  } catch (err) {
    console.error("❌ Failed to preload manifest on server:", err);
  }
};
