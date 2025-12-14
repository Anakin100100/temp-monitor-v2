import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  boolean,
} from "drizzle-orm/pg-core";

export const device = pgTable("device", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sensorReading = pgTable("sensor_reading", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id")
    .notNull()
    .references(() => device.id),
  temperature: integer("temperature").notNull(),
  humidity: integer("humidity").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
