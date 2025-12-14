"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { subHours, subDays, subWeeks, subMonths } from "date-fns";

interface DateRangePickerProps {
  value: {
    start: Date;
    end: Date;
  };
  onChange: (range: { start: Date; end: Date }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const presets = [
    {
      label: "Last Hour",
      range: () => ({ start: subHours(new Date(), 1), end: new Date() }),
    },
    {
      label: "Last 6 Hours",
      range: () => ({ start: subHours(new Date(), 6), end: new Date() }),
    },
    {
      label: "Last 24 Hours",
      range: () => ({ start: subHours(new Date(), 24), end: new Date() }),
    },
    {
      label: "Last 7 Days",
      range: () => ({ start: subDays(new Date(), 7), end: new Date() }),
    },
    {
      label: "Last 30 Days",
      range: () => ({ start: subDays(new Date(), 30), end: new Date() }),
    },
    {
      label: "Last Week",
      range: () => ({ start: subWeeks(new Date(), 1), end: new Date() }),
    },
    {
      label: "Last Month",
      range: () => ({ start: subMonths(new Date(), 1), end: new Date() }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => onChange(preset.range())}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <input
            id="start-date"
            type="datetime-local"
            value={format(value.start, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => {
              const newStart = new Date(e.target.value);
              onChange({ ...value, start: newStart });
            }}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="end-date">End Date</Label>
          <input
            id="end-date"
            type="datetime-local"
            value={format(value.end, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => {
              const newEnd = new Date(e.target.value);
              onChange({ ...value, end: newEnd });
            }}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Selected Range: {format(value.start, "MMM d, yyyy HH:mm")} -{" "}
        {format(value.end, "MMM d, yyyy HH:mm")}
      </div>
    </div>
  );
}
