import type { AppData, Owned } from "../../src/types/models";
import { Timestamp } from "firebase/firestore";
import { localDate, addDays } from "../../src/utils/dates";
export function seed(): AppData {
  const today = localDate();
  const owned = (id: string): Owned => ({
    id,
    userId: "local-demo",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  const areas = ["Office", "Freelance", "Personal", "Learning"].map(
    (name, i) => ({
      ...owned("area-" + i),
      name,
      color: ["#5271bc", "#8963b4", "#3b8a76", "#ad7a31"][i],
      order: i,
      archived: false,
    }),
  );
  const projects = [
    "Website Redesign",
    "Client Branding",
    "Portfolio Refresh",
    "React Practice",
  ].map((name, i) => ({
    ...owned("project-" + i),
    name,
    areaId: areas[i].id,
    description: [
      "A clearer, faster website built around what customers need.",
      "A cohesive visual identity for the next chapter.",
      "Bring recent work and case studies together.",
      "Learn by building small, useful applications.",
    ][i],
    status: "active" as const,
    priority: i === 0 ? ("high" as const) : ("medium" as const),
    startDate: addDays(today, -7),
    deadline: addDays(today, i * 3 + 2),
    progress: 0,
  }));
  const tasks = [
    "Design homepage hero",
    "Review mobile wireframes",
    "Send logo revision",
    "Update portfolio case study",
    "Complete React routing exercise",
    "Review navigation structure",
  ].map((title, i) => ({
    ...owned("task-" + i),
    title,
    description: "",
    projectId: projects[[0, 0, 1, 2, 3, 0][i]].id,
    areaId: areas[[0, 0, 1, 2, 3, 0][i]].id,
    status: i === 5 ? ("done" as const) : ("todo" as const),
    priority: i < 3 ? ("high" as const) : ("medium" as const),
    dueDate: addDays(today, i === 2 ? -1 : i < 2 ? 0 : 2),
    scheduledDate: i < 2 ? today : "",
    scheduledStart: i === 0 ? "09:30" : i === 1 ? "14:00" : "",
    scheduledEnd: i === 0 ? "10:30" : i === 1 ? "15:00" : "",
    estimatedMinutes: 60,
    completed: i === 5,
    completedAt: i === 5 ? Timestamp.now() : null,
  }));
  return {
    subscriptions: [],
    documents: [],
    notes: [],
    ideas: [],
    bills: [],
    areas,
    projects,
    tasks,
    inboxItems: [
      {
        ...owned("inbox-0"),
        text: "Research animation references for the portfolio",
        type: "unprocessed",
      },
    ],
    calendarEvents: [
      {
        ...owned("event-0"),
        title: "Website check-in",
        description: "Review the new direction with the team.",
        date: today,
        startTime: "11:00",
        endTime: "11:30",
        allDay: false,
      },
    ],
    reminders: [
      {
        ...owned("reminder-0"),
        title: "Call client",
        date: today,
        time: "18:00",
        completed: false,
      },
    ],
  };
}
