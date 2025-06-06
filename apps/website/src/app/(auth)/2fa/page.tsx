"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function TwoFactorPage() {
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
