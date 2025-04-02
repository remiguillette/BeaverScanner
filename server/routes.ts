import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupWebSocketServer } from "./websocket";
import { insertLicensePlateSchema, plateStatusSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupWebSocketServer(wss, storage);
  
  // API routes
  app.get("/api/plates/recent", async (req, res) => {
    try {
      const recentPlates = await storage.getRecentPlates(10);
      res.json(recentPlates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent plates" });
    }
  });
  
  app.post("/api/scan", async (req, res) => {
    try {
      // Validate request body
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }
      
      // In a real implementation, we would use ALPR to recognize the plate
      // For this demo, we'll simulate a detection with a random plate number
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      
      let plateNumber = "";
      for (let i = 0; i < 3; i++) {
        plateNumber += letters[Math.floor(Math.random() * letters.length)];
      }
      plateNumber += "-";
      for (let i = 0; i < 3; i++) {
        plateNumber += numbers[Math.floor(Math.random() * numbers.length)];
      }
      
      // Simulate validation with random status
      const statuses = ["valid", "expired", "suspended", "other"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Save the detected plate to the database
      const newPlate = await storage.createLicensePlate({
        plateNumber,
        region: "Québec",
        status: randomStatus,
        detectionType: "automatic",
        details: randomStatus === "valid" ? "Plaque en règle" : 
                randomStatus === "expired" ? "La plaque a expiré" :
                randomStatus === "suspended" ? "La plaque est suspendue" : 
                "Information non disponible"
      });
      
      // Broadcast the detection to all connected WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "PLATE_DETECTED",
            data: newPlate
          }));
        }
      });
      
      res.json(newPlate);
    } catch (error) {
      console.error("Error processing scan:", error);
      res.status(500).json({ error: "Failed to process scan" });
    }
  });
  
  app.post("/api/validate", async (req, res) => {
    try {
      // Validate request with Zod schema
      const plateData = insertLicensePlateSchema.parse(req.body);
      
      // In a real implementation, we would validate against an external database
      // For this demo, we'll simulate validation with a random status
      const statuses = ["valid", "expired", "suspended", "other"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Save the validated plate to the database
      const newPlate = await storage.createLicensePlate({
        ...plateData,
        status: randomStatus,
        details: randomStatus === "valid" ? "Plaque en règle" : 
                randomStatus === "expired" ? "La plaque a expiré" :
                randomStatus === "suspended" ? "La plaque est suspendue" : 
                "Information non disponible"
      });
      
      // Broadcast the validation to all connected WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "PLATE_VALIDATED",
            data: newPlate
          }));
        }
      });
      
      res.json(newPlate);
    } catch (error) {
      console.error("Error validating plate:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid plate data", details: error.errors });
      }
      
      res.status(500).json({ error: "Failed to validate plate" });
    }
  });
  
  app.get("/api/stats", async (req, res) => {
    try {
      const allPlates = await storage.getAllPlates();
      
      // Filter plates detected today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayPlates = allPlates.filter(plate => {
        const plateDate = new Date(plate.detectedAt);
        return plateDate >= today;
      });
      
      // Count plates by status
      const validCount = todayPlates.filter(plate => plate.status === "valid").length;
      const expiredCount = todayPlates.filter(plate => plate.status === "expired").length;
      const suspendedCount = todayPlates.filter(plate => plate.status === "suspended").length;
      const otherCount = todayPlates.filter(plate => plate.status === "other").length;
      
      // Count plates by region
      const regionCounts: Record<string, number> = {};
      todayPlates.forEach(plate => {
        const region = plate.region || "Unknown";
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      });
      
      // Calculate region percentages
      const totalCount = todayPlates.length;
      const regionDistribution = Object.entries(regionCounts).map(([region, count]) => ({
        region,
        percentage: Math.round((count / totalCount) * 100) || 0
      })).sort((a, b) => b.percentage - a.percentage);
      
      // Return statistics
      res.json({
        totalToday: todayPlates.length,
        validCount,
        expiredCount,
        suspendedCount,
        otherCount,
        regionDistribution
      });
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: "Failed to get statistics" });
    }
  });

  return httpServer;
}
