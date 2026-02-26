import { useEffect, useRef, useState } from 'react';

const SSE_URL = "https://gridalpha-production.up.railway.app/stream/spark-spread";

export const useSparkSpreadStream = () => {
  const [data, setData] = useState<number[]>(new Array(576).fill(0));
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      const es = new EventSource(SSE_URL);

      es.addEventListener('update', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          // Directly set state - SparkSpreadSurface uses useFrame to pull from this array
          // avoiding unnecessary re-renders of the parent layout
          setData(parsed.values);
        } catch (err) {
          console.error("SSE Parse Error:", err);
        }
      });

      es.onerror = (err) => {
        console.error("SSE Connection Error:", err);
        es.close();
        // Exponential backoff for reconnection
        setTimeout(connect, 5000);
      };

      eventSourceRef.current = es;
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return data;
};