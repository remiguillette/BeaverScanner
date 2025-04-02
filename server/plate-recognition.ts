import { PlateStatus } from '@shared/schema';
import { recognizePlateWithAPI, validatePlateStatus, getStatusDetails } from './plate-recognizer-api';

/**
 * Fonction principale qui utilise l'API Plate Recognizer pour la détection et la reconnaissance
 */
export async function recognizeLicensePlate(imageData: string): Promise<{
  detected: boolean;
  plateNumber?: string;
  region?: string;
  status?: PlateStatus;
  details?: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}> {
  try {
    console.log('Début de la reconnaissance de plaque...');
    
    // Utiliser l'API Plate Recognizer pour détecter et reconnaître la plaque
    const recognitionResult = await recognizePlateWithAPI(imageData);
    
    // Si aucune plaque n'est détectée, retourner résultat négatif
    if (!recognitionResult.detected || !recognitionResult.plateNumber) {
      console.log('Aucune plaque détectée');
      return { detected: false };
    }
    
    // Obtenir les informations de la plaque
    const plateNumber = recognitionResult.plateNumber;
    const region = recognitionResult.region || 'Inconnu';
    const confidence = recognitionResult.confidence || 0;
    const boundingBox = recognitionResult.boundingBox;
    
    console.log(`Plaque détectée: ${plateNumber}, Région: ${region}, Confiance: ${confidence}`);
    
    // Si la confiance est trop basse, considérer comme non détecté
    if (confidence < 0.6) {
      console.log('Confiance trop basse, plaque rejetée');
      return { detected: false };
    }
    
    // Déterminer le statut de la plaque et les détails
    const status = validatePlateStatus(plateNumber);
    const details = getStatusDetails(status);
    
    // Retourner le résultat complet
    return {
      detected: true,
      plateNumber,
      region,
      status,
      details,
      confidence,
      boundingBox
    };
  } catch (error) {
    console.error('Erreur lors de la reconnaissance de la plaque:', error);
    return { detected: false };
  }
}