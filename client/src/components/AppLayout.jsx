import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import UserAvatar from "./ui/UserAvatar";

function NavIcon({ name }) {
  const icons = {
    dashboard: (
      <>
        <path d="M4 4h7v7H4V4Z" />
        <path d="M13 4h7v4h-7V4Z" />
        <path d="M13 10h7v10h-7V10Z" />
        <path d="M4 13h7v7H4v-7Z" />
      </>
    ),
    explore: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    sessions: (
      <>
        <path d="M7 7h10" />
        <path d="M7 12h7" />
        <path d="M7 17h10" />
        <path d="M4 4h16v16H4V4Z" />
      </>
    ),
    credits: (
      <>
        <path d="M4 7h16v10H4V7Z" />
        <path d="M8 11h.01" />
        <path d="M16 13h.01" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    reviews: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z" />
    ),
    community: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
        <path d="M8 10h.01" />
        <path d="M12 10h.01" />
        <path d="M16 10h.01" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    security: (
      <>
        <path d="M12 3 5 6v5c0 4.5 2.8 8.5 7 10 4.2-1.5 7-5.5 7-10V6l-7-3Z" />
        <path d="M9.5 12.5 11 14l3.5-4" />
      </>
    ),
    admin: (
      <>
        <path d="M12 3 4 7v5c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V7l-8-4Z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </>
    ),
    availability: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M12 14v4" />
        <path d="M10 16h4" />
      </>
    ),
    learnerCalendar: (
      <>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 15h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Z" />
      </>
    ),
    mentorCalendar: (
      <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </>
    )
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
}

function SidebarContent({ user, navItems, onMobileClose, onLogoutClick }) {
  return (
    <>
      <div className="shrink-0 px-5 pt-6">
        <Link
          to="/dashboard"
          onClick={onMobileClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-black shadow-lg shadow-blue-500/20">
            S
          </div>

          <div>
            <h1 className="text-lg font-black leading-none">SkillSwap</h1>
            <p className="mt-1 text-xs text-slate-500">
              Campus learning network
            </p>
          </div>
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Logged in as
          </p>

          <div className="mt-3 flex items-center gap-3">
            <UserAvatar name={user?.name} src={user?.avatar} size="sm" />

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto px-5 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              isActive
                ? "group flex items-center gap-3 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
                : "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-current group-hover:bg-white/[0.1]">
              <NavIcon name={item.icon} />
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 px-5 py-5">
        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm font-semibold text-blue-200">
            Credits balance
          </p>

          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-3xl font-black">{user?.credits ?? 0}</p>

            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-200">
              Wallet
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Earn by teaching. Spend to learn.
          </p>
        </div>

        <button
          onClick={onLogoutClick}
          className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-red-500/10 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    </>
  );
}

function AppLayout({ children }) {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token || !user) {
    return null;
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/explore", label: "Explore", icon: "explore" },
    { path: "/learning-calendar", label: "My Learning", icon: "learnerCalendar" },
    { path: "/mentor-calendar", label: "My Mentoring", icon: "mentorCalendar" },
    { path: "/availability", label: "Availability", icon: "availability" },
    { path: "/credits", label: "Credits", icon: "credits" },
    { path: "/reviews", label: "Reviews", icon: "reviews" },
    { path: "/community", label: "Community", icon: "community" },
    { path: "/profile", label: "Profile", icon: "profile" },
    { path: "/change-password", label: "Security", icon: "security" }
  ];

  if (user?.role === "admin") {
    navItems.push({
      path: "/admin",
      label: "Admin",
      icon: "admin"
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#0B1020]/95 backdrop-blur-xl lg:flex lg:flex-col">
        <SidebarContent
          user={user}
          navItems={navItems}
          onMobileClose={() => {}}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 lg:hidden">
          <div className="flex h-full w-80 max-w-[86vw] flex-col border-r border-white/10 bg-[#0B1020] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-4">
              <p className="font-bold">Menu</p>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
              >
                Close
              </button>
            </div>

            <SidebarContent
              user={user}
              navItems={navItems}
              onMobileClose={() => setMobileOpen(false)}
              onLogoutClick={() => setShowLogoutModal(true)}
            />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070B14]/80 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04] lg:hidden"
            >
              Menu
            </button>

            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-400">
                Learn from peers. Teach what you know. Grow with credits.
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Link
                to="/explore"
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-slate-200"
              >
                Find mentors
              </Link>

              <Link
                to="/profile"
                className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04] sm:inline"
              >
                Profile
              </Link>
            </div>
          </div>
        </header>

        <div className="page-shell px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1020] p-6 shadow-2xl">
            <h2 className="text-2xl font-black">Logout?</h2>

            <p className="mt-3 leading-7 text-slate-400">
              Are you sure you want to logout from SkillSwap Campus?
            </p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl border border-white/10 px-5 py-3 font-bold text-slate-300 hover:bg-white/[0.04]"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-500 px-5 py-3 font-bold text-white hover:bg-red-600"
              >
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
