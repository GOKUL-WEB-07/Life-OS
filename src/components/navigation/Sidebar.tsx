import { useState, type RefObject } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Orbit,
  X,
  Search,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { navigation } from "./navigation";
import { ProfileAvatar } from "../ProfileAvatar";
export function Sidebar({
  isOpen,
  onClose,
  sidebarRef,
  collapsed,
  onToggle,
}: {
  isOpen: boolean;
  onClose: () => void;
  sidebarRef: RefObject<HTMLElement | null>;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { user } = useAuth();
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <aside ref={sidebarRef} className={"sidebar " + (isOpen ? "is-open" : "")}>
      <div className="sidebar-brand-row">
        <Link className="brand" to="/home" aria-label="Life OS Home">
          <span className="brand-mark">
            <Orbit size={25} />
          </span>
          <span className="brand-name">
            life<span>OS</span>
          </span>
        </Link>
        <button
          className="icon-button collapse-sidebar"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
        >
          {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
        </button>
        <button
          className="icon-button sidebar-close"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      <Link
        className="capture-button"
        to="/search"
        title="Global search"
        aria-label="Global search"
        onClick={onClose}
      >
        <Search size={19} />
        <span className="nav-label">Global search</span>
      </Link>
      <nav aria-label="Main navigation">
        {["", "Work", "Life", "Capture", "System"].map((group) => (
          <section className="nav-section" key={group || "home"}>
            {group && (
              <button
                className="nav-group"
                title={group}
                aria-expanded={!hidden.includes(group)}
                onClick={() =>
                  setHidden(
                    hidden.includes(group)
                      ? hidden.filter((g) => g !== group)
                      : [...hidden, group],
                  )
                }
              >
                <span>{group}</span>
                <ChevronDown size={13} />
              </button>
            )}
            {(!hidden.includes(group) || collapsed) &&
              navigation
                .filter((n) => n.group === group)
                .map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    title={collapsed ? label : undefined}
                    aria-label={label}
                    onClick={onClose}
                  >
                    <Icon size={19} />
                    <span className="nav-label">{label}</span>
                  </NavLink>
                ))}
          </section>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link
          className="profile"
          to="/profile"
          onClick={onClose}
          title="My profile"
        >
          <ProfileAvatar />
          <div className="nav-label">
            <strong>
              {user?.displayName === "Your workspace"
                ? "Gokul"
                : user?.displayName || "My profile"}
            </strong>
            <small>View my profile</small>
          </div>
        </Link>
      </div>
    </aside>
  );
}
