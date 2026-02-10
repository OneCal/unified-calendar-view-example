import type { ReactNode } from "react";

export type CalendarSimpleEvent = {
  id?: string;
  title?: string | ReactNode | null;
  start?: Date;
  end?: Date;
  isAllDay?: boolean;
  colorId?: string;
  customColor?: string;
  calendarColor?: string;
  calendarUnifiedAccountId?: string;
  calendarUnifiedId?: string;
  calendarId?: string;
  resource?: { id: string };
  recurringEventId?: string;
};

export type CalendarEvent = {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrence?: string[] | null;
  attendees?: { email?: string; name?: string }[];
  organizer?: { email?: string; name?: string };
  description?: string;
  transparency?: string;
  colorId?: string;
  customColor?: string;
  calendarColor?: string;
  calendarUnifiedAccountId?: string;
  calendarUnifiedId?: string;
  calendarId?: string;
};

export const EVENT_COLOR_MAP: Record<string, string> = {
  "1": "var(--color-fuchsia-400)",   // LAVENDER
  "2": "var(--color-emerald-600)",   // SAGE
  "3": "var(--color-purple-600)",    // GRAPE
  "4": "var(--color-rose-600)",      // FLAMINGO
  "5": "var(--color-yellow-600)",    // BANANA
  "6": "var(--color-orange-600)",    // TANGERINE
  "7": "var(--color-cyan-600)",      // PEACOCK
  "8": "var(--color-gray-600)",      // GRAPHITE
  "9": "var(--color-blue-600)",      // BLUEBERRY
  "10": "var(--color-green-600)",    // BASIL
  "11": "var(--color-red-600)",      // TOMATO
};
