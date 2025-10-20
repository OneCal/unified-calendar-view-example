import { env } from "@/env";
import type {
  EndUserAccount,
  PaginatedResponse,
  UnifiedCalendar,
  UnifiedEvent as UniversalEvent,
} from "@/server/lib/onecal-unified/types";
import ky from "ky";

export const onecalUnifiedApi = ky.create({
  prefixUrl: env.NEXT_PUBLIC_ONECAL_UNIFIED_URL,
  headers: {
    "x-api-key": env.ONECAL_UNIFIED_API_KEY,
  },
});

export async function getEndUserAccountById(id: string) {
  const response = await onecalUnifiedApi.get<EndUserAccount>(
    `endUserAccounts/${id}`,
  );
  return response.json();
}

export async function getCalendarsForEndUserAccount(endUserAccountId: string) {
  const response = await onecalUnifiedApi.get<
    PaginatedResponse<UnifiedCalendar>
  >(`calendars/${endUserAccountId}`);
  return response.json();
}

interface GetCalendarEventsParams {
  pageToken?: string;
  pageSize?: number;
  syncToken?: string;
  startDateTime?: string;
  endDateTime?: string;
  timeZone?: string;
  expandRecurrences?: boolean;
}

export async function getCalendarEvents(
  endUserAccountId: string,
  calendarId: string,
  params: GetCalendarEventsParams = {},
) {
  const queryParams = new URLSearchParams(params as Record<string, string>);

  const response = await onecalUnifiedApi.get<
    PaginatedResponse<UniversalEvent>
  >(`events/${endUserAccountId}/${calendarId}?${queryParams}`);
  return response.json();
}

export async function getCalendarEvent(
  endUserAccountId: string,
  calendarId: string,
  eventId: string,
) {
  const response = await onecalUnifiedApi.get<UniversalEvent>(
    `events/${endUserAccountId}/${calendarId}/${eventId}`,
  );
  return response.json();
}

export async function createCalendarEvent(
  endUserAccountId: string,
  calendarId: string,
  event: Partial<UniversalEvent>,
) {
  console.log("Creating event:", event, endUserAccountId, calendarId);
  const response = await onecalUnifiedApi.post<UniversalEvent>(
    `events/${endUserAccountId}/${calendarId}`,
    {json: event},
  );
  return response.json();
}

export async function editCalendarEvent(
  endUserAccountId: string,
  calendarId: string,
  eventId: string,
  event: Partial<UniversalEvent>,
) {
  console.log("Updating event:", event, endUserAccountId, calendarId, eventId);
  const response = await onecalUnifiedApi.put<UniversalEvent>(
    `events/${endUserAccountId}/${calendarId}/${eventId}`,
    {json: event},
  );
  return response.json();
}

export async function deleteCalendarEvent(
  endUserAccountId: string,
  calendarId: string,
  eventId: string,
) {
  await onecalUnifiedApi.delete(
    `events/${endUserAccountId}/${calendarId}/${eventId}`,
  );
}
