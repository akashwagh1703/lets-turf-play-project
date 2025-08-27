import { useState, useCallback } from 'react';

type GeolocationState = {
  isLoading: boolean;
  coordinates: { lat: number; lon: number } | null;
  error: GeolocationPositionError | null;
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    isLoading: false,
    coordinates: null,
    error: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prevState => ({
        ...prevState,
        error: {
          code: 0,
          message: 'Geolocation is not supported by your browser.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
      }));
      return;
    }

    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          isLoading: false,
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          error: null,
        });
      },
      (error) => {
        setState({
          isLoading: false,
          coordinates: null,
          error,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { ...state, getLocation };
};
