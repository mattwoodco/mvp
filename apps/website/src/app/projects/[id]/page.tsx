import { auth } from "@mvp/auth/server";
import { getProjectById, getVideosByProjectId } from "@mvp/database";
import { Badge } from "@mvp/ui/badge";
import { Button } from "@mvp/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@mvp/ui/card";
import { Clock, FileVideo, Play, Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface ProjectPageProps {
  params: { id: string };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const videos = await getVideosByProjectId(params.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mb-4">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <span>{videos.length} videos</span>
          </div>
        </div>
        <Link href={`/projects/${params.id}/videos/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </Link>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first video to get started
              </p>
              <Link href={`/projects/${params.id}/videos/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {video.status === "ready" && video.transcodedUrl && (
                  <Link href={`/projects/${params.id}/videos/${video.id}`}>
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-colors flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">
                    {video.title}
                  </CardTitle>
                  <Badge className={getStatusColor(video.status)}>
                    {video.status}
                  </Badge>
                </div>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {video.duration || "Unknown"}
                  </span>
                  <span>{video.uploaderName}</span>
                </div>
                {video.status === "error" && video.errorMessage && (
                  <p className="text-sm text-red-600 mt-2">
                    {video.errorMessage}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
