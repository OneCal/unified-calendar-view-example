"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FieldArray,
  type FormikHelpers,
} from "formik";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { formatLocalDate, formatOneCalDate, getRRuleText } from "@/lib/utils";
import * as Yup from "yup";
import { LoaderIcon, Trash2Icon } from "lucide-react";
import { RecurrencePopover } from "./recurrence-popover";
import { addHours } from "date-fns";
import { RecurringEventDialog } from "@/app/(protected)/(calendar)/recurring-event";
import type { CalendarEvent } from "@/app/(protected)/(calendar)/types";

export type EventFormProps = {
  calendars: Array<{
    id: string;
    name: string;
    color: string | null;
    unifiedCalendarId: string;
    calendarAccount?: { unifiedAccountId: string; email: string };
  }>;
  initialStart?: Date | null;
  initialEnd?: Date | null;
  calendarId?: string;
  endUserAccountId?: string;
  eventId?: string;
  onSuccess?: () => void;
};

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  calendarId: Yup.string().required("Calendar is required"),
  start: Yup.string().required("Start date is required"),
  end: Yup.string()
    .required("End date/time is required")
    .test("end-after-start", "End must be after start", function (value) {
      const { start } = this.parent;
      if (!start || !value) return true;
      return new Date(value) >= new Date(start);
    }),
  description: Yup.string(),
  transparency: Yup.string().oneOf(["transparent", "opaque"]),
  attendees: Yup.array().of(
    Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      name: Yup.string().required("Name is required"),
    }),
  ),
  isRecurring: Yup.boolean(),
  recurrence: Yup.array()
    .of(Yup.string())
    .when("isRecurring", {
      is: true,
      then: (schema) => schema.min(1, "Recurrence rule is required"),
      otherwise: (schema) => schema,
    }),
});

