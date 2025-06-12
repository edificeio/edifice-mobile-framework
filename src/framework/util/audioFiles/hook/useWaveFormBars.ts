import { useRef } from 'react';

export function useWaveformBars() {
  const barsRef = useRef<number[]>([]);

  const setBars = (bars: number[]) => {
    barsRef.current = bars;
  };

  return { barsRef, setBars };
}
