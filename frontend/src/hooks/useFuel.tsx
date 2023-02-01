import { useState, useEffect } from 'react';
import { Fuel } from '@fuel-wallet/sdk';

const globalWindow: Window & {
    fuel: Fuel;
} = typeof window !== 'undefined' ? window as any : ({} as any);

export function useFuel() {
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [fuel, setFuel] = useState<Fuel>(
    globalWindow.fuel
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (globalWindow.fuel) {
        setFuel(globalWindow.fuel);
      } else {
        setError('Fuel Wallet not detected on the window!');
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return [fuel, error, isLoading] as const;
}