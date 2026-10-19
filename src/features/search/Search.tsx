import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader } from "../../components/ui/Fields";
import { EmptyState } from "../../components/feedback/Feedback";
import { search } from "../../services/searchService";
import type { CollectionName } from "../../types/models";
const labels: Partial<Record<CollectionName, string>> = {
  subscriptions: "Subscriptions",
  documents: "Documents",
  notes: "Notes",
  ideas: "Ideas",
  bills: "Bills",
  projects: "Projects",
  tasks: "Tasks",
  inboxItems: "Inbox",
  reminders: "Reminders",
  calendarEvents: "Events",
};
export function Search() {
  const { data } = useData();
  const open = useEditor();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const results = search(data, debounced);
  return (
    <>
      <PageHeader
        title="Search"
        description="Find a project, a task, or that idea you captured."
      />
      <label className="search-field">
        <SearchIcon size={21} />
        <span className="sr-only">Search your work</span>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your work…"
        />
      </label>
      {!debounced.trim() ? (
        <EmptyState
          title="What are you looking for?"
          detail="Search names, titles, and descriptions."
        />
      ) : !results.length ? (
        <EmptyState
          title="No matches found."
          detail="Try a different word or phrase."
        />
      ) : (
        Object.entries(labels).map(([type, label]) => {
          const group = results.filter((r) => r.type === type);
          return group.length ? (
            <section className="search-group" key={type}>
              <h2>
                {label}
                <span className="count-label">{group.length}</span>
              </h2>
              <div className="panel">
                {group.map((r) => (
                  <button
                    key={r.id}
                    className="search-result"
                    onClick={() =>
                      r.type === "projects"
                        ? navigate("/projects/" + r.id)
                        : open({ type: r.type, id: r.id })
                    }
                  >
                    <span>{r.title}</span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
            </section>
          ) : null;
        })
      )}
    </>
  );
}
