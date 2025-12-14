"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface TemperatureChartProps {
  data: Array<{
    id: number;
    deviceId: string;
    temperature: number;
    humidity: number;
    timestamp: Date;
  }>;
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = data
    .slice()
    .reverse()
    .map((reading) => ({
      time: format(new Date(reading.timestamp), "HH:mm:ss"),
      temperature: reading.temperature,
    }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" fontSize={12} interval="preserveStartEnd" />
        <YAxis
          fontSize={12}
          label={{
            value: "Temperature (°C)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value: number) => [`${value}°C`, "Temperature"]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          name="Temperature"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
