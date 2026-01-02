"use client";

import { ColorModeProvider } from "@/theme/ColorModeContext";
import { DM_Sans } from "next/font/google";

import { loadManifest } from "@/lib/manifestCache";
import { Analytics } from "@vercel/analytics/next";
import NavBar from "@/components/NavBar";

loadManifest()
  .then(() => console.log("✅ Manifest preloaded"))
  .catch((err) => console.error("❌ Manifest failed to preload", err));

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <ColorModeProvider>
          <NavBar />
          {children}
        </ColorModeProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
