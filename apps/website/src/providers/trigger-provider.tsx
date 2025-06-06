"use client";

import { TriggerProvider } from "@trigger.dev/react";

export function TriggerDevProvider({ children }: { children: React.ReactNode }) {
  return (
    <TriggerProvider
      publicApiKey={process.env.NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY ?? ""}
      apiUrl={process.env.TRIGGER_API_URL}
    >
      {children}
    </TriggerProvider>
  );
}