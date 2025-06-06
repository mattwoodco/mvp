import type { Listing, User } from "./database";

export type ApiResponse<T = unknown> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

export type UpdateUserRequest = Partial<Pick<User, "name" | "image">>;

export type CreateListingRequest = {
  title: string;
  description?: string;
  price: string;
};

export type UpdateListingRequest = Partial<
  Pick<Listing, "title" | "description" | "price" | "isActive">
>;

export type ListingsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  minPrice?: number;
  maxPrice?: number;
};
