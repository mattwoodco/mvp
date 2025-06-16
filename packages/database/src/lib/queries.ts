import { eq } from "drizzle-orm";
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

// Campaign queries
export async function getCampaignById(id: string) {
  const [result] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id));
  return result;
}

export async function getCampaignsByUserId(userId: string) {
  return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
}

export async function getAssetsByCampaignId(campaignId: string) {
  return await db
    .select()
    .from(assets)
    .where(eq(assets.campaignId, campaignId));
}

export async function getAssetById(id: string) {
  const [result] = await db.select().from(assets).where(eq(assets.id, id));
  return result;
}

export async function getSegments() {
  return await db.select().from(segments);
}

export async function getSegmentById(id: string) {
  const [result] = await db.select().from(segments).where(eq(segments.id, id));
  return result;
}

export async function getPlacementsByCampaignId(campaignId: string) {
  return await db
    .select({
      id: placements.id,
      campaignId: placements.campaignId,
      segmentId: placements.segmentId,
      assetId: placements.assetId,
      bidCents: placements.bidCents,
      scheduleJson: placements.scheduleJson,
      platformPlacements: placements.platformPlacements,
      status: placements.status,
      createdAt: placements.createdAt,
      segmentName: segments.name,
      assetUrl: assets.url,
    })
    .from(placements)
    .leftJoin(segments, eq(placements.segmentId, segments.id))
    .leftJoin(assets, eq(placements.assetId, assets.id))
    .where(eq(placements.campaignId, campaignId));
}

export async function getPlacementById(id: string) {
  const [result] = await db
    .select({
      id: placements.id,
      campaignId: placements.campaignId,
      segmentId: placements.segmentId,
      assetId: placements.assetId,
      bidCents: placements.bidCents,
      scheduleJson: placements.scheduleJson,
      platformPlacements: placements.platformPlacements,
      status: placements.status,
      createdAt: placements.createdAt,
      segmentName: segments.name,
      assetUrl: assets.url,
    })
    .from(placements)
    .leftJoin(segments, eq(placements.segmentId, segments.id))
    .leftJoin(assets, eq(placements.assetId, assets.id))
    .where(eq(placements.id, id));
  return result;
}

export async function getStatsByPlacementId(placementId: string) {
  return await db
    .select()
    .from(stats)
    .where(eq(stats.placementId, placementId));
}

export async function getEventsByPlacementId(placementId: string) {
  return await db
    .select()
    .from(events)
    .where(eq(events.placementId, placementId));
}

export async function getBillingByUserId(userId: string) {
  return await db.select().from(billing).where(eq(billing.userId, userId));
}

// CRM/Sales queries
export async function getCompanies() {
  return await db.select().from(companies);
}

export async function getCompanyById(id: string) {
  const [result] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id));
  return result;
}

export async function getContactsByCompanyId(companyId: string) {
  return await db
    .select()
    .from(contacts)
    .where(eq(contacts.companyId, companyId));
}

export async function getContactById(id: string) {
  const [result] = await db
    .select({
      id: contacts.id,
      companyId: contacts.companyId,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      phone: contacts.phone,
      jobTitle: contacts.jobTitle,
      linkedinUrl: contacts.linkedinUrl,
      createdAt: contacts.createdAt,
      companyName: companies.name,
    })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .where(eq(contacts.id, id));
  return result;
}

export async function getLeadsByOwnerId(ownerId: string) {
  return await db
    .select({
      id: leads.id,
      contactId: leads.contactId,
      source: leads.source,
      utmJson: leads.utmJson,
      status: leads.status,
      ownerId: leads.ownerId,
      capturedAt: leads.capturedAt,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
      contactEmail: contacts.email,
    })
    .from(leads)
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .where(eq(leads.ownerId, ownerId));
}

export async function getLeadById(id: string) {
  const [result] = await db
    .select({
      id: leads.id,
      contactId: leads.contactId,
      source: leads.source,
      utmJson: leads.utmJson,
      status: leads.status,
      ownerId: leads.ownerId,
      capturedAt: leads.capturedAt,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
      contactEmail: contacts.email,
      ownerName: user.name,
    })
    .from(leads)
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .leftJoin(user, eq(leads.ownerId, user.id))
    .where(eq(leads.id, id));
  return result;
}

export async function getEnrichmentsByEntityId(
  entityType: "contact" | "company",
  entityId: string,
) {
  return await db
    .select()
    .from(enrichments)
    .where(eq(enrichments.entityId, entityId))
    .where(eq(enrichments.entityType, entityType));
}

export async function getPipelineStages() {
  return await db.select().from(pipelineStages).orderBy(pipelineStages.order);
}

export async function getDealsByOwnerId(ownerId: string) {
  return await db
    .select({
      id: deals.id,
      companyId: deals.companyId,
      primaryContactId: deals.primaryContactId,
      pipelineStageId: deals.pipelineStageId,
      valueCents: deals.valueCents,
      currency: deals.currency,
      expectedCloseDate: deals.expectedCloseDate,
      ownerId: deals.ownerId,
      createdAt: deals.createdAt,
      companyName: companies.name,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
      stageName: pipelineStages.name,
      stageOrder: pipelineStages.order,
    })
    .from(deals)
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .leftJoin(contacts, eq(deals.primaryContactId, contacts.id))
    .leftJoin(pipelineStages, eq(deals.pipelineStageId, pipelineStages.id))
    .where(eq(deals.ownerId, ownerId));
}

export async function getDealById(id: string) {
  const [result] = await db
    .select({
      id: deals.id,
      companyId: deals.companyId,
      primaryContactId: deals.primaryContactId,
      pipelineStageId: deals.pipelineStageId,
      valueCents: deals.valueCents,
      currency: deals.currency,
      expectedCloseDate: deals.expectedCloseDate,
      ownerId: deals.ownerId,
      createdAt: deals.createdAt,
      companyName: companies.name,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
      stageName: pipelineStages.name,
      stageOrder: pipelineStages.order,
      ownerName: user.name,
    })
    .from(deals)
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .leftJoin(contacts, eq(deals.primaryContactId, contacts.id))
    .leftJoin(pipelineStages, eq(deals.pipelineStageId, pipelineStages.id))
    .leftJoin(user, eq(deals.ownerId, user.id))
    .where(eq(deals.id, id));
  return result;
}

export async function getActivitiesByDealId(dealId: string) {
  return await db
    .select({
      id: activities.id,
      dealId: activities.dealId,
      contactId: activities.contactId,
      type: activities.type,
      subject: activities.subject,
      body: activities.body,
      dueAt: activities.dueAt,
      completedAt: activities.completedAt,
      ownerId: activities.ownerId,
      createdAt: activities.createdAt,
      ownerName: user.name,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
    })
    .from(activities)
    .leftJoin(user, eq(activities.ownerId, user.id))
    .leftJoin(contacts, eq(activities.contactId, contacts.id))
    .where(eq(activities.dealId, dealId));
}

export async function getActivitiesByContactId(contactId: string) {
  return await db
    .select({
      id: activities.id,
      dealId: activities.dealId,
      contactId: activities.contactId,
      type: activities.type,
      subject: activities.subject,
      body: activities.body,
      dueAt: activities.dueAt,
      completedAt: activities.completedAt,
      ownerId: activities.ownerId,
      createdAt: activities.createdAt,
      ownerName: user.name,
    })
    .from(activities)
    .leftJoin(user, eq(activities.ownerId, user.id))
    .where(eq(activities.contactId, contactId));
}
