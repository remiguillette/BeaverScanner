import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Defining the database schema for license plates
export const licensePlates = pgTable("license_plates", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull(),
  region: text("region"),
  status: text("status").notNull(), // "valid", "expired", "suspended", "other"
  detectionType: text("detection_type").notNull(), // "automatic", "manual"
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  details: text("details")
});

// Schema for inserting a new license plate
export const insertLicensePlateSchema = createInsertSchema(licensePlates).omit({
  id: true,
  detectedAt: true
});

// Validation schema for Canada license plates (optimized for Ontario format)
export const canadaLicensePlateSchema = z.object({
  plateNumber: z.string().regex(/^[A-Z]{1,4}[ -]?[0-9A-Z]{1,4}$/i, 
    { message: "Format de plaque d'immatriculation canadienne invalide" })
});

// Validation schema for USA license plates
export const usaLicensePlateSchema = z.object({
  plateNumber: z.string().regex(/^[A-Z0-9]{1,8}$/i, 
    { message: "Format de plaque d'immatriculation américaine invalide" })
});

// Validation statuses
export const plateStatusSchema = z.enum([
  "valid", 
  "expired", 
  "suspended", 
  "other"
]);

// Type definitions
export type InsertLicensePlate = z.infer<typeof insertLicensePlateSchema>;
export type LicensePlate = typeof licensePlates.$inferSelect;
export type PlateStatus = z.infer<typeof plateStatusSchema>;

// WebSocket message types
export type WebSocketMessage = {
  type: "PLATE_DETECTED" | "PLATE_VALIDATED" | "ERROR";
  data?: any;
  error?: string;
};
