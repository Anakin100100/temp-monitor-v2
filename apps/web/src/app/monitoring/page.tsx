"use client";

import { useState } from "react";
import { subHours, subDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Play, Pause, Download } from "lucide-react";
import { TemperatureChart } from "./components/temperature-chart";
import { HumidityChart } from "./components/humidity-chart";
import { StatsPanel } from "./components/stats-panel";
import { DateRangePicker } from "./components/date-range-picker";

export default function MonitoringPage() {
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: subHours(new Date(), 24),
    end: new Date(),
  });

  // Live data queries
  const { data: latestData, isLoading: latestLoading } = useQuery({
    ...orpc.monitoring.getLatestReadings.queryOptions({ limit: 100 }),
    refetchInterval: liveUpdates ? 500 : false,
    enabled: liveUpdates,
  });

  // Historical data queries
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    ...orpc.monitoring.getReadings.queryOptions({
      startTime: dateRange.start,
      endTime: dateRange.end,
      limit: 1000,
    }),
    enabled: !liveUpdates,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    ...orpc.monitoring.getStats.queryOptions({
      startTime: dateRange.start,
      endTime: dateRange.end,
    }),
    enabled: !liveUpdates,
  });

  const chartData = liveUpdates ? latestData : historicalData;
  const isLoading = liveUpdates ? latestLoading : historicalLoading;

  const handleExportCSV = () => {
    if (!chartData || chartData.length === 0) return;

    const csv = [
      "Timestamp,Temperature,Humidity",
      ...chartData.map(
        (reading) =>
          `${reading.timestamp},${reading.temperature},${reading.humidity}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Temperature & Humidity Monitoring
          </h1>
          <p className="text-muted-foreground">
            {liveUpdates
              ? "Live data from your IoT device"
              : "Historical data analysis"}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="live-updates"
              checked={liveUpdates}
              onCheckedChange={setLiveUpdates}
            />
            <Label
              htmlFor="live-updates"
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Live</span>
            </Label>
          </div>

          {!liveUpdates && (
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {!liveUpdates && (
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>
              Select a time range to view historical data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </CardContent>
        </Card>
      )}

      {!liveUpdates && stats && (
        <StatsPanel stats={stats} isLoading={statsLoading} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
            <CardDescription>
              Real-time temperature readings from your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <TemperatureChart data={chartData || []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Humidity</CardTitle>
            <CardDescription>
              Real-time humidity readings from your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <HumidityChart data={chartData || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
