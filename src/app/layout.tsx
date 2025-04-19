"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/theme";
import { DM_Sans } from "next/font/google";

import { loadManifest } from "@/lib/manifestCache";

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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
