import { canadaLicensePlateSchema, usaLicensePlateSchema } from '@shared/schema';

export function validatePlate(plateNumber: string, format: string): boolean {
  if (!plateNumber) return false;
  
  try {
    if (format === 'CA') {
      const result = canadaLicensePlateSchema.safeParse({ plateNumber });
      return result.success;
    } else if (format === 'US') {
      const result = usaLicensePlateSchema.safeParse({ plateNumber });
      return result.success;
    }
    return false;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

export function generateRandomStatus(): 'valid' | 'expired' | 'suspended' | 'other' {
  const statuses = ['valid', 'expired', 'suspended', 'other'];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex] as 'valid' | 'expired' | 'suspended' | 'other';
}

export function getStatusFrenchLabel(status: string): string {
  switch (status) {
    case 'valid':
      return 'Valide';
    case 'expired':
      return 'Expirée';
    case 'suspended':
      return 'Suspendue';
    default:
      return 'Autre';
  }
}
