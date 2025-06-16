import { auth } from "@mvp/auth/server";
import { getProjectById } from "@mvp/database";
import { notFound, redirect } from "next/navigation";
import { VideoUploadForm } from "./video-upload-form";

interface NewVideoPageProps {
  params: { id: string };
}

export default async function NewVideoPage({ params }: NewVideoPageProps) {
  const session = await auth.api.getSession({
    headers: new Headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
        <p className="text-muted-foreground">
          Upload a video to {project.name}
        </p>
      </div>

      <VideoUploadForm projectId={params.id} userId={session.user.id} />
    </div>
  );
}
