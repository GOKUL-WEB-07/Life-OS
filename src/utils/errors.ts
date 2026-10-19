export function errorMessage(error: unknown): string {
  const name = (error as { name?: string })?.name;
  if (name === "QuotaExceededError")
    return "Browser storage is full. Free some storage, then try again. Your entry has not been cleared.";
  if (name === "SecurityError")
    return "Browser storage is unavailable. Allow site storage and try again.";
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Email or password is incorrect. Try again.",
    "auth/email-already-in-use":
      "This email already has an account. Sign in instead.",
    "auth/weak-password": "Use at least 6 characters for your password.",
    "auth/popup-closed-by-user": "Sign-in was closed. Try again when ready.",
    "auth/unauthorized-domain":
      "Add this app domain to Firebase Authentication authorized domains.",
    "auth/network-request-failed":
      "Cannot connect. Check your connection and try again.",
    "permission-denied":
      "Access was denied. Check that Firebase security rules are deployed, then retry.",
    unavailable: "Cannot reach Firebase. Check your connection and retry.",
  };
  return (
    messages[code || ""] ||
    (error instanceof Error
      ? error.message
      : "Something went wrong. Try again.")
  );
}
