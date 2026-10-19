import { NavLink } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { navigation } from "./navigation";
export function MobileNavigation({
  isOpen,
  onMore,
}: {
  isOpen: boolean;
  onMore: () => void;
}) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navigation
        .filter((n) => ["/home", "/tasks", "/calendar"].includes(n.to))
        .map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      <button onClick={onMore} aria-expanded={isOpen}>
        <MoreHorizontal size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}
