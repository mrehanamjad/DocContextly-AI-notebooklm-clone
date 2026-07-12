import { useEffect, useRef, useState } from "react";

interface PollingOptions<T> {
  queryFn: () => Promise<T>;
  isComplete: (data: T) => boolean;
  isError?: (data: T) => boolean;
  interval?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: any) => void;
}

export function usePolling<T>({
  queryFn,
  isComplete,
  isError,
  interval = 3000,
  enabled = false,
  onSuccess,
  onError,
}: PollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(false);

  const queryFnRef = useRef(queryFn);
  const isCompleteRef = useRef(isComplete);
  const isErrorRef = useRef(isError);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Keep references updated to avoid resetting the interval timer on re-renders
  useEffect(() => {
    queryFnRef.current = queryFn;
    isCompleteRef.current = isComplete;
    isErrorRef.current = isError;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!enabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    let timerId: NodeJS.Timeout | null = null;
    let isActive = true;

    async function poll() {
      try {
        const result = await queryFnRef.current();
        if (!isActive) return;

        setData(result);

        if (isCompleteRef.current(result)) {
          setIsPolling(false);
          onSuccessRef.current?.(result);
        } else if (isErrorRef.current?.(result)) {
          setIsPolling(false);
          const errorMsg = (result as any)?.error_message || "Processing failed";
          onErrorRef.current?.(new Error(errorMsg));
        } else {
          timerId = setTimeout(poll, interval);
        }
      } catch (err: any) {
        if (!isActive) return;
        setError(err);
        setIsPolling(false);
        onErrorRef.current?.(err);
      }
    }

    poll();

    return () => {
      isActive = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [enabled, interval]);

  return {
    data,
    error,
    isPolling,
  };
}
export default usePolling;
