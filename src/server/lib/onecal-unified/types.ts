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
