import { Link, useParams } from "react-router-dom";
import { useData } from "../../app/providers/DataProvider";
import { useEditor } from "../../components/QuickAdd";
import { EmptyState } from "../../components/feedback/Feedback";
import { PageHeader } from "../../components/ui/Fields";
import { TaskRow } from "../../components/TaskList";
import { niceDate } from "../../utils/dates";
export function TaskDetail() {
  const { taskId } = useParams();
  const { data } = useData();
  const open = useEditor();
  const task = data.tasks.find((t) => t.id === taskId);
  if (!task)
    return (
      <EmptyState
        title="Task not found."
        action={<Link to="/tasks">Back to tasks</Link>}
      />
    );
  return (
    <>
      <PageHeader
        title={task.title}
        description="Task details"
        action={
          <button
            className="button"
            onClick={() => open({ type: "tasks", id: task.id })}
          >
            Edit task
          </button>
        }
      />
      <div className="panel project-overview">
        <TaskRow task={task} />
        <p>{task.description || "No description added."}</p>
        <p>
          Due: {niceDate(task.dueDate)} · Scheduled:{" "}
          {niceDate(task.scheduledDate)} {task.scheduledStart}
        </p>
        <p>Estimate: {task.estimatedMinutes || 0} minutes</p>
      </div>
    </>
  );
}
