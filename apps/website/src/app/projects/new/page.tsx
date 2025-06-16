import { auth } from "@mvp/auth/server";
import { redirect } from "next/navigation";
import { NewProjectForm } from "./new-project-form";

export default async function NewProjectPage() {
  const session = await auth.api.getSession({
    headers: new Headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Create a new project to organize your videos
          </p>
        </div>

        <NewProjectForm userId={session.user.id} />
      </div>
    </div>
  );
}
