"use client";
import {
  Calendar,
  dateFnsLocalizer,
  type Components,
} from "react-big-calendar";
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
import { useCallback, useMemo, useState } from "react";
import CalendarEventComponent from "@/app/(protected)/(calendar)/calendar-event";
import {
  EVENT_COLOR_MAP,
  type CalendarEvent,
} from "@/app/(protected)/(calendar)/types";

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

const components: Components<CalendarEvent> = {
  event: CalendarEventComponent,
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

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const getEventColor = (event: CalendarEvent) => {
      if (event.customColor) return event.customColor;
      if (event.colorId && EVENT_COLOR_MAP[event.colorId])
        return EVENT_COLOR_MAP[event.colorId];
      if (event.calendarColor) return event.calendarColor;
      return undefined;
    };

    const bg = getEventColor(event);
    return bg
      ? {
          style: {
            backgroundColor: bg,
            borderColor: "white",
          },
        }
      : {};
  }, []);

  return (
    <Calendar
      culture="en-US"
      localizer={localizer}
      events={events}
      defaultView="week"
      eventPropGetter={eventPropGetter}
      components={components}
      onRangeChange={(range) => {
        if (!Array.isArray(range) || range.length < 2) return;
        setDateRange([range[0]!, range[range.length - 1]!]);
      }}
    />
  );
}
