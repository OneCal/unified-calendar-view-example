import type { ReactNode } from "react";

export type CalendarEvent = {
  title?: string | ReactNode | null;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  colorId?: string;
  customColor?: string;
  calendarColor?: string;
  resource?: { id: string };
};

export const EVENT_COLOR_MAP: Record<string, string> = {
  PALE_BLUE: "var(--color-sky-600)",
  PALE_GREEN: "var(--color-emerald-600)",
  MAUVE: "var(--color-fuchsia-600)",
  PALE_RED: "var(--color-rose-600)",
  YELLOW: "var(--color-yellow-600)",
  ORANGE: "var(--color-orange-600)",
  CYAN: "var(--color-cyan-600)",
  GRAY: "var(--color-gray-600)",
  BLUE: "var(--color-blue-600)",
  GREEN: "var(--color-green-600)",
  RED: "var(--color-red-600)",
  CUSTOM: "var(--color-blue-600)", // fallback for custom
};
