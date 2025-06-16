import { unstable_cache } from "next/cache";
import {
  getActivitiesByContactId,
  getActivitiesByDealId,
  getAssetsByCampaignId,
  getBillingByUserId,
  getCampaignById,
  getCampaignsByUserId,
  getCompanies,
  getCompanyById,
  getContactById,
  getContactsByCompanyId,
  getDealById,
  getDealsByOwnerId,
  getLeadById,
  getLeadsByOwnerId,
  getListingById,
  getListings,
  getPipelineStages,
  getPlacementsByCampaignId,
  getSegments,
  getStatsByPlacementId,
  getUserById,
  getUsers,
} from "./queries";

export const getCachedUsers = unstable_cache(
  async () => getUsers(),
  ["users"],
  { revalidate: 60 },
);

export const getCachedUserById = unstable_cache(
  async (id: string) => getUserById(id),
  ["user-by-id"],
  { revalidate: 60 },
);

export const getCachedListings = unstable_cache(
  async () => getListings(),
  ["listings"],
  { revalidate: 60 },
);

export const getCachedListingById = unstable_cache(
  async (id: string) => getListingById(id),
  ["listing-by-id"],
  { revalidate: 60 },
);

export const getCachedCampaignById = unstable_cache(
  async (id: string) => getCampaignById(id),
  ["campaign-by-id"],
  { revalidate: 60 },
);

export const getCachedCampaignsByUserId = unstable_cache(
  async (userId: string) => getCampaignsByUserId(userId),
  ["campaigns-by-user"],
  { revalidate: 60 },
);

export const getCachedAssetsByCampaignId = unstable_cache(
  async (campaignId: string) => getAssetsByCampaignId(campaignId),
  ["assets-by-campaign"],
  { revalidate: 60 },
);

export const getCachedSegments = unstable_cache(
  async () => getSegments(),
  ["segments"],
  { revalidate: 300 },
);

export const getCachedPlacementsByCampaignId = unstable_cache(
  async (campaignId: string) => getPlacementsByCampaignId(campaignId),
  ["placements-by-campaign"],
  { revalidate: 60 },
);

export const getCachedStatsByPlacementId = unstable_cache(
  async (placementId: string) => getStatsByPlacementId(placementId),
  ["stats-by-placement"],
  { revalidate: 300 },
);

export const getCachedBillingByUserId = unstable_cache(
  async (userId: string) => getBillingByUserId(userId),
  ["billing-by-user"],
  { revalidate: 60 },
);

// CRM/Sales cached queries
export const getCachedCompanies = unstable_cache(
  async () => getCompanies(),
  ["companies"],
  { revalidate: 300 },
);

export const getCachedCompanyById = unstable_cache(
  async (id: string) => getCompanyById(id),
  ["company-by-id"],
  { revalidate: 300 },
);

export const getCachedContactsByCompanyId = unstable_cache(
  async (companyId: string) => getContactsByCompanyId(companyId),
  ["contacts-by-company"],
  { revalidate: 60 },
);

export const getCachedContactById = unstable_cache(
  async (id: string) => getContactById(id),
  ["contact-by-id"],
  { revalidate: 60 },
);

export const getCachedLeadsByOwnerId = unstable_cache(
  async (ownerId: string) => getLeadsByOwnerId(ownerId),
  ["leads-by-owner"],
  { revalidate: 60 },
);

export const getCachedLeadById = unstable_cache(
  async (id: string) => getLeadById(id),
  ["lead-by-id"],
  { revalidate: 60 },
);

export const getCachedPipelineStages = unstable_cache(
  async () => getPipelineStages(),
  ["pipeline-stages"],
  { revalidate: 600 },
);

export const getCachedDealsByOwnerId = unstable_cache(
  async (ownerId: string) => getDealsByOwnerId(ownerId),
  ["deals-by-owner"],
  { revalidate: 60 },
);

export const getCachedDealById = unstable_cache(
  async (id: string) => getDealById(id),
  ["deal-by-id"],
  { revalidate: 60 },
);

export const getCachedActivitiesByDealId = unstable_cache(
  async (dealId: string) => getActivitiesByDealId(dealId),
  ["activities-by-deal"],
  { revalidate: 60 },
);

export const getCachedActivitiesByContactId = unstable_cache(
  async (contactId: string) => getActivitiesByContactId(contactId),
  ["activities-by-contact"],
  { revalidate: 60 },
);
