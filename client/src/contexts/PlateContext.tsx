import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PlateStatus } from '@shared/schema';
import { useAudio } from '@/hooks/use-audio';

type PlateData = {
  plateNumber: string;
  region: string;
  status: PlateStatus;
  detectedAt: Date;
  details?: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type PlateContextType = {
  currentPlate: PlateData | null;
  plateStatus: PlateStatus;
  soundEnabled: boolean;
  webSocketConnected: boolean;
  setCurrentPlate: (plate: PlateData | null) => void;
  updatePlateStatus: (status: PlateStatus) => void;
  toggleSound: () => void;
  handlePlateDetection: (plateData: any) => void;
  setWebSocketConnected: (connected: boolean) => void;
};

const PlateContext = createContext<PlateContextType | undefined>(undefined);

export function PlateProvider({ children }: { children: ReactNode }) {
  const [currentPlate, setCurrentPlate] = useState<PlateData | null>(null);
  const [plateStatus, setPlateStatus] = useState<PlateStatus>('valid');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const { playSound } = useAudio();
  
  const updatePlateStatus = useCallback((status: PlateStatus) => {
    setPlateStatus(status);
  }, []);
  
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);
  
  const handlePlateDetection = useCallback((plateData: any) => {
    if (!plateData) return;
    
    const newPlateData: PlateData = {
      plateNumber: plateData.plateNumber,
      region: plateData.region || "",
      status: plateData.status || "valid",
      detectedAt: new Date(),
      details: plateData.details || "",
      confidence: plateData.confidence,
      boundingBox: plateData.boundingBox
    };
    
    setCurrentPlate(newPlateData);
    updatePlateStatus(newPlateData.status);
    
    // Play sound for detected plate status
    if (soundEnabled) {
      playSound(newPlateData.status);
    }
    
    console.log('Plaque détectée:', newPlateData);
  }, [soundEnabled, updatePlateStatus, playSound]);
  
  const value = {
    currentPlate,
    plateStatus,
    soundEnabled,
    webSocketConnected,
    setCurrentPlate,
    updatePlateStatus,
    toggleSound,
    handlePlateDetection,
    setWebSocketConnected,
  };
  
  return <PlateContext.Provider value={value}>{children}</PlateContext.Provider>;
}

export function usePlateContext() {
  const context = useContext(PlateContext);
  if (context === undefined) {
    throw new Error('usePlateContext must be used within a PlateProvider');
  }
  return context;
}
