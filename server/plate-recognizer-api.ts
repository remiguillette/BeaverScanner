import { PlateStatus } from '@shared/schema';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Buffer } from 'buffer';

// Interface pour les résultats de l'API Plate Recognizer
interface PlateRecognizerResult {
  results: {
    box: {
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
    };
    plate: string;
    region: {
      code: string;
      score: number;
    };
    score: number;
    candidates: {
      score: number;
      plate: string;
    }[];
    vehicle: {
      type: string;
      score: number;
    };
  }[];
  filename: string;
  processing_time: number;
  version: number;
  camera_id: string | null;
  timestamp: string;
}

/**
 * Envoie une image à l'API Plate Recognizer pour reconnaissance
 * @param imageBase64 - Image en base64
 * @returns Résultat de la reconnaissance
 */
export async function recognizePlateWithAPI(imageBase64: string): Promise<{
  detected: boolean;
  plateNumber?: string;
  region?: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}> {
  try {
    // Extraire les données d'image réelles (sans le préfixe data:image)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Obtenir la clé API depuis les variables d'environnement
    const apiKey = process.env.PLATE_RECOGNIZER_API_KEY;
    
    if (!apiKey) {
      console.error('Clé API Plate Recognizer non configurée');
      throw new Error('Clé API Plate Recognizer non configurée');
    }
    
    // Utiliser une approche simple avec l'API file upload de Plate Recognizer
    // Convertir base64 en buffer pour l'envoyer comme un fichier
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Créer un form-data avec la librairie form-data
    const formData = new FormData();
    formData.append('upload', imageBuffer, 'plate.jpg');
    formData.append('regions', 'fr,ca-on,ca-qc,us');
    
    // Configuration pour le mode et seuils de confiance
    const configObj = {
      mode: 'fast',
      detection_mode: 'vehicle'
    };
    formData.append('config', JSON.stringify(configObj));
    
    // Construire les options de la requête
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`
      },
      body: formData
    };
    
    // Envoyer la requête à l'API Plate Recognizer
    console.log('Envoi de la requête à l\'API Plate Recognizer...');
    const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', requestOptions);
    
    // Vérifier la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur de l'API Plate Recognizer: ${response.status} ${errorText}`);
      return { detected: false };
    }
    
    // Analyser la réponse JSON
    const data = await response.json() as PlateRecognizerResult;
    
    // Si aucun résultat n'est trouvé, retourner détection négative
    if (!data.results || data.results.length === 0) {
      return { detected: false };
    }
    
    // Obtenir le meilleur résultat (le premier)
    const bestResult = data.results[0];
    
    // Extraire les informations pertinentes
    const plateNumber = bestResult.plate;
    const confidence = bestResult.score;
    const regionCode = bestResult.region?.code || 'unknown';
    
    // Convertir le code de région en nom complet
    let region = 'Inconnu';
    if (regionCode.includes('fr')) {
      region = 'France';
    } else if (regionCode === 'ca-on') {
      region = 'Ontario';
    } else if (regionCode === 'ca-qc') {
      region = 'Québec';
    } else if (regionCode.includes('ca')) {
      region = 'Canada';
    } else if (regionCode.includes('us')) {
      region = 'États-Unis';
    }
    
    // Extraire les coordonnées de la boîte englobante
    const boundingBox = {
      x: bestResult.box.xmin,
      y: bestResult.box.ymin,
      width: bestResult.box.xmax - bestResult.box.xmin,
      height: bestResult.box.ymax - bestResult.box.ymin
    };
    
    console.log(`Plaque détectée: ${plateNumber} (${region}) avec une confiance de ${confidence}`);
    
    return {
      detected: true,
      plateNumber,
      region,
      confidence,
      boundingBox
    };
    
  } catch (error) {
    console.error('Erreur lors de la reconnaissance par API:', error);
    return { detected: false };
  }
}

/**
 * Valide une plaque d'immatriculation (pour les plaques saisies manuellement)
 * Détermine si la plaque est valide, expirée, etc. basé sur des règles définies
 */
export function validatePlateStatus(plateNumber: string): PlateStatus {
  // Dans une vraie application, cette fonction ferait une requête à une base de données
  // de plaques d'immatriculation pour vérifier le statut réel
  
  // Pour cette démo, nous utilisons une logique simplifiée basée sur le dernier caractère
  const lastChar = plateNumber.charAt(plateNumber.length - 1);
  const lastDigit = parseInt(lastChar, 10);
  
  if (isNaN(lastDigit)) {
    return "other";
  } else if (lastDigit >= 7) {
    return "valid";
  } else if (lastDigit >= 4) {
    return "expired";
  } else if (lastDigit >= 2) {
    return "suspended";
  } else {
    return "other";
  }
}

/**
 * Génère des détails explicatifs pour un statut de plaque donné
 */
export function getStatusDetails(status: PlateStatus): string {
  switch (status) {
    case "valid":
      return "Plaque en règle - Véhicule standard";
    case "expired":
      return "La plaque a expiré - Renouvellement requis";
    case "suspended":
      return "La plaque est suspendue - Consulter les autorités";
    default:
      return "Information non disponible - Statut indéterminé";
  }
}