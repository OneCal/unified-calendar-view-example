"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { CalendarEvent } from "./types";
import { ClockIcon, EditIcon, Trash2Icon } from "lucide-react";
import { formatDateRange, formatDateTimeRange } from "@/lib/utils";

export function CalendarEventComponent({ event, setEvent }: { event: CalendarEvent | null, setEvent: (event: CalendarEvent | null) => void }) {
  if (!event) return null;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = api.calendarEvents.deleteCalendarEvent.useMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        endUserAccountId: event.calendarUnifiedAccountId!,
        calendarId: event.calendarUnifiedId!,
        eventId: event.id!,
      });
      toast.success("Event deleted successfully");
      setDeleteOpen(false);
      setEvent(null);
    } catch {
      toast.error("Failed to delete event");
    }
  };

  return (
    <>
      <Dialog open={Boolean(event)} onOpenChange={() => setEvent(null)}>
        <DialogContent className="flex min-w-[300px] flex-col gap-4 p-4">
          <DialogTitle className="text-lg font-semibold">
            {event.title}
          </DialogTitle>

          {event.start && event.end && (
            <div className="flex items-center gap-1">
              <ClockIcon />
              {event.allDay
                ? formatDateRange(event.start, event.end)
                : formatDateTimeRange(event.start, event.end)}
            </div>
          )}
          {event.allDay && (
            <div className="text-sm text-gray-600">All Day Event</div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="default">
              <EditIcon />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2Icon />
              Delete
            </Button>

            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="flex min-w-[300px] flex-col gap-4 p-4">
          <DialogTitle className="text-lg font-semibold">
            Delete Event
          </DialogTitle>
          <p>Are you sure you want to delete this event?</p>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
