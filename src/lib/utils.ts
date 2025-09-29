import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInTimeZone } from "date-fns-tz";
import { RRule, rrulestr } from "rrule";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface State {
  userId: string;
}

export function stateToB64(state: State) {
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

export function stateFromB64(b64: string) {
  return JSON.parse(Buffer.from(b64, "base64").toString("utf-8")) as State;
}

export const formatICalDate = (date: string, timeZone: string) => {
  const d = new Date(date);

  return formatInTimeZone(d, timeZone, "yyyyMMdd'T'HHmmss");
};

export const formatOneCalDate = (date: string, timeZone: string) => {
  const d = new Date(date);

  return formatInTimeZone(d, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
};

export const getRRuleObjectFromRRuleString = (
  startDateTime: string,
  timeZone: string,
  rruleValue: string,
  exDates: string[] = [],
): RRule => {
  const _rrule = rruleValue.replace("RRULE:", ""); // accepts both just the RRULE value and the whole string
  const icalDate = formatICalDate(startDateTime, timeZone);
  let fullRRuleStr = `DTSTART;TZID=${timeZone}:${icalDate}\nRRULE:${_rrule}`;

  if (exDates.length) {
    const exDatesStr = exDates.map((date) => {
      return `EXDATE;TZID=${timeZone}:${formatICalDate(date, timeZone)}`;
    });
    fullRRuleStr = `${fullRRuleStr}\n${exDatesStr.join("\n")}`;
  }

  return rrulestr(fullRRuleStr);
};
