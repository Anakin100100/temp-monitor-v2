"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeSelectorProps {
  value: number; // minutes
  onChange: (minutes: number) => void;
}

const TIME_RANGES = [
  { label: "1 minute", value: 1 },
  { label: "2 minutes", value: 2 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="time-range">Time Range</Label>
      <div className="flex items-center space-x-2">
        <Select
          value={value.toString()}
          onValueChange={(newValue) => onChange(Number.parseInt(newValue, 10))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value.toString()}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          Last {value} minute{value !== 1 ? "s" : ""} of data
        </div>
      </div>
    </div>
  );
}
