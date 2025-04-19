import { Box, Link } from "@mui/material";
import Image from "next/image";

const Logo = () => {
  return (
    <Link href="/" underline="none">
      <Box sx={{ mb: 2 }}>
        <Image
          src="/df-color.svg"
          alt="Destiny Fashion logo"
          width={200}
          height={60}
          style={{ width: "100%", height: "auto" }}
        />
      </Box>
    </Link>
  );
};

export default Logo;
