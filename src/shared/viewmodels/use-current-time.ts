
import { useEffect, useState } from 'react';

/**
 * Mantiene actualizada la hora utilizada
 * en los estados de la agenda.
 */
export function useCurrentTime(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return now;
}
