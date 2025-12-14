import { eq, and, gte, lte, desc } from "drizzle-orm";
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
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        limit: z.number().min(1).max(1000).default(1000),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [];

      if (input.deviceId) {
        conditions.push(eq(sensorReading.deviceId, input.deviceId));
      }

      if (input.startTime) {
        conditions.push(gte(sensorReading.timestamp, input.startTime));
      }

      if (input.endTime) {
        conditions.push(lte(sensorReading.timestamp, input.endTime));
      }

      let query = db.select().from(sensorReading);

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query
        .orderBy(desc(sensorReading.timestamp))
        .limit(input.limit);
    }),

  getLatestReadings: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .handler(async ({ input }) => {
      if (input.deviceId) {
        return await db
          .select()
          .from(sensorReading)
          .where(eq(sensorReading.deviceId, input.deviceId))
          .orderBy(desc(sensorReading.timestamp))
          .limit(input.limit);
      }

      return await db
        .select()
        .from(sensorReading)
        .orderBy(desc(sensorReading.timestamp))
        .limit(input.limit);
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
      const conditions = [
        gte(sensorReading.timestamp, input.startTime),
        lte(sensorReading.timestamp, input.endTime),
      ];

      if (input.deviceId) {
        conditions.push(eq(sensorReading.deviceId, input.deviceId));
      }

      const readings = await db
        .select()
        .from(sensorReading)
        .where(and(...conditions))
        .orderBy(desc(sensorReading.timestamp));

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
