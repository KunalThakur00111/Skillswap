import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import UserAvatar from "../components/ui/UserAvatar";

function Admin() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const statsData = await apiRequest("/admin/stats", {
        token
      });

      const usersData = await apiRequest("/admin/users", {
        token
      });

      const sessionsData = await apiRequest("/admin/sessions", {
        token
      });

      setStats(statsData.stats || {});
      setUsers(usersData.users || []);
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAdminData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const calculatedStats = useMemo(() => {
    return {
      totalUsers: stats?.totalUsers ?? users.length,
      verifiedUsers:
        stats?.verifiedUsers ??
        users.filter((user) => user.isEmailVerified).length,
      blockedUsers:
        stats?.blockedUsers ?? users.filter((user) => user.isBlocked).length,
      totalSessions: stats?.totalSessions ?? sessions.length,
      pendingSessions:
        stats?.pendingSessions ??
        sessions.filter((session) => session.status === "pending").length,
      completedSessions:
        stats?.completedSessions ??
        sessions.filter((session) => session.status === "completed").length,
      totalReviews: stats?.totalReviews ?? 0,
      totalCreditTransactions: stats?.totalCreditTransactions ?? 0
    };
  }, [stats, users, sessions]);

  const filteredSessions = useMemo(() => {
    if (sessionFilter === "all") {
      return sessions;
    }

    return sessions.filter((session) => session.status === sessionFilter);
  }, [sessionFilter, sessions]);

  const sessionFilters = [
    {
      label: "All",
      value: "all",
      count: sessions.length
    },
    {
      label: "Pending",
      value: "pending",
      count: sessions.filter((session) => session.status === "pending").length
    },
    {
      label: "Accepted",
      value: "accepted",
      count: sessions.filter((session) => session.status === "accepted").length
    },
    {
      label: "Completed",
      value: "completed",
      count: sessions.filter((session) => session.status === "completed").length
    },
    {
      label: "Cancelled",
      value: "cancelled",
      count: sessions.filter((session) => session.status === "cancelled").length
    },
    {
      label: "Rejected",
      value: "rejected",
      count: sessions.filter((session) => session.status === "rejected").length
    }
  ];

  const handleSearchUsers = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const endpoint = search.trim()
        ? `/admin/users?search=${encodeURIComponent(search.trim())}`
        : "/admin/users";

      const data = await apiRequest(endpoint, {
        token
      });

      setUsers(data.users || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearch("");

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/admin/users", {
        token
      });

      setUsers(data.users || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserBlockToggle = async (user) => {
    const action = user.isBlocked ? "unblock" : "block";

    try {
      setActionLoading(`${user._id}-${action}`);
      setError("");
      setMessage("");

      const data = await apiRequest(`/admin/users/${user._id}/${action}`, {
        method: "PATCH",
        token
      });

      setMessage(data.message);
      await loadAdminData();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <main>
      <PageHeader
        eyebrow="Admin"
        title="Platform control center"
        description="Monitor users, sessions, reviews, credits, and moderation from one clean admin dashboard."
        actions={
          <button
            onClick={loadAdminData}
            className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
          >
            Refresh data
          </button>
        }
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-200">{message}</p>
        </div>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard
          label="Users"
          value={calculatedStats.totalUsers}
          helper="Registered accounts"
          tone="blue"
        />

        <StatCard
          label="Verified"
          value={calculatedStats.verifiedUsers}
          helper="Email verified users"
          tone="green"
        />

        <StatCard
          label="Blocked"
          value={calculatedStats.blockedUsers}
          helper="Restricted accounts"
          tone="red"
        />

        <StatCard
          label="Sessions"
          value={calculatedStats.totalSessions}
          helper="Total learning sessions"
          tone="purple"
        />
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-4">
        <StatCard
          label="Pending"
          value={calculatedStats.pendingSessions}
          helper="Waiting for response"
          tone="yellow"
        />

        <StatCard
          label="Completed"
          value={calculatedStats.completedSessions}
          helper="Finished sessions"
          tone="green"
        />

        <StatCard
          label="Reviews"
          value={calculatedStats.totalReviews}
          helper="Submitted reviews"
          tone="slate"
        />

        <StatCard
          label="Credit logs"
          value={calculatedStats.totalCreditTransactions}
          helper="Wallet transactions"
          tone="blue"
        />
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => setActiveTab("users")}
          className={
            activeTab === "users"
              ? "rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white"
              : "rounded-2xl border border-white/10 px-5 py-3 font-bold text-slate-300 hover:bg-white/[0.04]"
          }
        >
          Users
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={
            activeTab === "sessions"
              ? "rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white"
              : "rounded-2xl border border-white/10 px-5 py-3 font-bold text-slate-300 hover:bg-white/[0.04]"
          }
        >
          Sessions
        </button>
      </div>

      {activeTab === "users" && (
        <SectionCard
          className="mt-6"
          title="User management"
          description="Search users, check verification status, and block/unblock accounts when needed."
          action={
            <form onSubmit={handleSearchUsers} className="flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                className="w-56 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-blue-500"
              />

              <button
                type="submit"
                className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
              >
                Search
              </button>

              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-slate-300 hover:bg-white/[0.04]"
                >
                  Clear
                </button>
              )}
            </form>
          }
        >
          {loading ? (
            <p className="text-slate-400">Loading users...</p>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Try clearing the search or refreshing admin data."
              action={
                <button
                  onClick={handleClearSearch}
                  className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
                >
                  Load all users
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <article
                  key={user._id}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <UserAvatar
                        name={user.name}
                        src={user.avatar}
                        size="md"
                      />

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{user.name}</h3>

                          <StatusBadge status="default">
                            {user.role}
                          </StatusBadge>

                          {user.isEmailVerified ? (
                            <StatusBadge status="verified">
                              Verified
                            </StatusBadge>
                          ) : (
                            <StatusBadge status="pending">
                              Unverified
                            </StatusBadge>
                          )}

                          {user.isBlocked && (
                            <StatusBadge status="blocked">
                              Blocked
                            </StatusBadge>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {user.email}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>Credits: {user.credits ?? 0}</span>
                          <span>Rating: {user.rating ?? 0}</span>
                          <span>
                            Sessions: {user.completedSessions ?? 0}
                          </span>
                          <span>Joined: {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUserBlockToggle(user)}
                      disabled={
                        actionLoading ===
                        `${user._id}-${user.isBlocked ? "unblock" : "block"}`
                      }
                      className={
                        user.isBlocked
                          ? "rounded-2xl bg-green-500 px-5 py-3 font-bold text-white hover:bg-green-600 disabled:opacity-60"
                          : "rounded-2xl border border-red-500/40 px-5 py-3 font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                      }
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === "sessions" && (
        <SectionCard
          className="mt-6"
          title="Session monitoring"
          description="View all learning sessions happening across the platform."
          action={
            <div className="flex flex-wrap gap-2">
              {sessionFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSessionFilter(filter.value)}
                  className={
                    sessionFilter === filter.value
                      ? "rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                      : "rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
                  }
                >
                  {filter.label} · {filter.count}
                </button>
              ))}
            </div>
          }
        >
          {loading ? (
            <p className="text-slate-400">Loading sessions...</p>
          ) : filteredSessions.length === 0 ? (
            <EmptyState
              title="No sessions found"
              description="No sessions match the selected filter."
            />
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <article
                  key={session._id}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">
                          {session.skill} session
                        </h3>

                        <StatusBadge status={session.status} />

                        {session.isPaid && (
                          <StatusBadge status="credit">Paid</StatusBadge>
                        )}

                        {session.isReviewed && (
                          <StatusBadge status="verified">Reviewed</StatusBadge>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-slate-400">
                        Learner: {session.learner?.name || "Unknown"} · Mentor:{" "}
                        {session.mentor?.name || "Unknown"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>{session.creditCost || 10} credits</span>
                        <span>Created: {formatDate(session.createdAt)}</span>
                        {session.completedAt && (
                          <span>
                            Completed: {formatDate(session.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </main>
  );
}

export default Admin;