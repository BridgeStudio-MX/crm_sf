import { useEffect, useState } from 'react';

import { PARKS_SERVICE_URL } from '@/parks-industrial/constants/parks-commercial.constants';

export const getParksGoogleMapsApiKeyFromEnv = (): string =>
  import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';

export const isValidGoogleMapsApiKey = (apiKey: string): boolean =>
  apiKey.startsWith('AIza');

type ParksGoogleMapsApiKeyState = {
  apiKey: string;
  isReady: boolean;
  isLoading: boolean;
};

// Bake-time key when present; otherwise load from parks-api /config/public
export const useParksGoogleMapsApiKey = (): ParksGoogleMapsApiKeyState => {
  const bakedApiKey = getParksGoogleMapsApiKeyFromEnv();
  const [apiKey, setApiKey] = useState(
    isValidGoogleMapsApiKey(bakedApiKey) ? bakedApiKey : '',
  );
  const [isLoading, setIsLoading] = useState(
    !isValidGoogleMapsApiKey(bakedApiKey),
  );

  useEffect(() => {
    if (isValidGoogleMapsApiKey(bakedApiKey)) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`${PARKS_SERVICE_URL}/config/public`);

        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as {
          googleMapsApiKey?: string;
        };
        const nextKey = body.googleMapsApiKey ?? '';

        if (!cancelled && isValidGoogleMapsApiKey(nextKey)) {
          setApiKey(nextKey);
        }
      } catch {
        // Keep empty key — map UI shows simplified fallback
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bakedApiKey]);

  return {
    apiKey,
    isReady: isValidGoogleMapsApiKey(apiKey),
    isLoading,
  };
};
