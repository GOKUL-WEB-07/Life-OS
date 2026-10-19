import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "../components/feedback/Feedback";
import { router } from "./router";
import { Component, type ReactNode } from "react";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="auth-loading">
        <h1>Something went wrong.</h1>
        <p>Reload the app to try again.</p>
        <button className="button" onClick={() => location.reload()}>
          Reload
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
