import { Box, Link } from "@mui/material";

const Logo = () => {
  return (
    <Link href="/">
      <Box sx={{ mb: 2 }}>
        <img width="100%" src="./df-color.svg" />
      </Box>
    </Link>
  );
};

export default Logo;
