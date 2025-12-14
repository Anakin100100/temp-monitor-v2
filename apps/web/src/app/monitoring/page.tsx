"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Play } from "lucide-react";
import { TemperatureChart } from "./components/temperature-chart";
import { HumidityChart } from "./components/humidity-chart";
import { TimeRangeSelector } from "./components/time-range-selector";

export default function MonitoringPage() {
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [timeRange, setTimeRange] = useState(5); // minutes

  // Get private data and monitoring data using proper oRPC client
  const { data: privateData, isLoading: privateLoading } = useQuery(
    orpc.privateData.queryOptions()
  );

  // Get monitoring data
  const { data: latestData, isLoading: dataLoading } = useQuery({
    queryKey: ["monitoring", liveUpdates ? "live" : `historical-${timeRange}`],
    queryFn: () => {
      if (liveUpdates) {
        // Live mode: get latest readings
        return fetch("/api/rpc/api-reference/monitoring/getLatestReadings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: 100 }),
        }).then((r) => r.json());
      } else {
        // Historical mode: get readings for time range
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - timeRange * 60 * 1000); // minutes to milliseconds

        return fetch("/api/rpc/api-reference/monitoring/getReadings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            limit: 1000,
          }),
        }).then((r) => r.json());
      }
    },
    refetchInterval: liveUpdates ? 500 : false,
    enabled: true,
  });

  const isLoading = privateLoading || dataLoading;

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
        </div>
      </div>

      {!liveUpdates && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-lg">Historical Data Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </CardContent>
        </Card>
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
            ) : latestData && latestData.length > 0 ? (
              <TemperatureChart data={latestData} />
            ) : (
              <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
                No temperature data available
              </div>
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
            ) : latestData && latestData.length > 0 ? (
              <HumidityChart data={latestData} />
            ) : (
              <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
                No humidity data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {latestData && latestData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium">Latest Temperature</div>
            <div className="text-2xl font-bold">
              {latestData[0]?.temperature || 0}°C
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium">Latest Humidity</div>
            <div className="text-2xl font-bold">
              {latestData[0]?.humidity || 0}%
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium">Total Readings</div>
            <div className="text-2xl font-bold">
              {latestData.length.toLocaleString()}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium">Device ID</div>
            <div className="text-lg font-bold">
              {latestData[0]?.deviceId || "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
