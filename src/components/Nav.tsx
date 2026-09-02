import { NavLink } from "react-router-dom";

/** Add a route here and in `src/routes.tsx` to add a page to the shell. */
const links = [
  { to: "/", label: "Home", end: true },
  { to: "/diff", label: "Diff Viewer", end: false },
  { to: "/about", label: "About", end: false },
];

export default function Nav() {
  return (
    <nav className="app-nav" aria-label="Main">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? "app-nav__link is-active" : "app-nav__link"
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
