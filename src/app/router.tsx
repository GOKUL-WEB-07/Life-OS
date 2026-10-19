import { Profile } from "../features/profile/Profile";
import { LifeModule } from "../features/life/LifeModule";
import { Review } from "../features/life/Review";
import { Home } from "../features/home/Home";
import {
  Navigate,
  Outlet,
  createBrowserRouter,
  createHashRouter,
  Link,
} from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";
import { DataProvider } from "./providers/DataProvider";
import { QuickAddProvider } from "../components/QuickAdd";
import { AppShell } from "../components/layout/AppShell";
import { Inbox } from "../features/inbox/Inbox";
import { Projects } from "../features/projects/Projects";
import { ProjectDetail } from "../features/projects/ProjectDetail";
import { Tasks } from "../features/tasks/Tasks";
import { TaskDetail } from "../features/tasks/TaskDetail";
import { MyDay } from "../features/my-day/MyDay";
import { Calendar } from "../features/calendar/Calendar";
import { Reminders } from "../features/reminders/Reminders";
import { Search } from "../features/search/Search";
import { Areas } from "../features/areas/Areas";

import {
  Skeleton,
  ErrorState,
  EmptyState,
} from "../components/feedback/Feedback";
import { useEffect } from "react";
import { useEditor } from "../components/QuickAdd";
function Protected() {
  const { user, loading, error, retry } = useAuth();
  if (loading)
    return (
      <div className="auth-loading">
        <Skeleton />
      </div>
    );
  if (error)
    return (
      <div className="auth-loading">
        <ErrorState message={error} retry={retry} />
      </div>
    );
  if (!user) return <Navigate to="/home" replace />;
  return (
    <DataProvider>
      <QuickAddProvider>
        <Outlet />
      </QuickAddProvider>
    </DataProvider>
  );
}
function NewProject() {
  const open = useEditor();
  useEffect(() => open({ type: "projects" }), [open]);
  return <Projects />;
}
const createRouter =
  import.meta.env.VITE_GITHUB_PAGES === "true"
    ? createHashRouter
    : createBrowserRouter;
export const router = createRouter([
  { path: "/login", element: <Navigate to="/home" replace /> },
  {
    element: <Protected />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/home" replace /> },
          { path: "/home", element: <Home /> },
          { path: "/inbox", element: <Inbox /> },
          { path: "/day", element: <Navigate to="/home" replace /> },
          { path: "/projects", element: <Projects /> },
          { path: "/projects/new", element: <NewProject /> },
          { path: "/projects/:projectId", element: <ProjectDetail /> },
          { path: "/areas/:areaId", element: <Projects /> },
          { path: "/tasks", element: <Tasks /> },
          { path: "/tasks/:taskId", element: <TaskDetail /> },
          { path: "/calendar", element: <Calendar /> },
          { path: "/reminders", element: <Reminders /> },
          { path: "/search", element: <Search /> },
          {
            path: "/subscriptions",
            element: <LifeModule type="subscriptions" />,
          },
          { path: "/documents", element: <LifeModule type="documents" /> },
          { path: "/finance", element: <LifeModule type="bills" /> },
          { path: "/notes", element: <LifeModule type="notes" /> },
          { path: "/ideas", element: <LifeModule type="ideas" /> },
          { path: "/review", element: <Review /> },
          { path: "/archive", element: <Review archive /> },
          { path: "/settings", element: <Navigate to="/profile" replace /> },
          { path: "/profile", element: <Profile /> },
          { path: "/areas", element: <Navigate to="/projects" replace /> },
          { path: "/settings/areas", element: <Areas /> },
          {
            path: "*",
            element: (
              <EmptyState
                title="Page not found."
                action={<Link to="/home">Back to Home</Link>}
              />
            ),
          },
        ],
      },
    ],
  },
]);
