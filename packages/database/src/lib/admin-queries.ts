import { and, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db } from "../client";
import { user, listing, adminActivityLog, userAdminRole, adminRole } from "../schema";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface UserFilters {
  search?: string;
  emailVerified?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  hasRole?: boolean;
}

export interface ListingFilters {
  search?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  userId?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

// Get users with admin roles
export async function getUsersWithAdminInfo(
  filters: UserFilters,
  pagination: PaginationParams
) {
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  
  if (filters.search) {
    conditions.push(
      sql`${user.name} ILIKE ${`%${filters.search}%`} OR ${user.email} ILIKE ${`%${filters.search}%`}`
    );
  }
  
  if (filters.emailVerified !== undefined) {
    conditions.push(eq(user.emailVerified, filters.emailVerified));
  }
  
  if (filters.createdFrom) {
    conditions.push(gte(user.createdAt, filters.createdFrom));
  }
  
  if (filters.createdTo) {
    conditions.push(lte(user.createdAt, filters.createdTo));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(user)
    .where(whereClause);

  // Get users with their admin roles
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      adminRole: {
        id: adminRole.id,
        name: adminRole.name,
        description: adminRole.description,
      },
    })
    .from(user)
    .leftJoin(userAdminRole, and(
      eq(user.id, userAdminRole.userId),
      eq(userAdminRole.isActive, true)
    ))
    .leftJoin(adminRole, eq(userAdminRole.roleId, adminRole.id))
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: users,
    total: totalResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult.count / pageSize),
  };
}

// Get listings with user info
export async function getListingsWithUserInfo(
  filters: ListingFilters,
  pagination: PaginationParams
) {
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  
  if (filters.search) {
    conditions.push(
      sql`${listing.title} ILIKE ${`%${filters.search}%`} OR ${listing.description} ILIKE ${`%${filters.search}%`}`
    );
  }
  
  if (filters.isActive !== undefined) {
    conditions.push(eq(listing.isActive, filters.isActive));
  }
  
  if (filters.priceMin !== undefined) {
    conditions.push(gte(listing.price, filters.priceMin.toString()));
  }
  
  if (filters.priceMax !== undefined) {
    conditions.push(lte(listing.price, filters.priceMax.toString()));
  }
  
  if (filters.userId) {
    conditions.push(eq(listing.userId, filters.userId));
  }
  
  if (filters.createdFrom) {
    conditions.push(gte(listing.createdAt, filters.createdFrom));
  }
  
  if (filters.createdTo) {
    conditions.push(lte(listing.createdAt, filters.createdTo));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(listing)
    .where(whereClause);

  // Get listings with user info
  const listings = await db
    .select({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      isActive: listing.isActive,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(listing)
    .leftJoin(user, eq(listing.userId, user.id))
    .where(whereClause)
    .orderBy(desc(listing.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: listings,
    total: totalResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult.count / pageSize),
  };
}

// Get admin activity logs
export async function getAdminActivityLogs(
  filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  },
  pagination: PaginationParams
) {
  const { page, pageSize } = pagination;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  
  if (filters.userId) {
    conditions.push(eq(adminActivityLog.userId, filters.userId));
  }
  
  if (filters.action) {
    conditions.push(eq(adminActivityLog.action, filters.action));
  }
  
  if (filters.entityType) {
    conditions.push(eq(adminActivityLog.entityType, filters.entityType));
  }
  
  if (filters.dateFrom) {
    conditions.push(gte(adminActivityLog.createdAt, filters.dateFrom));
  }
  
  if (filters.dateTo) {
    conditions.push(lte(adminActivityLog.createdAt, filters.dateTo));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(adminActivityLog)
    .where(whereClause);

  // Get logs with user info
  const logs = await db
    .select({
      id: adminActivityLog.id,
      action: adminActivityLog.action,
      entityType: adminActivityLog.entityType,
      entityId: adminActivityLog.entityId,
      metadata: adminActivityLog.metadata,
      ipAddress: adminActivityLog.ipAddress,
      userAgent: adminActivityLog.userAgent,
      createdAt: adminActivityLog.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(adminActivityLog)
    .leftJoin(user, eq(adminActivityLog.userId, user.id))
    .where(whereClause)
    .orderBy(desc(adminActivityLog.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: logs,
    total: totalResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult.count / pageSize),
  };
}

// Dashboard statistics
export async function getDashboardStats() {
  const [userCount] = await db.select({ count: count() }).from(user);
  const [verifiedUserCount] = await db
    .select({ count: count() })
    .from(user)
    .where(eq(user.emailVerified, true));
  
  const [listingCount] = await db.select({ count: count() }).from(listing);
  const [activeListingCount] = await db
    .select({ count: count() })
    .from(listing)
    .where(eq(listing.isActive, true));

  const [adminCount] = await db
    .select({ count: count() })
    .from(userAdminRole)
    .where(eq(userAdminRole.isActive, true));

  // Get recent activity
  const recentActivity = await db
    .select({
      action: adminActivityLog.action,
      createdAt: adminActivityLog.createdAt,
      userName: user.name,
    })
    .from(adminActivityLog)
    .leftJoin(user, eq(adminActivityLog.userId, user.id))
    .orderBy(desc(adminActivityLog.createdAt))
    .limit(10);

  return {
    totalUsers: userCount.count,
    verifiedUsers: verifiedUserCount.count,
    totalListings: listingCount.count,
    activeListings: activeListingCount.count,
    totalAdmins: adminCount.count,
    recentActivity,
  };
}