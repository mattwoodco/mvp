import { auth } from "@mvp/auth/server";
import { getProjectById, getVideoById } from "@mvp/database";
import { Badge } from "@mvp/ui/badge";
import { Button } from "@mvp/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@mvp/ui/card";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface VideoPageProps {
  params: { id: string; videoId: string };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const session = await auth.api.getSession({
    headers: new Headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const [video, project] = await Promise.all([
    getVideoById(params.videoId),
    getProjectById(params.id),
  ]);

  if (!video || !project) {
    notFound();
  }

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
      <div className="mb-6">
        <Link href={`/projects/${params.id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {project.name}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {video.status === "ready" && video.transcodedUrl ? (
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  <video
                    src={video.transcodedUrl}
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    <track kind="captions" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <Badge className={getStatusColor(video.status)}>
                      {video.status}
                    </Badge>
                    <p className="text-muted-foreground mt-2">
                      {video.status === "processing" &&
                        "Video is being processed..."}
                      {video.status === "uploading" && "Video is uploading..."}
                      {video.status === "error" && "Error processing video"}
                    </p>
                    {video.errorMessage && (
                      <p className="text-red-600 text-sm mt-1">
                        {video.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold">{video.title}</h1>
                  <Badge className={getStatusColor(video.status)}>
                    {video.status}
                  </Badge>
                </div>

                {video.description && (
                  <p className="text-muted-foreground mb-4">
                    {video.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {video.duration && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {video.duration}
                    </span>
                  )}
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {video.uploaderName || "Unknown"}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">Title</div>
                <p className="text-sm text-muted-foreground">{video.title}</p>
              </div>

              {video.description && (
                <div>
                  <div className="text-sm font-medium">Description</div>
                  <p className="text-sm text-muted-foreground">
                    {video.description}
                  </p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium">Status</div>
                <div className="mt-1">
                  <Badge className={getStatusColor(video.status)}>
                    {video.status}
                  </Badge>
                </div>
              </div>

              {video.fileSize && (
                <div>
                  <div className="text-sm font-medium">File Size</div>
                  <p className="text-sm text-muted-foreground">
                    {video.fileSize}
                  </p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium">Uploaded</div>
                <p className="text-sm text-muted-foreground">
                  {new Date(video.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <div className="text-sm font-medium">Uploaded by</div>
                <p className="text-sm text-muted-foreground">
                  {video.uploaderName || "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
