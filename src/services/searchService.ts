import type { AppData, CollectionName } from "../types/models";
export type SearchResult = { type: CollectionName; id: string; title: string };
export function search(data: AppData, term: string): SearchResult[] {
  const needle = term.trim().toLocaleLowerCase();
  if (!needle) return [];
  return (
    [
      "projects",
      "tasks",
      "inboxItems",
      "reminders",
      "calendarEvents",
      "subscriptions",
      "documents",
      "notes",
      "ideas",
      "bills",
    ] as const
  ).flatMap((type) =>
    data[type]
      .filter((item) => {
        const value =
          "name" in item ? item.name : "text" in item ? item.text : item.title;
        return (value + " " + ("description" in item ? item.description : ""))
          .toLocaleLowerCase()
          .includes(needle);
      })
      .map((item) => ({
        type,
        id: item.id,
        title:
          "name" in item ? item.name : "text" in item ? item.text : item.title,
      })),
  );
}
