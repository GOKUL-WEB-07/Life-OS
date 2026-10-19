import { ProfileSettings } from "../settings/Settings";
import { useState, type FormEvent } from "react";
import { MapPin, Camera, Check, UserRound } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useData } from "../../app/providers/DataProvider";
import {
  useProfilePreferences,
  saveProfilePreferences,
} from "../../services/profilePreferences";
import { renameProfile } from "../../services/authService";
import { saveUserProfile } from "../../services/userService";
import {
  storeAttachment,
  deleteAttachment,
} from "../../services/attachmentService";
import { useAttachmentUrl } from "../../components/Attachments";
import { Field, PageHeader } from "../../components/ui/Fields";
import { useToast } from "../../components/feedback/Feedback";
export function Profile() {
  const { user } = useAuth();
  const { data } = useData();
  const saved = useProfilePreferences();
  const [draft, setDraft] = useState(saved);
  const [name, setName] = useState(
    user?.displayName === "Your workspace" ? "Gokul" : user?.displayName || "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { url } = useAttachmentUrl(saved.avatar);
  const { url: bannerUrl, error: bannerError } = useAttachmentUrl(saved.banner);
  const toast = useToast();
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await saveUserProfile(name.trim());
      await renameProfile(name.trim());
      saveProfilePreferences(draft);
      toast("Profile updated.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title="My profile"
        description="A little more you. Make this space your own."
      />
      <div className="profile-layout">
        <section className="profile-feature">
          <div
            className={"profile-cover cover-" + saved.cover}
            style={
              bannerUrl ? { backgroundImage: `url("${bannerUrl}")` } : undefined
            }
          >
            <label className="banner-upload">
              <Camera size={16} />
              Change banner
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Profile banner"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setBusy(true);
                  setError("");
                  try {
                    if (!file.type.startsWith("image/"))
                      throw new Error("Choose a banner image.");
                    const banner = await storeAttachment(file);
                    try {
                      saveProfilePreferences({ ...saved, banner });
                      setDraft((previous) => ({ ...previous, banner }));
                    } catch (err) {
                      await deleteAttachment(banner.id);
                      throw err;
                    }
                    if (saved.banner)
                      void deleteAttachment(saved.banner.id).catch(() => {});
                    toast("Banner updated.");
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
          </div>
          <div className="profile-feature-body">
            <div className="profile-portrait">
              {url ? (
                <img src={url} alt="Your profile" />
              ) : (
                <UserRound size={42} />
              )}
            </div>
            <h2>
              {user?.displayName === "Your workspace"
                ? "Gokul"
                : user?.displayName}
            </h2>
            <p>{saved.role}</p>
            {saved.location && (
              <span className="profile-location">
                <MapPin size={15} />
                {saved.location}
              </span>
            )}
            <p className="profile-bio">{saved.bio}</p>
            <div className="profile-counts">
              <div>
                <strong>
                  {data.projects.filter((p) => p.status !== "archived").length}
                </strong>
                <span>Projects</span>
              </div>
              <div>
                <strong>{data.tasks.filter((t) => t.completed).length}</strong>
                <span>Tasks done</span>
              </div>
              <div>
                <strong>{data.ideas.length}</strong>
                <span>Ideas</span>
              </div>
            </div>
          </div>
        </section>
        <form className="panel profile-form" onSubmit={save}>
          <h2>Personalize your profile</h2>
          <label className="avatar-upload">
            <Camera size={19} />
            {busy ? "Saving photo..." : "Change profile photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Profile photo"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setError("");
                try {
                  if (!file.type.startsWith("image/"))
                    throw new Error("Choose a profile image.");
                  const avatar = await storeAttachment(file);
                  const next = { ...draft, avatar };
                  try {
                    saveProfilePreferences({ ...saved, avatar });
                    setDraft(next);
                  } catch (e) {
                    await deleteAttachment(avatar.id);
                    throw e;
                  }
                  if (saved.avatar)
                    void deleteAttachment(saved.avatar.id).catch(() => {});
                  toast("Profile photo updated.");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          <Field label="Display name">
            <input
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Role or tagline">
            <input
              maxLength={120}
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <input
              maxLength={120}
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            />
          </Field>
          <Field label="About you">
            <textarea
              rows={3}
              maxLength={600}
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            />
          </Field>
          {bannerError && (
            <p role="alert" className="form-error">
              {bannerError}
            </p>
          )}
          {saved.banner && (
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => {
                try {
                  const next = { ...saved, banner: undefined };
                  saveProfilePreferences(next);
                  setDraft((previous) => ({ ...previous, banner: undefined }));
                  void deleteAttachment(saved.banner!.id).catch(() => {});
                  toast("Default banner restored.");
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            >
              Restore default banner
            </button>
          )}
          <Field label="Cover style">
            <select
              value={draft.cover}
              onChange={(e) => setDraft({ ...draft, cover: e.target.value })}
            >
              <option value="alpine">Project studio</option>
              <option value="forest">Document collection</option>
              <option value="midnight">Creative spark</option>
            </select>
          </Field>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            <Check size={17} />
            Save profile
          </button>
          <p className="page-note">
            Profile customization and photos are saved on this device.
          </p>
        </form>
      </div>
      <ProfileSettings />
    </>
  );
}
