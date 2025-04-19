"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import GuardianPage from "./Guardian";

const GuardianPageWrapper = () => {
  return (
    <Suspense fallback={null}>
      <GuardianPage />
    </Suspense>
  );
};

export default GuardianPageWrapper;
