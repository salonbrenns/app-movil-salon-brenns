import { useEffect, useState } from 'react';

/** Keep time-dependent agenda states current while their screen is mounted. */
export function useCurrentTime(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return now;
}
