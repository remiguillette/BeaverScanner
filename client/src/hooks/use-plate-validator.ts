import { useState, useCallback } from 'react';
import { validatePlate } from '@/lib/plate-validator';

export function usePlateValidator() {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const validate = useCallback((plateNumber: string, format: 'CA' | 'US' = 'CA') => {
    try {
      const valid = validatePlate(plateNumber, format);
      setIsValid(valid);
      setError(null);
      return valid;
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid plate format');
      return false;
    }
  }, []);
  
  return { isValid, error, validate };
}
