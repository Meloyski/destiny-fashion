"use client";
export const dynamic = "force-dynamic";

import { Container } from "@mui/material";
import PlayerSearchAutocomplete from "@/components/PlayerSearchAutocomplete";
import Logo from "@/components/Logo";
import { Suspense } from "react";

const HomePage = () => {
  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Logo />
      <Suspense fallback={null}>
        <PlayerSearchAutocomplete />
      </Suspense>
    </Container>
  );
};

export default HomePage;
