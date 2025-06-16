import { eq } from "drizzle-orm";
import { db } from "../client";
import { listing, project, projectMember, user, video } from "../schema";

export async function getUsers() {
  return await db.select().from(user);
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(user).where(eq(user.id, id));
  return result;
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(user).where(eq(user.email, email));
  return result;
}

export async function getListings() {
  return await db.select().from(listing).where(eq(listing.isActive, true));
}

export async function getListingById(id: string) {
  const [result] = await db.select().from(listing).where(eq(listing.id, id));
  return result;
}

// Project queries
export async function getProjectById(id: string) {
  const [result] = await db.select().from(project).where(eq(project.id, id));
  return result;
}

export async function getProjectsByUserId(userId: string) {
  return await db
    .select({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      role: projectMember.role,
    })
    .from(project)
    .leftJoin(projectMember, eq(project.id, projectMember.projectId))
    .where(eq(projectMember.userId, userId));
}

export async function getProjectMembers(projectId: string) {
  return await db
    .select({
      id: projectMember.id,
      userId: projectMember.userId,
      role: projectMember.role,
      createdAt: projectMember.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(projectMember)
    .leftJoin(user, eq(projectMember.userId, user.id))
    .where(eq(projectMember.projectId, projectId));
}

// Video queries
export async function getVideoById(id: string) {
  const [result] = await db
    .select({
      id: video.id,
      projectId: video.projectId,
      title: video.title,
      description: video.description,
      originalUrl: video.originalUrl,
      transcodedUrl: video.transcodedUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      fileSize: video.fileSize,
      status: video.status,
      errorMessage: video.errorMessage,
      uploadedBy: video.uploadedBy,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      uploaderName: user.name,
    })
    .from(video)
    .leftJoin(user, eq(video.uploadedBy, user.id))
    .where(eq(video.id, id));
  return result;
}

export async function getVideosByProjectId(projectId: string) {
  return await db
    .select({
      id: video.id,
      title: video.title,
      description: video.description,
      originalUrl: video.originalUrl,
      transcodedUrl: video.transcodedUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      fileSize: video.fileSize,
      status: video.status,
      errorMessage: video.errorMessage,
      uploadedBy: video.uploadedBy,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      uploaderName: user.name,
    })
    .from(video)
    .leftJoin(user, eq(video.uploadedBy, user.id))
    .where(eq(video.projectId, projectId));
}
