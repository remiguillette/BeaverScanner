import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupWebSocketServer } from "./websocket";
import { insertLicensePlateSchema, plateStatusSchema } from "@shared/schema";
import { z } from "zod";
import { recognizeLicensePlate } from "./plate-recognition";

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
      
      // Utiliser le module de reconnaissance de plaque d'immatriculation
      const recognitionResult = await recognizeLicensePlate(image);
      
      if (!recognitionResult.detected) {
        // Si aucune plaque n'est détectée, renvoyer un objet vide
        return res.json({ detected: false });
      }
      
      // Enregistrer la plaque détectée dans la base de données
      const newPlate = await storage.createLicensePlate({
        plateNumber: recognitionResult.plateNumber!,
        region: recognitionResult.region || "Inconnu",
        status: recognitionResult.status || "other",
        detectionType: "automatic",
        details: recognitionResult.details || "Information non disponible"
      });
      
      // Diffuser la détection à tous les clients WebSocket connectés
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "PLATE_DETECTED",
            data: newPlate
          }));
        }
      });
      
      res.json({
        detected: true,
        ...newPlate,
        confidence: recognitionResult.confidence
      });
    } catch (error) {
      console.error("Error processing scan:", error);
      res.status(500).json({ error: "Failed to process scan" });
    }
  });
  
  app.post("/api/validate", async (req, res) => {
    try {
      // Validate request with Zod schema
      const plateData = insertLicensePlateSchema.parse(req.body);
      
      // Valider la plaque d'immatriculation saisie manuellement
      // La logique est similaire à celle dans plate-recognition.ts mais pour les saisies manuelles
      const plateNumber = plateData.plateNumber;
      
      // Extraire le dernier caractère pour déterminer le statut (pour la démo)
      const lastChar = plateNumber.charAt(plateNumber.length - 1);
      const lastDigit = parseInt(lastChar, 10);
      
      let status: string;
      let details: string;
      
      // Utiliser le dernier chiffre pour déterminer le statut (pour la démo seulement)
      if (isNaN(lastDigit)) {
        // Si le dernier caractère n'est pas un chiffre
        status = "other";
        details = "Information non disponible";
      } else if (lastDigit >= 7) {
        status = "valid";
        details = "Plaque en règle";
      } else if (lastDigit >= 4) {
        status = "expired";
        details = "La plaque a expiré";
      } else if (lastDigit >= 2) {
        status = "suspended";
        details = "La plaque est suspendue";
      } else {
        status = "other";
        details = "Information non disponible";
      }
      
      // Save the validated plate to the database
      const newPlate = await storage.createLicensePlate({
        ...plateData,
        status: status as any,
        details: details
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
