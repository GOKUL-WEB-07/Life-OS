import { resetDemo } from "../../services/demoService";
import { useEffect, useState } from "react";

import { Monitor, Sun, Moon } from "lucide-react";

import { useToast } from "../../components/feedback/Feedback";

import { isDemo } from "../../services/authService";

export function ProfileSettings() {
  const toast = useToast();

  const [resetConfirm, setResetConfirm] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("project-os-theme") || "dark",
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.dataset.theme || "dark"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  function appearance(value: string) {
    setTheme(value);
    localStorage.setItem("project-os-theme", value);
    document.documentElement.dataset.theme = value;
  }
  return (
    <>
      <div className="settings-column profile-settings">
        <section className="panel settings-panel">
          <h2>Appearance</h2>
          <p>Choose a comfortable view for your workspace.</p>
          <div className="appearance-options">
            {[
              { id: "light", Icon: Sun },
              { id: "dark", Icon: Moon },
              { id: "system", Icon: Monitor },
            ].map(({ id, Icon }) => (
              <button
                key={id}
                aria-pressed={theme === id}
                className={theme === id ? "selected" : ""}
                onClick={() => appearance(id)}
              >
                <Icon size={23} />
                {id[0].toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </section>
        <section className="panel settings-panel">
          <h2>Workspace storage</h2>
          {isDemo() && (
            <div className="demo-reset">
              {resetConfirm ? (
                <>
                  <p>
                    Clear all work saved in this browser? This cannot be undone.
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      resetDemo();
                      setResetConfirm(false);
                      toast("Workspace cleared.");
                    }}
                  >
                    Confirm reset
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setResetConfirm(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="text-button"
                  onClick={() => setResetConfirm(true)}
                >
                  Clear local workspace
                </button>
              )}
            </div>
          )}
          <p>
            {isDemo()
              ? "Your work is saved in this browser."
              : "Connected to Firebase. Your work is saved to your anonymous identity."}
          </p>
        </section>
      </div>
    </>
  );
}
