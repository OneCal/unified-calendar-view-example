"use client";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
  endOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { api } from "@/trpc/react";
import { useMemo, useState } from "react";

const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const initialRange = [startOfWeek(new Date()), endOfWeek(new Date())] as const;

type DateRange = typeof initialRange;

type CalendarEvent = {
  title?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  colorId?: string;
  customColor?: string;
  calendarColor?: string;
  resource?: { id: string };
};

const EVENT_COLOR_MAP: Record<string, string> = {
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

export default function CalendarPage() {
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const { data: calendarEvents } =
    api.calendarEvents.getCalendarEvents.useQuery(
      {
        startDate: dateRange[0],
        endDate: dateRange[1],
      },
      {
        retry: false,
      },
    );

  const events: CalendarEvent[] = useMemo(() => {
    if (!calendarEvents) return [];
    return calendarEvents.map((event) => ({
      title: event.title,
      start: event.start?.dateTime ? new Date(event.start.dateTime) : undefined,
      end: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
      allDay: Boolean(event.isAllDay),
      colorId: event.colorId,
      customColor: event.customColor,
      calendarColor: event.calendarColor,
      resource: {
        id: event.calendarId,
      },
    }));
  }, [calendarEvents]);

  // Helper to get the event color
  function getEventColor(event: CalendarEvent) {
    if (event.customColor) return event.customColor;
    if (event.colorId && EVENT_COLOR_MAP[event.colorId])
      return EVENT_COLOR_MAP[event.colorId];
    if (event.calendarColor) return event.calendarColor;
    return undefined;
  }

  return (
    <Calendar
      culture="en-US"
      localizer={localizer}
      events={events}
      defaultView="week"
      eventPropGetter={(event: CalendarEvent) => {
        const bg = getEventColor(event);
        return bg ? { style: { backgroundColor: bg } } : {};
      }}
      onRangeChange={(range) => {
        if (!Array.isArray(range) || range.length < 2) return;
        setDateRange([range[0]!, range[range.length - 1]!]);
      }}
    />
  );
}
