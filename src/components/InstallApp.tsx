import { useState } from "react";
import { Download, Smartphone, Check } from "lucide-react";
import { useInstallApp, installApp } from "../services/installApp";
export function InstallApp() {
  const { available, installed } = useInstallApp();
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="panel settings-panel install-panel" id="install-app">
      <h2>
        <Smartphone size={21} />
        Life OS on your phone
      </h2>
      <p>Add Life OS to your home screen and open it like an app.</p>
      {installed ? (
        <p role="status">
          <Check size={17} />
          You’re using the installed app.
        </p>
      ) : (
        <>
          <button
            className="button"
            disabled={busy}
            onClick={async () => {
              setError("");
              if (!available) {
                setHelp(true);
                return;
              }
              setBusy(true);
              try {
                const outcome = await installApp();
                if (outcome === "unavailable") setHelp(true);
              } catch {
                setError(
                  "The install prompt could not open. Follow the instructions below.",
                );
                setHelp(true);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Download size={17} />
            {busy ? "Opening installer…" : "Install app"}
          </button>
          <button
            className="text-button install-help-button"
            aria-expanded={help}
            onClick={() => setHelp(!help)}
          >
            Installation instructions
          </button>
          {help && (
            <div className="install-instructions">
              <h3>Android</h3>
              <p>
                Open Life OS in Chrome. Tap the browser menu (⋮), then Install
                app or Add to Home screen, and confirm.
              </p>
              <h3>iPhone / iPad</h3>
              <p>
                Open Life OS in Safari. Tap Share, then Add to Home Screen, and
                tap Add. If shown, keep Open as Web App enabled.
              </p>
              <h3>Computer</h3>
              <p>
                Open Life OS in Chrome or Edge and choose Install from the
                address bar or browser menu.
              </p>
              <p className="page-note">
                Installation adds this web app to your device. Your saved data
                stays in the browser or account where it was created; it does
                not automatically transfer between devices.
              </p>
            </div>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </section>
  );
}
