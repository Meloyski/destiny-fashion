"use client";
export const dynamic = "force-dynamic";
import { Container } from "@mui/material";
import { Suspense } from "react";

const HomePage = () => {
  return (
    <Container>
      <Suspense fallback={null}></Suspense>
    </Container>
  );
};

export default HomePage;
