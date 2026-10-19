import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { startWorkspace, watchAuth } from "../../services/authService";
import { initializeUser } from "../../services/userService";
import type { SessionUser } from "../../types/models";
import { errorMessage } from "../../utils/errors";
type AuthState = {
  user: SessionUser | null;
  loading: boolean;
  error: string;
  retry: () => void;
};
const Context = createContext<AuthState>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    void startWorkspace().catch((err) => {
      setError(errorMessage(err));
      setLoading(false);
    });
    let generation = 0;
    const stop = watchAuth(async (next) => {
      if (!next) return;
      const version = ++generation;
      setLoading(true);
      setError("");
      setUser(null);
      try {
        if (next) await initializeUser();
        if (version === generation) setUser(next);
      } catch (err) {
        if (version === generation) setError(errorMessage(err));
      } finally {
        if (version === generation) setLoading(false);
      }
    });
    return () => {
      generation++;
      stop();
    };
  }, [revision]);
  return (
    <Context.Provider
      value={{ user, loading, error, retry: () => setRevision((r) => r + 1) }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuth = () => useContext(Context);
