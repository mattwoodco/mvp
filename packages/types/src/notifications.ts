import type { User } from "./database";

export type NotificationType = "email" | "push" | "sms" | "in_app";
export type NotificationStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "read";

export type Notification = {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
};

export type NotificationPreferences = {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  categories: {
    marketing: boolean;
    updates: boolean;
    security: boolean;
  };
};

export type CreateNotificationRequest = {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, unknown>;
};

export type NotificationWithUser = Notification & {
  user: Pick<User, "id" | "name" | "email">;
};
