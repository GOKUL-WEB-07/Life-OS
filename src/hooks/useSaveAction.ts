import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "../utils/errors";
export function useSaveAction() {
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const run = useCallback(async (action: () => Promise<unknown>) => {
    if (locked.current) return false;
    locked.current = true;
    if (mounted.current) {
      setBusy(true);
      setPending(false);
      setError("");
    }
    timer.current = setTimeout(() => {
      if (mounted.current) setPending(true);
    }, 12000);
    try {
      await action();
      return true;
    } catch (err) {
      if (mounted.current) setError(errorMessage(err));
      return false;
    } finally {
      clearTimeout(timer.current);
      locked.current = false;
      if (mounted.current) {
        setBusy(false);
        setPending(false);
      }
    }
  }, []);
  return { busy, pending, error, run };
}
