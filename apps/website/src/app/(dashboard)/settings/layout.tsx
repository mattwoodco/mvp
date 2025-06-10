import { auth } from "@chatmtv/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("[Settings Layout] Session check:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
  });

  if (!session?.user) {
    redirect("/login?from=/settings");
  }

  return <>{children}</>;
}
