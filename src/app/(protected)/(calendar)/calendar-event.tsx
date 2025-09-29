import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { CalendarEvent } from "./types";

export function CalendarEventComponent({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteEventMutation = api.calendarEvents.deleteCalendarEvent.useMutation();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={() => {
            setOpen(true);
            setHovering(true);
          }}
          onMouseLeave={() => setHovering(false)}
          style={{ cursor: "pointer" }}
        >
          {event.title}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        className={`min-w-[220px] ${!open ? 'hidden' : ''}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="flex flex-col gap-2">
          <div className="text-base font-semibold">{event.title}</div>
          {event.start && (
            <div>
              <span className="font-medium">Start:</span> {event.start.toLocaleString()}
            </div>
          )}
          {event.end && (
            <div>
              <span className="font-medium">End:</span> {event.end.toLocaleString()}
            </div>
          )}
          {event.allDay && <div>All Day Event</div>}
          <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
            Delete Event
          </Button>
          {confirmOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
              <div className="bg-white rounded shadow-lg p-6 min-w-[300px] relative z-[1001]">
                <div className="font-semibold text-lg mb-2">Delete Event</div>
                <div className="mb-4">Are you sure you want to delete this event?</div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await deleteEventMutation.mutateAsync({
                          endUserAccountId: event.calendarUnifiedAccountId!,
                          calendarId: event.calendarUnifiedId!,
                          eventId: event.id!,
                        });
                        toast.success("Event deleted successfully");
                        setConfirmOpen(false);
                        setOpen(false);
                      } catch (err) {
                        toast.error("Failed to delete event");
                      }
                    }}
                    disabled={deleteEventMutation.isPending}
                  >
                    {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
