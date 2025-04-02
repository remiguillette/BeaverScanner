import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Settings, AlertTriangle, Info } from "lucide-react";
import { usePlateContext } from "@/contexts/PlateContext";
import { apiRequest } from "@/lib/queryClient";
import { LicensePlate } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

// Type pour la réponse de l'API de détection
type ScanResponse = {
  detected: boolean;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
} & Partial<LicensePlate>;

export default function Scanner() {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | undefined>(undefined);
  const [lastConfidence, setLastConfidence] = useState<number | null>(null);
  const { currentPlate, plateStatus, soundEnabled, webSocketConnected, toggleSound } = usePlateContext();
  
  // Get list of available cameras
  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        setAvailableCameras(videoDevices);
        // Sélectionner la première caméra avec un deviceId valide
        const validCamera = videoDevices.find(device => device.deviceId && device.deviceId !== "");
        if (validCamera) {
          setSelectedCamera(validCamera.deviceId);
        } else {
          // Si aucune caméra valide n'est trouvée, utiliser une valeur par défaut
          setSelectedCamera("default");
        }
      } catch (error) {
        console.error("Error accessing camera devices:", error);
      }
    }
    
    getDevices();
  }, []);
  
  const toggleScanner = () => {
    setIsScannerActive(!isScannerActive);
  };
  
  // État pour suivre le temps écoulé depuis la dernière plaque détectée
  const [lastDetectionTime, setLastDetectionTime] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  
  // Fonction pour capturer les images et les envoyer au serveur pour traitement
  useEffect(() => {
    let captureInterval: NodeJS.Timeout | null = null;
    
    if (isScannerActive && webcamRef.current && webSocketConnected) {
      captureInterval = setInterval(async () => {
        // Si déjà en cours de traitement, sauter cette capture
        if (isProcessing) return;
        
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          setIsProcessing(true);
          setScanCount(prev => prev + 1);
          try {
            // Envoyer l'image au serveur pour traitement
            const response = await apiRequest<ScanResponse>("POST", "/api/scan", { image: imageSrc });
            
            // Mise à jour de la confiance de la détection
            if (response && response.confidence !== undefined) {
              setLastConfidence(response.confidence);
            }
            
            // Si une plaque a été détectée, mettre à jour le temps de dernière détection
            if (response && response.detected === true) {
              setLastDetectionTime(Date.now());
            }
          } catch (error) {
            console.error("Erreur lors de l'envoi de l'image:", error);
          } finally {
            setIsProcessing(false);
          }
        }
      }, 2000); // Capture toutes les 2 secondes
    }
    
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [isScannerActive, webcamRef, webSocketConnected, isProcessing]);
  
  // Video constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment",
    deviceId: selectedCamera && selectedCamera !== "default" 
      ? { exact: selectedCamera } 
      : undefined
  };

  return (
    <Card className="shadow-lg border-border overflow-hidden">
      <CardHeader className="border-b border-border flex flex-row justify-between items-center py-3 px-4">
        <CardTitle className="font-semibold text-lg">Scanner en Direct</CardTitle>
        <div className="flex items-center">
          <div className="mr-4 flex items-center">
            <div className={`h-2 w-2 rounded-full ${isScannerActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} mr-2`}></div>
            <span className={`text-sm ${isScannerActive ? 'text-red-500' : 'text-gray-500'}`}>REC</span>
          </div>
          <Settings className="text-primary hover:text-primary/80 h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="aspect-video bg-black relative rounded overflow-hidden border border-border/50 flex items-center justify-center">
          {isScannerActive ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground">Cliquez sur Démarrer pour activer le scanner</div>
            </div>
          )}
          
          {/* Scanner overlay with guidelines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-primary/60 w-3/4 h-1/3 rounded-md flex items-center justify-center">
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>
          
          {/* Processing indicator */}
          {isScannerActive && isProcessing && (
            <div className="absolute top-4 right-4 bg-background/80 p-2 rounded text-sm flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse mr-2"></div>
              <span>Analyse d'image en cours...</span>
            </div>
          )}
          
          {/* Confidence meter */}
          {isScannerActive && lastConfidence !== null && (
            <div className="absolute top-4 left-4 bg-background/80 p-2 rounded text-sm flex flex-col w-48">
              <div className="flex justify-between mb-1">
                <span>Confiance</span>
                <span>{Math.round(lastConfidence * 100)}%</span>
              </div>
              <Progress 
                value={lastConfidence * 100} 
                className={`h-2 ${lastConfidence > 0.8 ? "text-green-500" : lastConfidence > 0.7 ? "text-yellow-500" : "text-red-500"}`}
              />
            </div>
          )}
          
          {/* License plate detection overlay */}
          {isScannerActive && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/80 p-2 rounded flex items-center justify-between text-sm">
              {currentPlate ? (
                <>
                  <div>Plaque détectée: <span className="font-mono font-bold">{currentPlate.plateNumber}</span></div>
                  <div className={`status-badge ${
                    plateStatus === 'valid' ? 'bg-green-500/20 text-green-500' :
                    plateStatus === 'expired' ? 'bg-orange-500/20 text-orange-500' :
                    plateStatus === 'suspended' ? 'bg-red-500/20 text-red-500' :
                    'bg-gray-500/20 text-gray-500'
                  } px-2 py-1 rounded flex items-center`}>
                    <span className={`h-2 w-2 rounded-full mr-1 ${
                      plateStatus === 'valid' ? 'bg-green-500' :
                      plateStatus === 'expired' ? 'bg-orange-500' :
                      plateStatus === 'suspended' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></span>
                    {plateStatus === 'valid' ? 'Valide' :
                     plateStatus === 'expired' ? 'Expirée' :
                     plateStatus === 'suspended' ? 'Suspendue' : 'Autre'}
                  </div>
                </>
              ) : (
                <div className="w-full text-center text-muted-foreground">
                  Aucune plaque détectée. Veuillez pointer la caméra vers une plaque d'immatriculation.
                </div>
              )}
            </div>
          )}
          
          {/* System messages */}
          {!webSocketConnected && isScannerActive && (
            <div className="absolute top-1/2 left-0 right-0 mx-auto bg-red-500/80 p-2 text-white text-center text-sm flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Connexion au serveur perdue. Tentative de reconnexion...
            </div>
          )}
          
          {/* Scan stats */}
          {isScannerActive && (
            <div className="absolute top-16 left-4 bg-background/60 px-2 py-1 rounded text-xs">
              <Info className="h-3 w-3 inline mr-1" /> Images analysées: {scanCount}
            </div>
          )}
          
          {/* Bounding box overlay */}
          {isScannerActive && currentPlate && currentPlate.boundingBox && (
            <div 
              className={`absolute border-2 ${
                plateStatus === 'valid' ? 'border-green-500' :
                plateStatus === 'expired' ? 'border-orange-500' :
                plateStatus === 'suspended' ? 'border-red-500' :
                'border-blue-500'
              } rounded-sm`}
              style={{
                left: `${currentPlate.boundingBox.x}px`,
                top: `${currentPlate.boundingBox.y}px`,
                width: `${currentPlate.boundingBox.width}px`,
                height: `${currentPlate.boundingBox.height}px`,
                transform: 'scale(1)', // Adapté selon la mise à l'échelle de l'image
                opacity: 0.7
              }}
            >
              <div className={`absolute -top-6 left-0 text-xs px-2 py-1 rounded-t ${
                plateStatus === 'valid' ? 'bg-green-500' :
                plateStatus === 'expired' ? 'bg-orange-500' :
                plateStatus === 'suspended' ? 'bg-red-500' :
                'bg-blue-500'
              } text-white`}>
                {currentPlate.plateNumber}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button 
            className="bg-primary hover:bg-primary/80 text-white font-medium"
            onClick={toggleScanner}
          >
            <Camera className="h-5 w-5 mr-1" />
            {isScannerActive ? 'Arrêter le Scanner' : 'Démarrer le Scanner'}
          </Button>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-muted-foreground">Son:</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground mr-3"
              onClick={() => toggleSound()}
            >
              {soundEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <line x1="17" y1="7" x2="7" y2="17" strokeWidth={2} strokeLinecap="round" />
                </svg>
              )}
            </Button>
            
            <span className="mr-2 text-sm text-muted-foreground">Caméra:</span>
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger className="w-44 bg-background border-border text-sm">
                <SelectValue placeholder="Caméra par défaut" />
              </SelectTrigger>
              <SelectContent>
                {availableCameras
                  .filter(camera => camera.deviceId && camera.deviceId !== "") // Filtrer les caméras sans deviceId
                  .map((camera) => (
                    <SelectItem key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Caméra ${availableCameras.indexOf(camera) + 1}`}
                    </SelectItem>
                  ))}
                  {availableCameras.length === 0 && (
                    <SelectItem value="default">Caméra par défaut</SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
