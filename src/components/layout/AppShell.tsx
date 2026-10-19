import { Motion } from "../Motion";
import { ThemeToggle } from "../ThemeToggle";
import { ProfileAvatar } from "../ProfileAvatar";
import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import { useData } from "../../app/providers/DataProvider";
import { Skeleton, ErrorState } from "../feedback/Feedback";
import { Sidebar } from "../navigation/Sidebar";
import { MobileNavigation } from "../navigation/MobileNavigation";
export function AppShell() {
  const { loading, error, retry } = useData();
  const [menu, setMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("life-os-sidebar") === "collapsed",
  );
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector(".workspace")?.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (!menu) return;
    const previous = document.activeElement as HTMLElement;
    const aside = sidebarRef.current;
    const focusables = () =>
      Array.from(
        aside?.querySelectorAll<HTMLElement>("a[href],button:not(:disabled)") ||
          [],
      ).filter((el) => el.getClientRects().length);
    aside?.querySelector<HTMLElement>(".sidebar-close")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [menu]);
  return (
    <div className={"app-shell " + (collapsed ? "sidebar-collapsed" : "")}>
      {menu && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <Sidebar
        isOpen={menu}
        onClose={() => setMenu(false)}
        sidebarRef={sidebarRef}
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed((value) => {
            localStorage.setItem(
              "life-os-sidebar",
              value ? "expanded" : "collapsed",
            );
            return !value;
          })
        }
      />
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Menu size={21} />
          </button>
          <Link to="/search" className="workspace-label top-search">
            Search your life...
          </Link>
          <Link to="/reminders" className="top-reminders">
            Reminders
          </Link>
          <ThemeToggle />
          <Link className="top-profile" to="/profile" aria-label="My profile">
            <ProfileAvatar />
            <span>My profile</span>
          </Link>
          <Link
            className="button compact"
            to="/search"
            aria-label="Global search"
          >
            <Search size={17} />
            Global search
          </Link>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {error ? (
            <ErrorState message={error} retry={retry} />
          ) : loading ? (
            <Skeleton />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <Motion />
      <MobileNavigation isOpen={menu} onMore={() => setMenu(true)} />
    </div>
  );
}