export function EventForm({
  calendars,
  initialStart,
  initialEnd,
  calendarId,
  endUserAccountId,
  eventId,
  onSuccess,
}: EventFormProps) {
  const [error, setError] = useState("");
  const [recurrencePopoverOpen, setRecurrencePopoverOpen] = useState(false);
  const [showUpdateSeriesDialog, setShowUpdateSeriesDialog] = useState(false);
  const [updateSeries, setUpdateSeries] = useState(false);

  const createEventMutation =
    api.calendarEvents.createCalendarEvent.useMutation();
  const updateEventMutation =
    api.calendarEvents.editCalendarEvent.useMutation();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    data: eventData,
    isLoading,
    isError,
  } = api.calendarEvents.getCalendarEvent.useQuery(
    eventId && endUserAccountId && calendarId
      ? { eventId, endUserAccountId, calendarId }
      : (undefined as any),
    {
      enabled: !!eventId && !!endUserAccountId && !!calendarId,
      retry: false,
    },
  );

  const initialValues: CalendarEvent = useMemo(() => {
    if (!eventData)
      return {
        title: "",
        calendarId: calendarId ?? calendars[0]?.id ?? "",
        start: formatLocalDate(initialStart ?? new Date()),
        end: formatLocalDate(initialEnd ?? addHours(new Date(), 1)),
        isAllDay: false,
        description: "",
        transparency: "transparent",
        attendees: [] as Array<{ email: string; name: string }>,
        isRecurring: false,
        recurrence: [] as string[],
      };
    return {
      title: eventData.title ?? "",
      calendarId: calendarId ?? "",
      start: formatLocalDate(
        eventData.start?.dateTime
          ? new Date(eventData.start.dateTime)
          : new Date(),
      ),
      end: formatLocalDate(
        eventData.end?.dateTime
          ? new Date(eventData.end.dateTime)
          : addHours(new Date(), 1),
      ),
      isAllDay: eventData.isAllDay ?? false,
      description: eventData.description ?? "",
      transparency: eventData.transparency ?? "transparent",
      attendees: eventData.attendees ?? [],
      isRecurring: eventData.isRecurring ?? false,
      recurrence: eventData.recurrence ?? [],
    };
  }, [eventData]);

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm }: FormikHelpers<any>,
  ) => {
    setError("");

    const selectedCalendar = calendars.find((c) => c.id === values.calendarId);
    const selectedUnifiedCalendarId = selectedCalendar?.unifiedCalendarId ?? "";
    const selectedEndUserAccId =
      selectedCalendar?.calendarAccount?.unifiedAccountId ??
      endUserAccountId ??
      "";

    const start = {
      dateTime: formatOneCalDate(values.start, timeZone),
      timeZone,
    };
    const end = { dateTime: formatOneCalDate(values.end, timeZone), timeZone };

    try {
      if (eventId && endUserAccountId && calendarId) {
        if (eventData?.recurringEventId) {
          setShowUpdateSeriesDialog(true);
          return;
        }
        await updateEventMutation.mutateAsync({
          id: eventId,
          endUserAccountId: endUserAccountId,
          calendarId: calendarId,
          title: values.title,
          start,
          end,
          attendees: values.attendees,
          organizer:
            values.attendees.length > 0 ? values.attendees[0] : undefined,
          description: values.description,
          showAs: values.showAs,
          isAllDay: values.isAllDay,
          isRecurring: values.isRecurring,
          recurrence: values.recurrence,
        });
        toast.success("Event updated successfully");
      } else {
        await createEventMutation.mutateAsync({
          endUserAccountId: selectedEndUserAccId,
          calendarId: selectedUnifiedCalendarId,
          title: values.title,
          start,
          end,
          attendees: values.attendees,
          organizer:
            values.attendees.length > 0 ? values.attendees[0] : undefined,
          description: values.description,
          showAs: values.showAs,
          isAllDay: values.isAllDay,
          isRecurring: values.isRecurring,
          recurrence: values.recurrence,
        });
        toast.success("Event created successfully");
        resetForm();
      }
      onSuccess?.();
    } catch {
      setError("Failed to save event.");
    } finally {
      setSubmitting(false);
    }
  };

  if (eventId && isLoading) {
    return (
      <div className="flex items-center gap-1 p-4 text-sm text-gray-500">
        <LoaderIcon /> Loading event...
      </div>
    );
  }

  if (eventId && isError) {
    return (
      <div className="p-4 text-sm text-red-500">Failed to load event.</div>
    );
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => {
          useEffect(() => {
            const selectedCalendar = calendars.find(
              (c) => c.id === values.calendarId,
            );
            if (!selectedCalendar?.calendarAccount?.email) return;

            if (!values.attendees || values.attendees.length === 0) {
              setFieldValue("attendees", [
                { email: selectedCalendar.calendarAccount.email, name: "" },
              ]);
            } else {
              setFieldValue(
                `attendees.0.email`,
                selectedCalendar.calendarAccount.email,
              );
            }
          }, [values.calendarId, setFieldValue]);

          return (
            <Form className="flex flex-col gap-2 p-4">
              <Field as={Input} name="title" placeholder="Event Title" />
              <ErrorMessage
                name="title"
                component="div"
                className="text-sm text-red-500"
              />

              {calendars && calendars.length > 0 && (
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        calendars.find((c) => c.id === values.calendarId)
                          ?.color ?? "gray",
                    }}
                  />
                  <Field
                    as="select"
                    name="calendarId"
                    className="flex-1 rounded border p-2"
                  >
                    {calendars.map((cal) => (
                      <option key={cal.id} value={cal.id}>
                        {cal.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="calendarId"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Field type="checkbox" name="isAllDay" />
                <span>All day</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Field
                  type="checkbox"
                  name="isRecurring"
                  id="isRecurring"
                  className="cursor-pointer"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue("isRecurring", e.target.checked);
                    if (e.target.checked) setRecurrencePopoverOpen(true);
                  }}
                />
                <label htmlFor="isRecurring" className="cursor-pointer">
                  Make recurring
                </label>

                {values.isRecurring && (
                  <RecurrencePopover
                    startDate={values.start}
                    open={recurrencePopoverOpen}
                    onOpenChange={setRecurrencePopoverOpen}
                    onSave={(rruleString) => {
                      setFieldValue("recurrence", [rruleString]);
                      setFieldValue("isRecurring", true);
                    }}
                  />
                )}
              </div>

              {values.isRecurring &&
                values.recurrence &&
                values.recurrence.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Occurs {getRRuleText(values.recurrence[0] || "")}
                  </p>
                )}

              <div className="flex items-start gap-2">
                <div className="relative flex flex-1 flex-col">
                  <Field
                    as={Input}
                    type={values.isAllDay ? "date" : "datetime-local"}
                    name="start"
                  />
                  <ErrorMessage
                    name="start"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
                {" - "}
                <div className="relative flex flex-1 flex-col">
                  <Field
                    as={Input}
                    type={values.isAllDay ? "date" : "datetime-local"}
                    name="end"
                  />
                  <ErrorMessage
                    name="end"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
              </div>

              <Field
                as="textarea"
                name="description"
                placeholder="Description"
                className="rounded border p-2"
              />

              <div className="flex flex-col gap-1">
                <label htmlFor="transparency" className="font-medium">
                  Show as
                </label>
                <Field
                  as="select"
                  id="transparency"
                  name="transparency"
                  className="rounded border p-2"
                >
                  <option value="transparent">Free</option>
                  <option value="opaque">Busy</option>
                </Field>
              </div>

              <div className="mt-2">
                <label className="font-medium">Attendees</label>
                <FieldArray name="attendees">
                  {({ remove, push }) => (
                    <div className="flex flex-col gap-2">
                      {values.attendees?.map((att, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="flex flex-col">
                            <Field
                              as={Input}
                              name={`attendees.${idx}.email`}
                              placeholder="Email"
                            />
                            <ErrorMessage
                              name={`attendees.${idx}.email`}
                              component="div"
                              className="text-sm text-red-500"
                            />
                          </div>
                          <div>
                            <Field
                              as={Input}
                              name={`attendees.${idx}.name`}
                              placeholder="Name"
                            />
                            <ErrorMessage
                              name={`attendees.${idx}.name`}
                              component="div"
                              className="text-sm text-red-500"
                            />
                          </div>
                          <Button type="button" onClick={() => remove(idx)}>
                            <Trash2Icon />
                          </Button>
                          {idx === 0 && (
                            <div className="flex h-10 items-center">
                              <span className="text-xs font-medium text-gray-600">
                                Organizer
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          push({
                            email:
                              values.attendees?.length === 0
                                ? (calendars.find(
                                    (c) => c.id === values.calendarId,
                                  )?.calendarAccount?.email ?? "")
                                : "",
                            name: "",
                          })
                        }
                      >
                        Add Guest
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isSubmitting ||
                  createEventMutation.isPending ||
                  updateEventMutation.isPending
                }
              >
                {isSubmitting ||
                createEventMutation.isPending ||
                updateEventMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </Button>
            </Form>
          );
        }}
      </Formik>
      {showUpdateSeriesDialog && (
        <RecurringEventDialog
          title="Update Recurring Event"
          open={showUpdateSeriesDialog}
          updateSeries={updateSeries}
          onUpdateSeriesChange={setUpdateSeries}
          onSubmit={async () => {
            setShowUpdateSeriesDialog(false);
            // now call your handleSubmit logic and pass `updateSeries`
            // await submitEvent(values, updateSeries);
          }}
          onClose={() => setShowUpdateSeriesDialog(false)}
        />
      )}
    </>
  );
}
