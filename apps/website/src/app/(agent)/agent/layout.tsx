import { auth } from "@money/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("[Agent Layout] Session check:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
  });

  if (!session?.user) {
    redirect("/login?from=/agent");
  }

  return <>{children}</>;
}
