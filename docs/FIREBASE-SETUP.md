# Connect Project OS to Firebase

The app keeps its no-login interface. When Firebase web configuration is present it uses Firebase Anonymous Authentication automatically, then stores work under that UID. Without configuration it uses an empty browser-local workspace. There is no automatic local-to-cloud migration.

1. Open https://console.firebase.google.com/ and create/select your project.
2. Project settings → General → Your apps → Web app. Register it and copy its configuration.
3. Authentication → Get started → Sign-in method → enable **Anonymous**. No Google/email provider is needed for the current interface.
4. Firestore Database → Create database → choose your region and production mode.
5. Copy .env.example to .env.local in the project root. Fill in your web configuration:

```dotenv
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-web-app-id
VITE_USE_FIREBASE_EMULATORS=false
```

These are browser web-app config values. Never paste service-account JSON/private keys here. .env.local is ignored by Git.

6. Install/sign in to Firebase CLI and deploy this repository's ownership rules:

```powershell
npm install -g firebase-tools
firebase login
firebase deploy --project YOUR_PROJECT_ID --only firestore:rules,firestore:indexes
```

Review and run the emulator security tests before production rollout (README contains emulator commands). Do not switch Firestore to public read/write rules.

7. Restart with npm run dev. If your Windows environment blocks Vite dependency scanning, use:

```powershell
npm run build
node scripts/serve-preview.mjs
```

Open http://127.0.0.1:5174. VITE configuration is compiled into the build, so rebuild after environment changes. Stop the previous preview process before launching a new one on the same port.

8. Check the sidebar says **Firebase connected**. Add an Area, a Project, and a Task. Refresh and check they remain. Confirm documents in Firestore have the anonymous user's UID. A separate browser/private window should get a different identity and an empty workspace. Existing Firebase documents are not deleted by the sample-data cleanup.

## Identity and troubleshooting

Anonymous identity persists in the same browser/origin. Clearing site data, using a different browser, or changing origin can lose access to that UID's work. This is not a cross-device account. Durable account recovery would require adding a linked account flow later. Do not enable automatic anonymous-account cleanup if you intend to keep these workspaces indefinitely.

- auth/operation-not-allowed: enable Anonymous in Authentication.
- auth/invalid-api-key: check the web config and rebuild.
- permission-denied: confirm the project ID, deployed rules, authenticated UID, and document ownership.
- App initialization error: correct config/provider settings and use Retry. Firebase errors are surfaced; the app does not silently put failed cloud writes in local storage.

No project credentials were supplied, so live anonymous sign-in, cloud CRUD and rules have not been verified or deployed in this session.

Official references: [Anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth), [Web setup](https://firebase.google.com/docs/web/setup), [Firestore rules](https://firebase.google.com/docs/firestore/security/rules-conditions).

## Area-free project update

Projects now accept an empty areaId. Deploy the updated rules with `firebase deploy --project YOUR_PROJECT_ID --only firestore:rules` before using the new form against Firebase. This session did not deploy or run these rules against a live project. Existing Area records are retained for compatibility.
