# Task subtasks

Open a task (or create one), expand **Subtasks**, type a step, and select **Add step** or press Enter. Edit step titles inline, use the arrows to reorder, and check steps off. Select **Save changes** or **Create task** to persist the checklist. Removing a draft step can be cancelled by closing the dialog before saving. Up to 20 steps are supported per task.

Checklists start collapsed. Task rows show completed/total steps. Parent-task completion remains manual, and completing/reopening the parent preserves its checklist. Checklists share the parent task's daily date and UID ownership; no new collection, extra scheduling, milestones, or new screen is introduced. Existing tasks without a subtasks field are treated as empty checklists.

Build and 35 tests pass. Tests cover legacy values, invalid/duplicate IDs, limits, nonmutating reorder, trimming, persistence, and parent completion independence. Browser draft add/edit/reorder/check controls were inspected without creating persistent sample work. Live Firebase rules remain unexecuted and undeployed in this session.

For configured Firebase projects, deploy the updated firestore.rules after running the existing emulator suite:

```powershell
firebase deploy --project YOUR_PROJECT_ID --only firestore:rules
```

Firestore validates optional lists of up to 20 step maps; reads and writes retain parent-document ownership rules. Lists save atomically with their task. Concurrent edits to the same checklist are last-write-wins, as with other V1 task fields.
