import { resetDemo } from "../../services/demoService";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Monitor, Sun, Moon } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useToast } from "../../components/feedback/Feedback";
import { PageHeader, Field } from "../../components/ui/Fields";
import { renameProfile, isDemo } from "../../services/authService";
import { saveUserProfile } from "../../services/userService";
import { errorMessage } from "../../utils/errors";
export function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.displayName || "");
  const [busy, setBusy] = useState(false);
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
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await saveUserProfile(name.trim());
      await renameProfile(name.trim());
      toast("Profile updated.");
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  function appearance(value: string) {
    setTheme(value);
    localStorage.setItem("project-os-theme", value);
    document.documentElement.dataset.theme = value;
  }
  return (
    <>
      <PageHeader
        title="Settings"
        description="Make this space feel like yours."
      />
      <div className="settings-column">
        <section className="panel settings-panel">
          <h2>Profile</h2>
          <form onSubmit={save}>
            <Field label="Display name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </Field>
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </button>
          </form>
        </section>
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
