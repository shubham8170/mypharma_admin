import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  IconAnalytics,
  IconCustomers,
  IconDashboard,
  IconInventory,
  IconOrders,
  IconSettings,
  IconSuppliers,
} from "../components/SidebarIcons";

const navItems: {
  to: string;
  label: string;
  end?: boolean;
  Icon: typeof IconDashboard;
}[] = [
  { to: "/", label: "Dashboard", end: true, Icon: IconDashboard },
  { to: "/inventory", label: "Inventory", Icon: IconInventory },
  { to: "/orders", label: "Orders", Icon: IconOrders },
  { to: "/suppliers", label: "Suppliers", Icon: IconSuppliers },
  { to: "/customers", label: "Customers", Icon: IconCustomers },
  { to: "/analytics", label: "Analytics", Icon: IconAnalytics },
  { to: "/settings", label: "Settings", Icon: IconSettings },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {open ? (
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback(() => setNavOpen(false), []);
  const toggleNav = useCallback(() => setNavOpen((v) => !v), []);

  useEffect(() => {
    closeNav();
  }, [pathname, closeNav]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNav();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [navOpen, closeNav]);

  const handleLogout = () => {
    closeNav();
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name ?? "Admin User";
  const displayRole = user?.role?.replace(/_/g, " ") ?? "Pharmacy operations";

  return (
    <div className={`shell${navOpen ? " shell--nav-open" : ""}`}>
      <div
        className={`nav-backdrop${navOpen ? " nav-backdrop--visible" : ""}`}
        onClick={closeNav}
        role="presentation"
        aria-hidden={!navOpen}
      />

      <aside
        id="app-sidebar"
        className={`sidebar${navOpen ? " sidebar--open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-header-row">
          <Link to="/" className="brand-link brand-link--sidebar" onClick={closeNav}>
            <div className="brand-row">
              <div className="brand-mark">MP</div>
              <div className="brand-text">
                <div className="brand">MyPharma</div>
                <div className="brand-tagline">Admin console</div>
              </div>
            </div>
          </Link>
          <button type="button" className="sidebar-close" onClick={closeNav} aria-label="Close menu">
            <MenuIcon open />
          </button>
        </div>
        <div className="sidebar-divider" role="presentation" />
        <span className="sidebar-section-label">Menu</span>
        <ul className="sidebar-nav">
          {navItems.map(({ to, label, end, Icon }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => (isActive ? "active" : undefined)} onClick={closeNav}>
                <Icon className="nav-icon" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{userInitials(displayName)}</div>
            <div className="sidebar-user-meta">
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-role">{displayRole}</span>
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="mobile-topbar">
          <button
            type="button"
            className="menu-toggle"
            onClick={toggleNav}
            aria-expanded={navOpen}
            aria-controls="app-sidebar"
            id="menu-toggle"
            aria-label={navOpen ? "Close menu" : "Open menu"}
          >
            <MenuIcon open={navOpen} />
          </button>
          <Link to="/" className="mobile-topbar-brand" onClick={closeNav}>
            MyPharma Admin
          </Link>
        </header>

        <main className="main" id="main-content">
          <div className="main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
