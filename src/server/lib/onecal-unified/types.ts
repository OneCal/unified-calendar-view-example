export type PaginatedResponse<T> = {
  items: T[];
  nextPageToken?: string;
  nextSyncToken?: string;
};

export interface EndUserAccount {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  email: string;
  externalId: string;
  authorizedScopes: string[];
  providerAccountId: string;
  providerId: string;
  applicationId: string;
  status: "ACTIVE" | "EXPIRED";
  providerType: "GOOGLE" | "MICROSOFT";
}

export interface UnifiedCalendar {
  id: string;
  name?: string;
  hexColor?: string;
  // colorId?: EventColorId;
  readOnly?: boolean;
  isPrimary?: boolean;
  isShared?: boolean;
  timeZone?: string;
  inviteEmail?: string;
  allowedOnlineMeetingProviders?: string[] | null;
  defaultOnlineMeetingProvider?: string;
}
