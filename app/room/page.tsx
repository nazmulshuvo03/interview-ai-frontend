"use client";

import { Suspense } from "react";
import PageClient from "./PageClient";

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading room...</div>}>
      <PageClient />
    </Suspense>
  );
}
