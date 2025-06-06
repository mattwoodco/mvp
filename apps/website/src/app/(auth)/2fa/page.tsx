"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TwoFactorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1>Two-Factor Authentication</h1>
        <p>2FA verification page</p>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TwoFactorContent />
    </Suspense>
  );
}
