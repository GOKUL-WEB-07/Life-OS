import { useAuth } from "../app/providers/AuthProvider";
import { useProfilePreferences } from "../services/profilePreferences";
import { useAttachmentUrl } from "./Attachments";
export function ProfileAvatar() {
  const { user } = useAuth();
  const profile = useProfilePreferences();
  const { url } = useAttachmentUrl(profile.avatar);
  return (
    <span className="avatar">
      {url ? (
        <img src={url} alt="" />
      ) : user?.displayName === "Your workspace" ? (
        "G"
      ) : (
        (user?.displayName || "You").slice(0, 1).toUpperCase()
      )}
    </span>
  );
}
