"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { CalendarSimpleEvent } from "./types";
import { ClockIcon, EditIcon, Trash2Icon } from "lucide-react";
import { formatDateRange, formatDateTimeRange } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EventForm } from "@/app/(protected)/(calendar)/event-form";
import { RecurringEventDialog } from "@/app/(protected)/(calendar)/recurring-event";

export function CalendarEventComponent({
  event,
  setEvent,
}: {
  event: CalendarSimpleEvent | null;
  setEvent: (event: CalendarSimpleEvent | null) => void;
}) {
  if (!event) return null;
  const [showDialog, setShowDialog] = useState(Boolean(event));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [deleteSeries, setDeleteSeries] = useState(false);
  const [updateSeries, setUpdateSeries] = useState(false);
  const [showDeleteSeriesDialog, setShowDeleteSeriesDialog] = useState(false);
  const [showUpdateSeriesDialog, setShowUpdateSeriesDialog] = useState(false);

  const deleteMutation = api.calendarEvents.deleteCalendarEvent.useMutation();

  const handleDelete = async (eventId?: string) => {
    try {
      await deleteMutation.mutateAsync({
        endUserAccountId: event.calendarUnifiedAccountId!,
        calendarId: event.calendarUnifiedId!,
        eventId: eventId!,
      });
      toast.success("Event deleted successfully");
      setDeleteOpen(false);
      setEvent(null);
    } catch {
      toast.error("Failed to delete event");
    }
  };

  useEffect(() => {
    setShowDialog(Boolean(event));
  }, [event]);

  return (
    <>
      <Dialog open={showDialog} onOpenChange={() => setEvent(null)}>
        <DialogContent className="flex min-w-[300px] flex-col gap-4 p-4">
          <DialogTitle className="text-lg font-semibold">
            {event.title}
          </DialogTitle>

          {event.start && event.end && (
            <div className="flex items-center gap-1">
              <ClockIcon />
              {event.isAllDay
                ? formatDateRange(event.start, event.end)
                : formatDateTimeRange(event.start, event.end)}
            </div>
          )}
          {event.isAllDay && (
            <div className="text-sm text-gray-600">All Day Event</div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              variant="default"
              onClick={() => {
                setShowDialog(false);
                if (event.recurringEventId) {
                  setShowUpdateSeriesDialog(true);
                } else {
                  setEditEventOpen(true);
                }
              }}
            >
              <EditIcon />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (event.recurringEventId) {
                  setShowDeleteSeriesDialog(true);
                } else {
                  setDeleteOpen(true);
                }
              }}
            >
              <Trash2Icon />
              Delete
            </Button>

            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={editEventOpen} onOpenChange={setEditEventOpen}>
        <SheetContent
          side="right"
          className="fixed top-0 right-0 h-full w-full overflow-y-auto sm:w-[600px] sm:max-w-3xl"
        >
          <SheetHeader>
            <SheetTitle>Edit Event</SheetTitle>
          </SheetHeader>
          <EventForm
            calendars={[]}
            endUserAccountId={event.calendarUnifiedAccountId!}
            calendarId={event.calendarUnifiedId!}
            eventId={event.id!}
            updateSeries={updateSeries}
            onSuccess={() => setEditEventOpen(false)}
          />
          <SheetClose />
        </SheetContent>
      </Sheet>

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
              onClick={() => handleDelete(event.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showDeleteSeriesDialog && (
        <RecurringEventDialog
          title="Delete Recurring Event"
          open={showDeleteSeriesDialog}
          updateSeries={deleteSeries}
          onUpdateSeriesChange={setDeleteSeries}
          onSubmit={async () => {
            setShowDeleteSeriesDialog(false);
            setShowDialog(false);
            await handleDelete(
              deleteSeries ? event.recurringEventId : event.id,
            );
          }}
          onClose={() => setShowDeleteSeriesDialog(false)}
        />
      )}

      {showUpdateSeriesDialog && (
        <RecurringEventDialog
          title="Edit Recurring Event"
          open={showUpdateSeriesDialog}
          updateSeries={updateSeries}
          onUpdateSeriesChange={setUpdateSeries}
          onSubmit={async () => {
            setShowUpdateSeriesDialog(false);
            setEditEventOpen(true);
          }}
          onClose={() => setShowUpdateSeriesDialog(false)}
        />
      )}
    </>
  );
}
