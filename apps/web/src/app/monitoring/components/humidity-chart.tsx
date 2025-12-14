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

interface HumidityChartProps {
  data: Array<{
    timestamp: Date;
    temperature: number;
    humidity: number;
  }>;
}

export function HumidityChart({ data }: HumidityChartProps) {
  const chartData = data.map((reading) => ({
    time: format(new Date(reading.timestamp), "HH:mm:ss"),
    humidity: reading.humidity,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" fontSize={12} interval="preserveStartEnd" />
        <YAxis
          fontSize={12}
          label={{ value: "Humidity (%)", angle: -90, position: "insideLeft" }}
          domain={[0, 100]}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, "Humidity"]}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="humidity"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Humidity"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
