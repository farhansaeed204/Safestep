import { useEffect, useRef } from 'react';
import type { Detection } from '@/ml/types';
import { demoSample } from './demoDetections';

/** Feed simulated detections while demo mode is active. */
export function useDemoSource(
  active: boolean,
  onDetections: (detections: Detection[]) => void,
): void {
  const callbackRef = useRef(onDetections);

  useEffect(() => {
    callbackRef.current = onDetections;
  }, [onDetections]);

  useEffect(() => {
    if (!active) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      callbackRef.current(demoSample((Date.now() - startedAt) / 1000));
    }, 450);
    return () => clearInterval(id);
  }, [active]);
}
