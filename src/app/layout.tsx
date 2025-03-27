import ThemeRegistry from "@/components/ThemeRegistry";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Destiny Fashion",
  description: "Explore and share Destiny fashion loadouts",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = async ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
