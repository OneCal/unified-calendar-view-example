"use client";

import { useEffect, useState } from "react";
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
import { formatOneCalDate } from "@/lib/utils";
import * as Yup from "yup";
import { Trash2Icon } from "lucide-react";

export type CreateEventFormProps = {
  calendars: Array<{
    id: string;
    name: string;
    color: string | null;
    unifiedCalendarId: string;
    calendarAccount?: { unifiedAccountId: string; email: string };
  }>;
  initialStart?: Date | null;
  initialEnd?: Date | null;
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
  showAs: Yup.string().oneOf(["transparent", "opaque"]),
  attendees: Yup.array().of(
    Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      name: Yup.string().required("Name is required"),
    }),
  ),
});

export function CreateEventForm({ calendars, initialStart, initialEnd, onSuccess }: CreateEventFormProps) {
  const [error, setError] = useState("");
  const createEventMutation =
    api.calendarEvents.createCalendarEvent.useMutation();

  const initialValues = {
    title: "",
    calendarId: calendars[0]?.id ?? "",
    start: initialStart ? initialStart.toISOString().slice(0, 16) : "",
    end: initialStart ? initialEnd?.toISOString().slice(0, 16) : "",
    isAllDay: false,
    description: "",
    showAs: "transparent",
    attendees: [] as Array<{ email: string; name: string }>,
  };

  const handleSubmit = (
    values: any,
    { setSubmitting, resetForm }: FormikHelpers<any>,
  ) => {
    setError("");
    const selectedCalendar = calendars.find((c) => c.id === values.calendarId);
    const endUserAccountId =
      selectedCalendar?.calendarAccount?.unifiedAccountId ?? "";
    const unifiedCalendarId = selectedCalendar?.unifiedCalendarId ?? "";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const start = {
      dateTime: formatOneCalDate(values.start, timeZone),
      timeZone,
    };
    const end = { dateTime: formatOneCalDate(values.end, timeZone), timeZone };

    createEventMutation
      .mutateAsync({
        endUserAccountId,
        calendarId: unifiedCalendarId,
        title: values.title,
        start,
        end,
        attendees: values.attendees,
        organizer:
          values.attendees.length > 0 ? values.attendees[0] : undefined,
        description: values.description,
        showAs: values.showAs,
        isAllDay: values.isAllDay,
      })
      .then(() => {
        toast.success("Event created successfully");
        resetForm();
        if (onSuccess) onSuccess();
      })
      .catch(() => setError("Failed to create event"))
      .finally(() => setSubmitting(false));
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, setFieldValue }) => {
        useEffect(() => {
          const organizer = values.attendees[0];
          if (!organizer) return;

          const selectedCalendar = calendars.find(
            (c) => c.id === values.calendarId,
          );

          if (selectedCalendar?.calendarAccount?.email) {
            setFieldValue(
              `attendees.0.email`,
              selectedCalendar.calendarAccount.email,
            );
          }
        }, [values.calendarId, setFieldValue, values.attendees]);
        return (
          <Form className="flex flex-col gap-2 p-4">
            <Field as={Input} name="title" placeholder="Event Title" />
            <ErrorMessage
              name="title"
              component="div"
              className="text-sm text-red-500"
            />

            <div className="flex items-center gap-2">
              {values.calendarId && (
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      calendars.find((c) => c.id === values.calendarId)
                        ?.color ?? "gray",
                  }}
                />
              )}

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

            <div className="flex items-center gap-2">
              <Field type="checkbox" name="isAllDay" />
              <span>All day</span>
            </div>

            <div className="flex items-start gap-2">
              <div className="relative flex flex-1 flex-col">
                {values.isAllDay ? (
                  <Field
                    as={Input}
                    type="date"
                    name="start"
                    placeholder="Start Date"
                  />
                ) : (
                  <Field
                    as={Input}
                    type="datetime-local"
                    name="start"
                    placeholder="Start DateTime"
                  />
                )}
                <ErrorMessage
                  name="start"
                  component="div"
                  className="text-sm text-red-500"
                />
              </div>
              {" - "}
              <div className="relative flex flex-1 flex-col">
                {values.isAllDay ? (
                  <Field
                    as={Input}
                    type="date"
                    name="end"
                    placeholder="End Date"
                  />
                ) : (
                  <Field
                    as={Input}
                    type="datetime-local"
                    name="end"
                    placeholder="End DateTime"
                  />
                )}
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
              <label htmlFor="showAs" className="font-medium">
                Show as
              </label>
              <Field
                as="select"
                id="showAs"
                name="showAs"
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
                    {values.attendees.map((att, idx) => (
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
                            values.attendees.length === 0
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
              disabled={isSubmitting || createEventMutation.isPending}
            >
              {isSubmitting || createEventMutation.isPending
                ? "Creating..."
                : "Create Event"}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
}
