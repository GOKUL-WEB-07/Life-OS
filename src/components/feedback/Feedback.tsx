import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
const Context = createContext<(message: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <Context.Provider value={setMessage}>
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
          <button
            onClick={() => setMessage("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export const useToast = () => useContext(Context);
export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-symbol" aria-hidden="true">
        ◇
      </span>
      <h3>{title}</h3>
      {detail && <p>{detail}</p>}
      {action}
    </div>
  );
}
export function Skeleton() {
  return (
    <div
      className="skeleton-stack"
      role="status"
      aria-label="Loading your work"
    >
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="skeleton" />
      ))}
      <span className="sr-only">Loading your work</span>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="error-panel" role="alert">
      <h3>Couldn’t load your work</h3>
      <p>{message}</p>
      <button className="button" onClick={retry}>
        Retry
      </button>
    </div>
  );
}
