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
        plateNumber: "ABC-123",
        region: "Québec",
        status: "valid",
        detectionType: "automatic",
        details: "Plaque en règle"
      },
      {
        plateNumber: "XYZ-789",
        region: "Ontario",
        status: "expired",
        detectionType: "manual",
        details: "La plaque a expiré"
      },
      {
        plateNumber: "DEF-456",
        region: "New York",
        status: "suspended",
        detectionType: "automatic",
        details: "La plaque est suspendue"
      },
      {
        plateNumber: "GHI-789",
        region: "Colombie-Britannique",
        status: "other",
        detectionType: "manual",
        details: "Information non disponible"
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
    
    const plate: LicensePlate = {
      id,
      ...plateData,
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
    
    const updatedPlate: LicensePlate = {
      ...plate,
      ...data
    };
    
    this.plates.set(id, updatedPlate);
    return updatedPlate;
  }
}

export const storage = new MemStorage();
