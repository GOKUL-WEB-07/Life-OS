# Project OS V1 QA inventory

Use the local demo for disposable browser checks. Use Firebase emulators for security and authentication checks. Never use a real account's work as test data.

| Feature        | State changes and required checks                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication | Anonymous protected route redirects; demo entry; email registration/login; Google popup; logout; repeated first login does not duplicate Areas. Real provider checks require Firebase configuration.  |
| Areas          | Create, rename, change order, archive; show archived; archived area keeps linked data.                                                                                                                |
| Projects       | Create with required Area, open, edit, change status, filter by status/Area, archive; overview/task tabs; progress follows completion.                                                                |
| Tasks          | Fast create; expand optional details; edit, complete/reopen, delete confirmation/cancel; project relation; priority/status; due and scheduled dates/times; all five filters and additional selectors. |
| Inbox          | Enter/Add capture; text editing; task/project/reminder conversion; source removed only after success; delete confirmation.                                                                            |
| My Day         | Timed tasks, events, reminders; chronological groups; date-only work; completion; edit/reschedule; source project link.                                                                               |
| Calendar       | Month and Agenda/Day, next/previous/today, day selection; indicators for three sources; corresponding detail dialogs; event creation/edit/delete.                                                     |
| Reminders      | Create/edit/complete/reopen/delete; Today, Tomorrow, Upcoming, Overdue, Completed; chronological ordering.                                                                                            |
| Search         | Debounce; grouped project/task/inbox/reminder/event matches; names/descriptions; empty query/no matches; result opens source.                                                                         |
| Settings       | Profile save; Light/Dark/System and persistence; Area management; sign-out.                                                                                                                           |
| Feedback       | Empty pages, loading skeleton, mutation busy states, failure message/retry, missing relation/entity, unknown route.                                                                                   |
| Accessibility  | Named native modal; Escape, focus trap and restoration; off-canvas navigation hidden when closed; navigation keyboard trap; visible focus; 44px touch targets; reduced motion.                        |
| Responsive     | 390, 768, 1024, 1280, 1440 px; every screen; no horizontal overflow; mobile navigation/More; readable calendar, task lists, forms and dialog footer.                                                  |

Exploratory checks: cancel a destructive action; invalid end time; convert a deleted/already-converted source; missing project; long title; revisit after reload; cross midnight; switch appearance while a dialog is open.

Verification results and exclusions are recorded separately in TEST-RESULTS.md. Presence in this inventory is not evidence that a check has passed.
