import { and, eq } from "drizzle-orm";
import { db } from "../client";
import {
  events,
  activities,
  assets,
  billing,
  campaigns,
  companies,
  contacts,
  deals,
  enrichments,
  leads,
  listing,
  pipelineStages,
  placements,
  project,
  projectMember,
  segments,
  stats,
  user,
  video,
} from "../schema";

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

// Campaign mutations
export async function createCampaign(data: {
  id: string;
  userId: string;
  name: string;
  budgetCents: number;
  startDate?: string;
  endDate?: string;
}) {
  const [newCampaign] = await db.insert(campaigns).values(data).returning();
  return newCampaign;
}

export async function updateCampaign(
  id: string,
  data: Partial<{
    name: string;
    budgetCents: number;
    status: "draft" | "active" | "paused" | "completed" | "cancelled";
    startDate: string;
    endDate: string;
  }>,
) {
  const [updatedCampaign] = await db
    .update(campaigns)
    .set(data)
    .where(eq(campaigns.id, id))
    .returning();
  return updatedCampaign;
}

export async function deleteCampaign(id: string) {
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

export async function createAsset(data: {
  id: string;
  campaignId: string;
  url: string;
  thumbnailUrl?: string;
  durationSec?: number;
  format?: "mp4" | "mov" | "avi" | "gif" | "jpg" | "png";
  checksum?: string;
}) {
  const [newAsset] = await db.insert(assets).values(data).returning();
  return newAsset;
}

export async function updateAsset(
  id: string,
  data: Partial<{
    url: string;
    thumbnailUrl: string;
    durationSec: number;
    format: "mp4" | "mov" | "avi" | "gif" | "jpg" | "png";
    checksum: string;
  }>,
) {
  const [updatedAsset] = await db
    .update(assets)
    .set(data)
    .where(eq(assets.id, id))
    .returning();
  return updatedAsset;
}

export async function deleteAsset(id: string) {
  await db.delete(assets).where(eq(assets.id, id));
}

export async function createSegment(data: {
  id: string;
  name: string;
  geoJson?: any;
  ageMin?: number;
  ageMax?: number;
  interestsJson?: any;
  platforms?: any;
}) {
  const [newSegment] = await db.insert(segments).values(data).returning();
  return newSegment;
}

export async function updateSegment(
  id: string,
  data: Partial<{
    name: string;
    geoJson: any;
    ageMin: number;
    ageMax: number;
    interestsJson: any;
    platforms: any;
  }>,
) {
  const [updatedSegment] = await db
    .update(segments)
    .set(data)
    .where(eq(segments.id, id))
    .returning();
  return updatedSegment;
}

export async function deleteSegment(id: string) {
  await db.delete(segments).where(eq(segments.id, id));
}

export async function createPlacement(data: {
  id: string;
  campaignId: string;
  segmentId: string;
  assetId: string;
  bidCents: number;
  scheduleJson?: any;
  platformPlacements?: any;
}) {
  const [newPlacement] = await db.insert(placements).values(data).returning();
  return newPlacement;
}

export async function updatePlacement(
  id: string,
  data: Partial<{
    bidCents: number;
    scheduleJson: any;
    platformPlacements: any;
    status: "active" | "paused" | "completed" | "cancelled";
  }>,
) {
  const [updatedPlacement] = await db
    .update(placements)
    .set(data)
    .where(eq(placements.id, id))
    .returning();
  return updatedPlacement;
}

export async function deletePlacement(id: string) {
  await db.delete(placements).where(eq(placements.id, id));
}

export async function createStats(data: {
  id: string;
  placementId: string;
  date: string;
  impressions?: number;
  views?: number;
  clicks?: number;
  conversions?: number;
  costCents?: number;
}) {
  const [newStats] = await db.insert(stats).values(data).returning();
  return newStats;
}

export async function updateStats(
  placementId: string,
  date: string,
  data: Partial<{
    impressions: number;
    views: number;
    clicks: number;
    conversions: number;
    costCents: number;
  }>,
) {
  const [updatedStats] = await db
    .update(stats)
    .set(data)
    .where(and(eq(stats.placementId, placementId), eq(stats.date, date)))
    .returning();
  return updatedStats;
}

export async function createEvent(data: {
  id: string;
  placementId: string;
  eventType:
    | "impression"
    | "view"
    | "click"
    | "conversion"
    | "watch_25"
    | "watch_50"
    | "watch_75"
    | "watch_100";
  videoTimeMs?: number;
  userAgent?: string;
  geoIp?: string;
}) {
  const [newEvent] = await db.insert(events).values(data).returning();
  return newEvent;
}

export async function createBilling(data: {
  id: string;
  userId: string;
  amountCents: number;
  currency?: string;
  txnType: "charge" | "credit" | "refund";
  externalTxnId?: string;
}) {
  const [newBilling] = await db.insert(billing).values(data).returning();
  return newBilling;
}

// CRM/Sales mutations
export async function createCompany(data: {
  id: string;
  name: string;
  website?: string;
  domain?: string;
  industry?: string;
  employeeCount?: number;
}) {
  const [newCompany] = await db.insert(companies).values(data).returning();
  return newCompany;
}

export async function updateCompany(
  id: string,
  data: Partial<{
    name: string;
    website: string;
    domain: string;
    industry: string;
    employeeCount: number;
  }>,
) {
  const [updatedCompany] = await db
    .update(companies)
    .set(data)
    .where(eq(companies.id, id))
    .returning();
  return updatedCompany;
}

export async function deleteCompany(id: string) {
  await db.delete(companies).where(eq(companies.id, id));
}

export async function createContact(data: {
  id: string;
  companyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  linkedinUrl?: string;
}) {
  const [newContact] = await db.insert(contacts).values(data).returning();
  return newContact;
}

export async function updateContact(
  id: string,
  data: Partial<{
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    linkedinUrl: string;
  }>,
) {
  const [updatedContact] = await db
    .update(contacts)
    .set(data)
    .where(eq(contacts.id, id))
    .returning();
  return updatedContact;
}

export async function deleteContact(id: string) {
  await db.delete(contacts).where(eq(contacts.id, id));
}

export async function createLead(data: {
  id: string;
  contactId?: string;
  source?: string;
  utmJson?: any;
  status?: "new" | "working" | "disqualified";
  ownerId?: string;
}) {
  const [newLead] = await db.insert(leads).values(data).returning();
  return newLead;
}

export async function updateLead(
  id: string,
  data: Partial<{
    contactId: string;
    source: string;
    utmJson: any;
    status: "new" | "working" | "disqualified";
    ownerId: string;
  }>,
) {
  const [updatedLead] = await db
    .update(leads)
    .set(data)
    .where(eq(leads.id, id))
    .returning();
  return updatedLead;
}

export async function deleteLead(id: string) {
  await db.delete(leads).where(eq(leads.id, id));
}

export async function createEnrichment(data: {
  id: string;
  entityType: "contact" | "company";
  entityId: string;
  provider: string;
  dataJson?: any;
  confidence?: number;
}) {
  const [newEnrichment] = await db.insert(enrichments).values(data).returning();
  return newEnrichment;
}

export async function updateEnrichment(
  id: string,
  data: Partial<{
    dataJson: any;
    confidence: number;
  }>,
) {
  const [updatedEnrichment] = await db
    .update(enrichments)
    .set(data)
    .where(eq(enrichments.id, id))
    .returning();
  return updatedEnrichment;
}

export async function createPipelineStage(data: {
  id: string;
  name: string;
  order: number;
  isClosedWon?: boolean;
  isClosedLost?: boolean;
}) {
  const [newStage] = await db.insert(pipelineStages).values(data).returning();
  return newStage;
}

export async function updatePipelineStage(
  id: string,
  data: Partial<{
    name: string;
    order: number;
    isClosedWon: boolean;
    isClosedLost: boolean;
  }>,
) {
  const [updatedStage] = await db
    .update(pipelineStages)
    .set(data)
    .where(eq(pipelineStages.id, id))
    .returning();
  return updatedStage;
}

export async function deletePipelineStage(id: string) {
  await db.delete(pipelineStages).where(eq(pipelineStages.id, id));
}

export async function createDeal(data: {
  id: string;
  companyId?: string;
  primaryContactId?: string;
  pipelineStageId: string;
  valueCents?: number;
  currency?: string;
  expectedCloseDate?: Date;
  ownerId?: string;
}) {
  const [newDeal] = await db.insert(deals).values(data).returning();
  return newDeal;
}

export async function updateDeal(
  id: string,
  data: Partial<{
    companyId: string;
    primaryContactId: string;
    pipelineStageId: string;
    valueCents: number;
    currency: string;
    expectedCloseDate: Date;
    ownerId: string;
  }>,
) {
  const [updatedDeal] = await db
    .update(deals)
    .set(data)
    .where(eq(deals.id, id))
    .returning();
  return updatedDeal;
}

export async function deleteDeal(id: string) {
  await db.delete(deals).where(eq(deals.id, id));
}

export async function createActivity(data: {
  id: string;
  dealId?: string;
  contactId?: string;
  type: "call" | "email" | "note" | "task";
  subject?: string;
  body?: string;
  dueAt?: Date;
  completedAt?: Date;
  ownerId?: string;
}) {
  const [newActivity] = await db.insert(activities).values(data).returning();
  return newActivity;
}

export async function updateActivity(
  id: string,
  data: Partial<{
    subject: string;
    body: string;
    dueAt: Date;
    completedAt: Date;
  }>,
) {
  const [updatedActivity] = await db
    .update(activities)
    .set(data)
    .where(eq(activities.id, id))
    .returning();
  return updatedActivity;
}

export async function deleteActivity(id: string) {
  await db.delete(activities).where(eq(activities.id, id));
}
