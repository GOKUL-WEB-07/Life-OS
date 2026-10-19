import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase/config";
import type { SessionUser } from "../types/models";
let demo = sessionStorage.getItem("project-os-demo") === "true";
const listeners = new Set<(user: SessionUser | null) => void>();
const storedName = localStorage.getItem("project-os-demo-name");
const demoUser: SessionUser = {
  uid: "local-demo",
  displayName:
    storedName && storedName !== "Alex Morgan" ? storedName : "Your workspace",
  email: "",
  photoURL: null,
};
export const isDemo = () => demo;
export function currentUser(): SessionUser {
  const user = demo ? demoUser : auth?.currentUser;
  if (!user) throw new Error("Sign in to continue.");
  return user;
}
export function watchAuth(callback: (user: SessionUser | null) => void) {
  listeners.add(callback);
  if (demo) callback(demoUser);
  const stop = auth
    ? onAuthStateChanged(auth, (user) => {
        if (!demo) callback(user);
      })
    : (callback(demo ? demoUser : null), () => {});
  return () => {
    listeners.delete(callback);
    stop();
  };
}
export function startDemo() {
  demo = true;
  sessionStorage.setItem("project-os-demo", "true");
  listeners.forEach((fn) => fn(demoUser));
}
export async function login(
  email: string,
  password: string,
  register: boolean,
  name: string,
) {
  if (!auth)
    throw new Error(
      "Add your Firebase configuration to .env.local to enable sign-in.",
    );
  if (register) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, {
      displayName: name.trim() || email.split("@")[0],
    });
    listeners.forEach((fn) => fn(result.user));
    return result.user;
  }
  return (await signInWithEmailAndPassword(auth, email, password)).user;
}
export async function googleLogin() {
  if (!auth) throw new Error("Firebase is not configured yet.");
  return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
}
export async function logout() {
  if (auth?.currentUser) await signOut(auth);
  demo = false;
  sessionStorage.removeItem("project-os-demo");
  listeners.forEach((fn) => fn(null));
}
export async function renameProfile(displayName: string) {
  if (demo) {
    demoUser.displayName = displayName;
    localStorage.setItem("project-os-demo-name", displayName);
    listeners.forEach((fn) => fn({ ...demoUser }));
    return;
  }
  if (!auth?.currentUser) throw new Error("Sign in to continue.");
  await updateProfile(auth.currentUser, { displayName });
  listeners.forEach((fn) => fn({ ...currentUser(), displayName }));
}

let workspaceStart: Promise<void> | null = null;
export function startWorkspace(): Promise<void> {
  if (!auth) {
    startDemo();
    return Promise.resolve();
  }
  demo = false;
  sessionStorage.removeItem("project-os-demo");
  if (!workspaceStart)
    workspaceStart = auth
      .authStateReady()
      .then(async () => {
        if (!auth!.currentUser) await signInAnonymously(auth!);
      })
      .catch((error) => {
        workspaceStart = null;
        throw error;
      });
  return workspaceStart;
}
