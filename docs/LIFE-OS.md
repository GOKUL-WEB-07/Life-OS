# Life OS

The workspace is now organized as Home, Work, Life, Capture, and System. Existing local storage keys remain unchanged to preserve data. Older workspaces receive empty collections for new modules without resetting existing records.

Projects use a table. Creating a project opens its page with a blank description and an inline to-do list. Optional project metadata lives behind More details. Dialogs close with their close button or Escape; backdrop clicks do not dismiss drafts. Editor context is isolated from the editor component to avoid circular module refresh problems. Submission reads current named form values to preserve native date input changes.

Subscriptions support monthly, quarterly, yearly, weekly and one-off commitments. Monthly/yearly equivalents are grouped by currency without currency conversion. Mark paid advances the due date one cycle, clamping month-end dates. It records tracking status only; no financial transaction takes place.

Documents store metadata, a short reference, original location, optional expiry, and reminder lead time. Photos and PDFs can now be attached to documents and bills (JPG/PNG/WebP/PDF, 10 MB each, up to 10 per record). File blobs are stored in an owner-namespaced IndexedDB store on the current device; metadata stays with the record. Preview, download, removal and cancelled-draft cleanup are included. Files are not cloud-synced or encrypted. Local workspace records use browser storage; Firebase workspace records use owner-restricted collections. Do not store secrets or full identity numbers in the local metadata wallet.

Home is derived from module records. Calendar includes tasks, project dates, renewals, document expiry, bills, events, and personal reminders. Shared attention logic uses each record's lead time and includes overdue items. Reminders are in-app only and require opening the application; no email, push, OS alarms, or background delivery.

Ideas and notes support descriptions, stages, filtering, editing and archiving. Inbox converts atomically to tasks, projects, notes, ideas or reminders. Global search includes all modules. Finance tracks bills and paid status. Review shows blocked work and unprocessed capture; Archive provides completed projects/tasks and archived notes/ideas.

## Verification

- npm.cmd run build
- npm.cmd test (43 tests)
- Browser checks: navigation, project creation/open/inline to-do, document dates and attention, subscription totals, dialog entry, and console errors.

Firebase deployments must deploy the updated firestore.rules before using the new collections. Cloud rules were prepared but not deployed or emulator-tested in this session.

## Cinematic interface update

Pure-black dark mode, light mode, a persistent theme toggle, fixed/collapsible grouped sidebar, sticky topbar, image-led feature cards and a customizable profile are included. Profile photos use the same device storage. Profile biography, role, location and cover style are saved per workspace on this device. Scroll reveals, card hover, press feedback and dialog entry animations respect reduced motion. Original feature illustrations and prompts are listed in ARTWORK.md.

The browser integration check at output/playwright/attachment-qa.html verified blob byte integrity after a full page reload and cleanup. Automated native file-picker testing was blocked by the extension's file-URL permission; that permission was not changed.
