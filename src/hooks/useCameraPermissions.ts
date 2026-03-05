import { useCallback, useEffect, useState } from 'react';
import { Camera } from 'expo-camera';

export function useCameraPermissions() {
  const [granted, setGranted] = useState<boolean | null>(null);

  const request = useCallback(async () => {
    const response = await Camera.requestCameraPermissionsAsync();
    setGranted(response.status === 'granted');
    return response.status === 'granted';
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { granted, request };
}