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

  const events = useMemo(() => {
    if (!calendarEvents) return [];

    return calendarEvents.map((event) => ({
      title: event.title,
      start: event.start?.dateTime ? new Date(event.start.dateTime) : undefined,
      end: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
      allDay: Boolean(event.isAllDay),
      resource: {
        id: event.calendarId,
      },
    }));
  }, [calendarEvents]);

  return (
    <Calendar
      culture="en-US"
      localizer={localizer}
      events={events}
      defaultView="week"
      onRangeChange={(range) => {
        if (!Array.isArray(range) || range.length < 2) return;
        setDateRange([range[0]!, range[range.length - 1]!]);
      }}
    />
  );
}
