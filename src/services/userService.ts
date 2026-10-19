import {
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { currentUser, isDemo } from "./authService";
import { db } from "./firebase/config";
export async function initializeUser() {
  const user = currentUser();
  if (isDemo()) return;
  if (!db) throw new Error("Firebase is not configured.");
  const firestore = db;
  const ref = doc(firestore, "users", user.uid);
  await runTransaction(firestore, async (transaction) => {
    const profile = await transaction.get(ref);
    if (profile.exists() && profile.data().initialized) {
      transaction.update(ref, {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        updatedAt: serverTimestamp(),
      });
      return;
    }
    const now = serverTimestamp();
    transaction.set(
      ref,
      {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        initialized: true,
        createdAt: profile.data()?.createdAt || now,
        updatedAt: now,
      },
      { merge: true },
    );
  });
}
export async function saveUserProfile(displayName: string) {
  if (isDemo()) return;
  const user = currentUser();
  if (!db) throw new Error("Firebase is not configured.");
  await updateDoc(doc(db, "users", user.uid), {
    displayName,
    updatedAt: serverTimestamp(),
  });
}
