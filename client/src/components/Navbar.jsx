import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 px-5 py-4 text-white backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-lg font-black shadow-lg shadow-blue-500/20">
              S
            </div>

            <div>
              <p className="text-lg font-black leading-none">SkillSwap</p>
              <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                Campus learning network
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-sm font-bold text-white"
                  : "text-sm font-semibold text-slate-400 hover:text-white"
              }
            >
              Home
            </NavLink>

            {token && user && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-sm font-bold text-white"
                      : "text-sm font-semibold text-slate-400 hover:text-white"
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/community"
                  className={({ isActive }) =>
                    isActive
                      ? "text-sm font-bold text-white"
                      : "text-sm font-semibold text-slate-400 hover:text-white"
                  }
                >
                  Community
                </NavLink>

                <NavLink
                  to="/explore"
                  className={({ isActive }) =>
                    isActive
                      ? "text-sm font-bold text-white"
                      : "text-sm font-semibold text-slate-400 hover:text-white"
                  }
                >
                  Explore
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {token && user ? (
              <>
                <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-black">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="text-sm font-bold leading-none">
                      {user.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {user.credits ?? 0} credits
                    </p>
                  </div>
                </div>

                <NotificationDropdown />

                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200 hidden sm:inline"
                >
                  Dashboard
                </Link>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="hidden rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-red-500/10 hover:text-red-300 md:inline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.04] hover:text-white"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1020] p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold">Logout?</h2>

            <p className="mt-3 text-slate-400">
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
    </>
  );
}

export default Navbar;