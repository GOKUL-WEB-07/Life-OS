import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { PageHeader, Badge } from "../../components/ui/Fields";
import { EmptyState } from "../../components/feedback/Feedback";
export function Areas() {
  const { data } = useData();
  const open = useEditor();
  const [archived, setArchived] = useState(false);
  const areas = data.areas
    .filter((a) => archived || !a.archived)
    .sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader
        title="Areas"
        description="Simple categories for the different parts of your life."
        action={
          <button
            className="button"
            onClick={() =>
              open({ type: "areas", initial: { order: data.areas.length } })
            }
          >
            <Plus size={18} />
            New area
          </button>
        }
      />
      <label className="check-field">
        <input
          type="checkbox"
          checked={archived}
          onChange={(e) => setArchived(e.target.checked)}
        />
        Show archived areas
      </label>
      {areas.length ? (
        <div className="panel">
          {areas.map((area) => (
            <div className="area-row" key={area.id}>
              <i className="area-dot" style={{ background: area.color }} />
              <div>
                <Link to={"/areas/" + area.id}>{area.name}</Link>
                <small>
                  {
                    data.projects.filter(
                      (p) => p.areaId === area.id && p.status !== "archived",
                    ).length
                  }{" "}
                  projects
                </small>
              </div>
              {area.archived && <Badge>Archived</Badge>}
              <button
                className="icon-button"
                aria-label={"Edit " + area.name}
                onClick={() => open({ type: "areas", id: area.id })}
              >
                <Pencil size={17} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No areas yet."
          detail="Create an area to organize projects."
        />
      )}
      <p className="page-note">
        Archiving an area keeps its projects and tasks. Change its order in the
        edit form to reorder it.
      </p>
    </>
  );
}
