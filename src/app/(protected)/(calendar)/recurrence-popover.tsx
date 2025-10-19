import { useState, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RRule, Weekday, Frequency, RRuleSet } from "rrule";
import { RefreshCcwIcon } from "lucide-react";
import { format } from "date-fns";
import { parseRRuleString } from "@/lib/utils";

export type RecurrencePopoverProps = {
  startDate?: string;
  rruleString?: string;
  onSave: (rruleString: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function RecurrencePopover({
  startDate,
  rruleString,
  onSave,
  open: controlledOpen,
  onOpenChange,
}: RecurrencePopoverProps) {
  const dayMap: Record<string, Weekday> = {
    MO: new Weekday(0),
    TU: new Weekday(1),
    WE: new Weekday(2),
    TH: new Weekday(3),
    FR: new Weekday(4),
    SA: new Weekday(5),
    SU: new Weekday(6),
  };

  const getInitialSelectedDays = (): string[] => {
    const start = startDate ? new Date(startDate) : new Date();
    const weekdayNames = Object.keys(dayMap);
    return [weekdayNames[start.getDay() - 1] ?? "MO"];
  };

  const [freq, setFreq] = useState(Frequency.WEEKLY);
  const [interval, setInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    getInitialSelectedDays(),
  );
  const [internalOpen, setInternalOpen] = useState(false);
  const [from, setFrom] = useState<Date>(
    startDate ? new Date(startDate) : new Date(),
  );
  const [until, setUntil] = useState<Date | null>(null);
  const [monthOption, setMonthOption] = useState<"dayOfMonth" | "nthWeekday">(
    "dayOfMonth",
  );

  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  useEffect(() => {
    if (rruleString) return;
    const suggested = new Date(from);

    switch (freq) {
      case Frequency.DAILY:
        suggested.setDate(from.getDate() + interval);
        break;
      case Frequency.WEEKLY:
        suggested.setDate(from.getDate() + interval * 7);
        break;
      case Frequency.MONTHLY:
        suggested.setMonth(from.getMonth() + interval);
        break;
      case Frequency.YEARLY:
        suggested.setFullYear(from.getFullYear() + interval);
        break;
      default:
        suggested.setHours(from.getHours() + 1);
    }

    setUntil(suggested);
  }, [freq, interval, startDate]);

  useEffect(() => {
    setFrom(startDate ? new Date(startDate) : new Date());
  }, [startDate]);

  useEffect(() => {
    if (!rruleString) return;

    const parsed = parseRRuleString(rruleString);
    if (!parsed) return;

    setFreq(parsed.freq);
    setInterval(parsed.interval);
    setSelectedDays(parsed.byweekday ?? getInitialSelectedDays());
    setUntil(parsed.until ?? null);

    if (parsed.bymonthday) {
      setMonthOption("dayOfMonth");
    } else if (parsed.nthWeekday) {
      setMonthOption("nthWeekday");
    }
  }, [rruleString]);

  const nthWeekLabels: Record<string, string> = {
    "1": "first",
    "2": "second",
    "3": "third",
  };

  const getNthWeekLabel = (from: Date): string => {
    const n = Math.ceil(from.getDate() / 7);
    return nthWeekLabels[n.toString()] ?? `${n}th`;
  };

  const getRRule = () => {
    const rRuleOptions: any = {
      interval,
      freq,
      until,
      wkst: RRule.MO,
    };
    if (freq === Frequency.WEEKLY) {
      rRuleOptions.byweekday = selectedDays.map((d) => dayMap[d]);
    }
    if (until) rRuleOptions.until = until;

    if (freq === Frequency.MONTHLY || freq === Frequency.YEARLY) {
      if (monthOption === "dayOfMonth") {
        rRuleOptions.bymonthday = [from.getDate()];
      } else if (monthOption === "nthWeekday") {
        rRuleOptions.byweekday = [
          new Weekday(from.getDay() - 1, Math.ceil(from.getDate() / 7)),
        ];
      }
      if (freq === Frequency.YEARLY) {
        rRuleOptions.bymonth = [from.getMonth() + 1];
      }
    }
    return new RRule(rRuleOptions);
  };

  const handleSave = () => {
    onSave(getRRule().toString());
    setIsOpen(false);
  };

  const freqOptions = [
    { label: "Days", value: Frequency.DAILY },
    { label: "Weeks", value: Frequency.WEEKLY },
    { label: "Months", value: Frequency.MONTHLY },
    { label: "Years", value: Frequency.YEARLY },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <RefreshCcwIcon /> Edit
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-80 max-w-80 min-w-80 rounded-xl border bg-white p-4 shadow-xl"
      >
        <div className="space-y-3">
          <h3 className="text-base font-medium">Repeat</h3>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Repeat every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={99}
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-16 rounded border p-1"
              />
              <select
                value={freq}
                onChange={(e) => setFreq(Number(e.target.value))}
                className="rounded border p-1"
              >
                {freqOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {freq === Frequency.WEEKLY && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Days of the week
              </label>
              <div className="flex flex-wrap gap-1">
                {Object.keys(dayMap).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDayToggle(d)}
                    className={`rounded-full px-2 py-1 text-sm ${
                      selectedDays.includes(d)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
          {(freq === Frequency.MONTHLY || freq === Frequency.YEARLY) && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Repeat on</label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={monthOption === "dayOfMonth"}
                  onChange={() => setMonthOption("dayOfMonth")}
                />
                <span>
                  {freq === Frequency.MONTHLY
                    ? `on day ${from.getDate()}`
                    : `on  ${format(from, "MMMM")} ${from.getDate()}`}
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={monthOption === "nthWeekday"}
                  onChange={() => setMonthOption("nthWeekday")}
                />
                <span>
                  {freq === Frequency.MONTHLY
                    ? `on ${getNthWeekLabel(from)} ${format(from, "EEEE")}`
                    : `on ${getNthWeekLabel(from)} ${format(from, "EEEE")} of ${format(from, "MMMM")}`}
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Occurs {getRRule().toText()}
            </label>
            <input
              type="date"
              value={until ? until.toISOString().slice(0, 10) : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value) setUntil(new Date(value));
                else setUntil(null);
              }}
              className="w-full rounded border p-1"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
