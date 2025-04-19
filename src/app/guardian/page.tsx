import GuardianPage from "./Guardian";

const Page = async () => {
  const { preloadManifest } = await import("@/lib/manifestBootstrap");
  await preloadManifest();

  return <GuardianPage />;
};

export default Page;
