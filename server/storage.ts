import { 
  licensePlates, 
  type LicensePlate, 
  type InsertLicensePlate
} from "@shared/schema";

// Storage interface
export interface IStorage {
  createLicensePlate(plate: InsertLicensePlate): Promise<LicensePlate>;
  getPlateById(id: number): Promise<LicensePlate | undefined>;
  getPlateByNumber(plateNumber: string): Promise<LicensePlate | undefined>;
  getRecentPlates(limit: number): Promise<LicensePlate[]>;
  getAllPlates(): Promise<LicensePlate[]>;
  updatePlate(id: number, data: Partial<InsertLicensePlate>): Promise<LicensePlate | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private plates: Map<number, LicensePlate>;
  private currentId: number;

  constructor() {
    this.plates = new Map();
    this.currentId = 1;
    
    // Add some initial data for testing
    this.seedInitialData();
  }
  
  private seedInitialData() {
    const initialPlates: InsertLicensePlate[] = [
      {
        plateNumber: "CBPC 344",
        region: "Ontario",
        status: "valid",
        detectionType: "automatic",
        details: "Plaque en règle - Véhicule standard"
      },
      {
        plateNumber: "OPN 4BIZ",
        region: "Ontario",
        status: "expired",
        detectionType: "manual",
        details: "La plaque a expiré - Renouvellement requis avant circulation"
      },
      {
        plateNumber: "GVAH 823",
        region: "Ontario",
        status: "suspended",
        detectionType: "automatic",
        details: "La plaque est suspendue - Contacter Service Ontario"
      },
      {
        plateNumber: "ABC1234",
        region: "New York",
        status: "other",
        detectionType: "manual",
        details: "Plaque étrangère - Véhicule de tourisme"
      }
    ];
    
    // Add plates with timestamps 2-5 minutes apart
    const baseTime = new Date();
    baseTime.setMinutes(baseTime.getMinutes() - initialPlates.length * 5);
    
    initialPlates.forEach((plate, index) => {
      const detectedAt = new Date(baseTime);
      detectedAt.setMinutes(detectedAt.getMinutes() + index * 5);
      
      this.createLicensePlate({
        ...plate,
      }).catch(console.error);
    });
  }

  async createLicensePlate(plateData: InsertLicensePlate): Promise<LicensePlate> {
    const id = this.currentId++;
    const now = new Date();
    
    // S'assurer que la région n'est jamais undefined
    const region = plateData.region || 'Inconnu';
    
    const plate: LicensePlate = {
      id,
      plateNumber: plateData.plateNumber,
      region: region as string | null, // Garantit que region est string | null, jamais undefined
      status: plateData.status,
      detectionType: plateData.detectionType,
      details: plateData.details || null,
      detectedAt: now
    };
    
    this.plates.set(id, plate);
    return plate;
  }

  async getPlateById(id: number): Promise<LicensePlate | undefined> {
    return this.plates.get(id);
  }

  async getPlateByNumber(plateNumber: string): Promise<LicensePlate | undefined> {
    const plates = Array.from(this.plates.values());
    return plates.find(plate => plate.plateNumber === plateNumber);
  }

  async getRecentPlates(limit: number): Promise<LicensePlate[]> {
    const plates = Array.from(this.plates.values());
    
    // Sort by detection time, most recent first
    return plates
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
      .slice(0, limit);
  }
  
  async getAllPlates(): Promise<LicensePlate[]> {
    return Array.from(this.plates.values());
  }
  
  async updatePlate(id: number, data: Partial<InsertLicensePlate>): Promise<LicensePlate | undefined> {
    const plate = this.plates.get(id);
    
    if (!plate) {
      return undefined;
    }
    
    // S'assurer que la région n'est jamais undefined si elle est fournie
    const region = data.region || plate.region || 'Inconnu';
    
    const updatedPlate: LicensePlate = {
      ...plate,
      plateNumber: data.plateNumber || plate.plateNumber,
      region: region as string | null,
      status: data.status || plate.status,
      detectionType: data.detectionType || plate.detectionType,
      details: data.details !== undefined ? (data.details || null) : plate.details,
      detectedAt: plate.detectedAt
    };
    
    this.plates.set(id, updatedPlate);
    return updatedPlate;
  }
}

export const storage = new MemStorage();
