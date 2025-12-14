import { eq, desc } from "drizzle-orm";
import z from "zod";
import { db } from "@temp-monitor-v2/db";
import { device, sensorReading } from "@temp-monitor-v2/db/schema/sensor";
import { protectedProcedure, deviceProcedure } from "../index";

export const monitoringRouter = {
  // Device endpoints
  addReading: deviceProcedure
    .input(
      z.object({
        deviceId: z.string(),
        temperature: z.number(),
        humidity: z.number(),
      })
    )
    .handler(async ({ input }) => {
      // Ensure device exists
      const existingDevice = await db
        .select()
        .from(device)
        .where(eq(device.id, input.deviceId))
        .limit(1);

      if (existingDevice.length === 0) {
        await db.insert(device).values({
          id: input.deviceId,
          name: `Device ${input.deviceId}`,
        });
      }

      // Add sensor reading
      return await db.insert(sensorReading).values({
        deviceId: input.deviceId,
        temperature: input.temperature,
        humidity: input.humidity,
      });
    }),

  // User endpoints
  getDevices: protectedProcedure.handler(async () => {
    return await db.select().from(device).where(eq(device.isActive, true));
  }),

  getReadings: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().optional(),
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .handler(async ({ input }) => {
      const baseQuery = db
        .select()
        .from(sensorReading)
        .orderBy(desc(sensorReading.timestamp));

      if (input.deviceId) {
        return await baseQuery
          .where(eq(sensorReading.deviceId, input.deviceId))
          .limit(input.limit);
      }

      return await baseQuery.limit(input.limit);
    }),

  getLatestReadings: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .handler(async ({ input }) => {
      const baseQuery = db
        .select()
        .from(sensorReading)
        .orderBy(desc(sensorReading.timestamp));

      if (input.deviceId) {
        return await baseQuery
          .where(eq(sensorReading.deviceId, input.deviceId))
          .limit(input.limit);
      }

      return await baseQuery.limit(input.limit);
    }),

  getStats: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().optional(),
        startTime: z.date(),
        endTime: z.date(),
      })
    )
    .handler(async ({ input }) => {
      // Simplified stats - get latest 100 readings and calculate stats
      const baseQuery = db
        .select()
        .from(sensorReading)
        .orderBy(desc(sensorReading.timestamp));

      if (input.deviceId) {
        return await baseQuery
          .where(eq(sensorReading.deviceId, input.deviceId))
          .limit(100);
      }

      const readings = await baseQuery.limit(100);

      if (readings.length === 0) {
        return {
          count: 0,
          avgTemperature: 0,
          avgHumidity: 0,
          minTemperature: 0,
          maxTemperature: 0,
          minHumidity: 0,
          maxHumidity: 0,
        };
      }

      const temperatures = readings.map((r) => r.temperature);
      const humidities = readings.map((r) => r.humidity);

      return {
        count: readings.length,
        avgTemperature:
          temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
        minTemperature: Math.min(...temperatures),
        maxTemperature: Math.max(...temperatures),
        minHumidity: Math.min(...humidities),
        maxHumidity: Math.max(...humidities),
      };
    }),
};
