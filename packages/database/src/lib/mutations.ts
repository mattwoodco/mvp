import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { listing, project, projectMember, user, video } from "../schema";

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
}) {
  const now = new Date();
  const [newUser] = await db
    .insert(user)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return newUser;
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    emailVerified: boolean;
    image: string;
  }>,
) {
  const [updatedUser] = await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning();
  return updatedUser;
}

export async function deleteUser(id: string) {
  await db.delete(user).where(eq(user.id, id));
}

export async function createListing(data: {
  id: string;
  title: string;
  description?: string;
  price: string;
  userId: string;
}) {
  const now = new Date();
  const [newListing] = await db
    .insert(listing)
    .values({
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return newListing;
}

export async function updateListing(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    price: string;
    isActive: boolean;
  }>,
) {
  const [updatedListing] = await db
    .update(listing)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(listing.id, id))
    .returning();
  return updatedListing;
}

export async function deleteListing(id: string) {
  await db.delete(listing).where(eq(listing.id, id));
}

// Project mutations
export async function createProject(data: {
  name: string;
  description?: string;
  ownerId: string;
}) {
  const now = new Date();
  const [newProject] = await db
    .insert(project)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!newProject) {
    throw new Error("Failed to create project");
  }

  // Add owner as project member
  await db.insert(projectMember).values({
    projectId: newProject.id,
    userId: data.ownerId,
    role: "owner",
  });

  return newProject;
}

export async function updateProject(
  id: string,
  data: Partial<{
    name: string;
    description: string;
  }>,
) {
  const [updatedProject] = await db
    .update(project)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(project.id, id))
    .returning();
  return updatedProject;
}

export async function deleteProject(id: string) {
  await db.delete(project).where(eq(project.id, id));
}

export async function addProjectMember(data: {
  projectId: string;
  userId: string;
  role?: "admin" | "member";
}) {
  const [newMember] = await db
    .insert(projectMember)
    .values({
      ...data,
      role: data.role || "member",
    })
    .returning();
  return newMember;
}

export async function removeProjectMember(projectId: string, userId: string) {
  await db
    .delete(projectMember)
    .where(
      and(
        eq(projectMember.projectId, projectId),
        eq(projectMember.userId, userId),
      ),
    );
}

// Video mutations
export async function createVideo(data: {
  projectId: string;
  title: string;
  description?: string;
  originalUrl?: string;
  uploadedBy: string;
}) {
  const now = new Date();
  const [newVideo] = await db
    .insert(video)
    .values({
      ...data,
      status: "uploading",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return newVideo;
}

export async function updateVideo(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    originalUrl: string;
    transcodedUrl: string;
    thumbnailUrl: string;
    duration: string;
    fileSize: string;
    status: "uploading" | "processing" | "ready" | "error";
    errorMessage: string;
  }>,
) {
  const [updatedVideo] = await db
    .update(video)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(video.id, id))
    .returning();
  return updatedVideo;
}

export async function deleteVideo(id: string) {
  await db.delete(video).where(eq(video.id, id));
}
