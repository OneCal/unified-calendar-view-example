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
  endOfWeek,
  addHours,
} from "date-fns";
import { enUS, sl } from "date-fns/locale";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { api } from "@/trpc/react";
import { useCallback, useMemo, useState } from "react";
import {
  EVENT_COLOR_MAP,
  type CalendarEvent,
} from "@/app/(protected)/(calendar)/types";
import { CalendarEventComponent } from "./calendar-event";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { CreateEventForm } from "./create-event-form";

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
  event: (props) => <div>{props.event.title}</div>,
};

export default function CalendarPage() {
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createEventStart, setCreateEventStart] = useState<Date | null>(
    new Date(),
  );
  const [createEventEnd, setCreateEventEnd] = useState<Date | null>(
    addHours(new Date(), 1),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const { data: calendarAccounts } = api.calendarAccounts.getAll.useQuery();

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
    debugger;
    return calendarEvents.map((event: any) => ({
      id: event.id,
      title: event.title,
      start: event.start?.dateTime ? new Date(event.start.dateTime) : undefined,
      end: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
      allDay: Boolean(event.isAllDay),
      colorId: event.colorId,
      customColor: event.customColor,
      calendarColor: event.calendarColor,
      calendarId: event.calendarId,
      calendarUnifiedAccountId: event.calendarUnifiedAccountId,
      calendarUnifiedId: event.calendarUnifiedId,
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
    <>
      <Sheet open={createEventOpen} onOpenChange={setCreateEventOpen}>
        <SheetContent
          side="right"
          className="fixed top-0 right-0 h-full w-full overflow-y-auto sm:w-[600px] sm:max-w-3xl"
        >
          <SheetHeader>
            <SheetTitle>Create Event</SheetTitle>
          </SheetHeader>
          <CreateEventForm
            calendars={(calendarAccounts || []).flatMap((acc) =>
              acc.calendars.map((cal) => ({
                ...cal,
                calendarAccount: {
                  unifiedAccountId: acc.unifiedAccountId,
                  email: acc.email,
                },
              })),
            )}
            initialStart={createEventStart}
            initialEnd={createEventEnd}
            onSuccess={() => setCreateEventOpen(false)}
          />
          <SheetClose />
        </SheetContent>
      </Sheet>
      <Calendar
        culture="en-US"
        localizer={localizer}
        events={events}
        defaultView="week"
        eventPropGetter={eventPropGetter}
        components={components}
        onSelectSlot={(slotInfo) => {
          setCreateEventStart(slotInfo.start);
          setCreateEventEnd(slotInfo.end);
          setCreateEventOpen(true);
        }}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
        }}
        selectable
        onRangeChange={(range) => {
          // Week view: range is array of dates
          if (Array.isArray(range) && range.length >= 2) {
            setDateRange([range[0]!, range[range.length - 1]!]);
            return;
          }
          // Month view: range is object with start/end
          if (
            range &&
            typeof range === "object" &&
            "start" in range &&
            "end" in range
          ) {
            setDateRange([range.start, range.end]);
            return;
          }
          // Day view: range is a single Date
          if (range instanceof Date) {
            setDateRange([range, range]);
            return;
          }
        }}
      />
      {selectedEvent && (
        <CalendarEventComponent
          event={selectedEvent}
          setEvent={setSelectedEvent}
        />
      )}
    </>
  );
}
