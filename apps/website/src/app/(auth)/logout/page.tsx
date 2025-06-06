import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
  try {
    const { auth } = await import("@mvp/auth");
    await auth.api.signOut({
      headers: {
        cookie: (await cookies()).toString(),
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  redirect("/login");
}
