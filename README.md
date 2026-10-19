# Life OS

A personal workspace for projects, tasks, life admin, documents, and ideas.

## Features

- Home overview derived from tasks, projects, renewals, bills, and document expiry dates.
- Projects table with simple project pages, writing space, and inline to-do lists.
- Today, all-open, and completed task views, plus subtasks.
- Unified calendar and shared in-app reminders.
- Subscription tracking with monthly/yearly equivalents grouped by currency.
- Document wallet and bill tracking with photo/PDF attachments, preview, and download.
- Inbox capture, notes, brainstorming ideas, global search, review, and archive.
- Customizable profile, light and pure-black dark modes, fixed collapsible sidebar, and reduced-motion support.
- Original feature-specific artwork for projects, documents, and brainstorming.

## Run locally

Requires Node.js 22.12+ or Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173).
On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.

```sh
npm test
npm run build
npm run preview
```

## Storage

Without Firebase configuration, records are saved in this browser. Existing local workspaces are migrated without resetting user-created data.

Document and bill attachments, profile photos, and profile customization are stored on the current device. Attachments support JPG, PNG, WebP and PDF, up to 10 MB per file and 10 files per record. They are not encrypted or cloud-synced. Keep independent backups of important originals. Reminders appear while using the app; background push, email, and OS notifications are not implemented.

## Optional Firebase setup

Copy `.env.example` to `.env.local` and fill in the public Firebase web-app configuration. Never commit service-account keys or private credentials. Deploy the included Firestore security rules before using cloud collections. Cloud authentication uses an anonymous identity; browser-local files remain on the originating device.

See [Firebase setup](docs/FIREBASE-SETUP.md) and [current implementation notes](docs/LIFE-OS.md).

## Validation

43 automated tests cover the existing workflows, renewal/expiry integration, date calculations, search, migration, validation, and attachment type/size limits. The production build is checked with TypeScript and Vite. Browser integration checks also verified attachment persistence and byte integrity after reload.

## Artwork

Generated feature artwork is included in `public/art`. See [artwork descriptions and prompts](docs/ARTWORK.md).

## GitHub Pages

Live app: https://gokul-web-07.github.io/Life-OS/

GitHub Actions builds and publishes `dist` on every push to `main`. The Pages build uses `/Life-OS/` as the asset base and hash navigation so refreshed links work on static hosting. Run `npm run build:pages` to reproduce this build locally. GitHub Pages must use **GitHub Actions** as its deployment source; do not serve the source repository root.
