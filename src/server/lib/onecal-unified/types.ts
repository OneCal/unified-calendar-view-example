export type PaginatedResponse<T> = {
  data: T[];
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

export interface UnifiedEvent {
  id?: string;
  title?: string;
  description?: string;
  etag?: string;
  createdAt?: string;
  updatedAt?: string;
  start?: EventDateTime;
  end?: EventDateTime;
  isAllDay?: boolean;
  publicExtendedProperties?: Record<string, string>;
  privateExtendedProperties?: { [k: string]: string };
  isRecurring?: boolean;
  isException?: boolean;
  isCancelled?: boolean;
  recurrence?: string[] | null;
  originalStart?: EventDateTime;
  recurringEventId?: string;
  colorId?: EventColorId;
  customColor?: string;
  myResponseStatus?: ResponseStatus;
  attendees?: EventAttendee[];
  visibility?: EventVisibility;
  location?: string;
  conferenceData?: {
    conferenceId?: string;
    joinUrl?: string;
    conferenceType?: string;
    conferenceDetails?: {
      [key: string]: any;
    };
  };
  webLink?: string;
  iCalUid?: string;
  transparency?: EventTransparency;
  eventType?: EventType;
  organizer?: {
    id?: string;
    name?: string;
    email?: string;
    isSelf?: boolean;
  };
  creator?: {
    id?: string;
    name?: string;
    email?: string;
    isSelf?: boolean;
  };
  reminders?: {
    useDefault?: boolean;
    isReminderOn?: boolean;
    overrides?: {
      method?: string;
      minutes?: number;
    }[];
  };
  generateMeetingUrlProvider?: string;
}

export interface EventDateTime {
  dateTime?: string;
  timeZone?: string;
}

export enum EventColorId {
  CUSTOM = "CUSTOM",
  PALE_BLUE = "PALE_BLUE",
  PALE_GREEN = "PALE_GREEN",
  MAUVE = "MAUVE",
  PALE_RED = "PALE_RED",
  YELLOW = "YELLOW",
  ORANGE = "ORANGE",
  CYAN = "CYAN",
  GRAY = "GRAY",
  BLUE = "BLUE",
  GREEN = "GREEN",
  RED = "RED",
}

export type ResponseStatus =
  | "needsAction"
  | "declined"
  | "tentative"
  | "accepted";

export type EventVisibility = "default" | "public" | "private" | "confidential";
export type EventTransparency = "transparent" | "opaque";
export type EventType = "default" | "outOfOffice" | "focusTime";

export interface EventAttendee {
  id?: string;
  name?: string;
  email?: string;
  responseStatus?: ResponseStatus;
}
