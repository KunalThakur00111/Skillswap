import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import UserAvatar from "../components/ui/UserAvatar";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const profileData = await apiRequest("/users/profile", {
        token
      });

      const sessionsData = await apiRequest("/sessions", {
        token
      });

      const transactionsData = await apiRequest("/credits/transactions", {
        token
      });

      const topMentorsData = await apiRequest("/public/mentors/top", { token });

      setUser(profileData.user);
      setSessions(sessionsData.sessions || []);
      setTransactions(transactionsData.transactions || []);
      
      const userId = profileData.user._id || profileData.user.id;
      const filteredMentors = (topMentorsData.mentors || []).filter(m => m._id !== userId);
      setRecommendedMentors(filteredMentors);

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          id: profileData.user._id || profileData.user.id,
          name: profileData.user.name,
          email: profileData.user.email,
          role: profileData.user.role,
          credits: profileData.user.credits,
          isEmailVerified: profileData.user.isEmailVerified
        })
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const currentUserId = user?._id || user?.id;

  const getId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    return value._id || value.id || "";
  };

  const summary = useMemo(() => {
    const pending = sessions.filter((session) => session.status === "pending");
    const accepted = sessions.filter(
      (session) => session.status === "accepted"
    );
    const completed = sessions.filter(
      (session) => session.status === "completed"
    );

    const reviewPending = sessions.filter((session) => {
      return (
        session.status === "completed" &&
        !session.isReviewed &&
        getId(session.learner) === currentUserId
      );
    });

    const earned = transactions
      .filter((transaction) => transaction.type === "credit")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const spent = transactions
      .filter((transaction) => transaction.type === "debit")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      pending: pending.length,
      accepted: accepted.length,
      completed: completed.length,
      reviewPending: reviewPending.length,
      earned,
      spent
    };
  }, [sessions, transactions, currentUserId]);

  const recentSessions = sessions.slice(0, 4);
  const recentTransactions = transactions.slice(0, 4);

  const getOtherPerson = (session) => {
    const learnerId = getId(session.learner);

    if (learnerId === currentUserId) {
      return {
        label: "Mentor",
        person: session.mentor
      };
    }

    return {
      label: "Learner",
      person: session.learner
    };
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

  if (loading) {
    return (
      <main>
        <p className="text-slate-400">Loading dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <EmptyState
          title="Login required"
          description="Please login again to access your dashboard."
          action={
            <Link
              to="/login"
              className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
            >
              Login
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${user.name}`}
        description="Track your learning progress, session requests, credit activity, and mentor reputation from one place."
        actions={
          <>
            <Link
              to="/explore"
              className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
            >
              Find mentors
            </Link>

            <Link
              to="/profile"
              className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              Update profile
            </Link>
          </>
        }
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard
          label="Credits"
          value={user.credits ?? 0}
          helper="Available balance"
          tone="blue"
        />

        <StatCard
          label="Pending"
          value={summary.pending}
          helper="Waiting for response"
          tone="yellow"
        />

        <StatCard
          label="Accepted"
          value={summary.accepted}
          helper="Ready to complete"
          tone="purple"
        />

        <StatCard
          label="Completed"
          value={summary.completed}
          helper="Finished sessions"
          tone="green"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Recent sessions"
          description="Latest activity from your learning and teaching sessions."
          action={
            <Link
              to="/sessions"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              View all
            </Link>
          }
        >
          {recentSessions.length === 0 ? (
            <EmptyState
              title="No sessions yet"
              description="Explore mentors and request your first learning session."
              action={
                <Link
                  to="/explore"
                  className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
                >
                  Explore mentors
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => {
                const other = getOtherPerson(session);
                const person = other.person;

                return (
                  <article
                    key={session._id}
                    className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4">
                        <UserAvatar
                          name={person?.name}
                          src={person?.avatar}
                          size="md"
                        />

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold">
                              {session.skill} session
                            </h3>

                            <StatusBadge status={session.status} />
                          </div>

                          <p className="mt-2 text-sm text-slate-400">
                            {other.label}: {person?.name || "Unknown"}
                          </p>

                          <p className="mt-3 text-sm text-slate-500">
                            {session.creditCost || 10} credits ·{" "}
                            {formatDate(session.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Action needed" description="Tasks waiting for you.">
            <div className="space-y-4">
              <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
                <p className="text-sm font-semibold text-purple-200">
                  Reviews pending
                </p>
                <p className="mt-3 text-4xl font-black">
                  {summary.reviewPending}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Completed sessions waiting for feedback.
                </p>
              </div>

              <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                <p className="text-sm font-semibold text-yellow-200">
                  Pending requests
                </p>
                <p className="mt-3 text-4xl font-black">{summary.pending}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Requests waiting for mentor response.
                </p>
              </div>

              <Link
                to="/sessions"
                className="block rounded-2xl bg-blue-500 px-5 py-3 text-center font-bold text-white hover:bg-blue-600"
              >
                Manage sessions
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Credit summary" description="Wallet overview.">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
                <div>
                  <p className="text-sm font-semibold text-green-200">Earned</p>
                  <p className="mt-1 text-sm text-slate-400">Teaching</p>
                </div>

                <p className="text-3xl font-black">+{summary.earned}</p>
              </div>

              <div className="flex items-center justify-between rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                <div>
                  <p className="text-sm font-semibold text-red-200">Spent</p>
                  <p className="mt-1 text-sm text-slate-400">Learning</p>
                </div>

                <p className="text-3xl font-black">-{summary.spent}</p>
              </div>

              <Link
                to="/credits"
                className="block rounded-2xl border border-white/10 px-5 py-3 text-center font-bold text-slate-300 hover:bg-white/[0.04]"
              >
                View wallet
              </Link>
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Profile strength"
          description="Complete your profile to become easier to discover."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <UserAvatar name={user.name} src={user.avatar} size="lg" />

              <div>
                <h3 className="text-2xl font-black">{user.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {user.isEmailVerified && (
                    <StatusBadge status="verified">Verified</StatusBadge>
                  )}

                  <StatusBadge status="default">
                    {user.role || "student"}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              className="block rounded-2xl bg-white px-5 py-3 text-center font-bold text-slate-950 hover:bg-slate-200"
            >
              Complete profile
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent credit activity"
          description="Latest wallet transactions from your sessions."
          action={
            <Link
              to="/credits"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
            >
              View all
            </Link>
          }
        >
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No wallet activity"
              description="Completed sessions will create credit transactions here."
            />
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <article
                  key={transaction._id}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <StatusBadge status={transaction.type}>
                        {transaction.type}
                      </StatusBadge>

                      <p className="mt-3 font-semibold text-slate-200">
                        {transaction.description || "Credit transaction"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>

                    <p
                      className={
                        transaction.type === "credit"
                          ? "text-2xl font-black text-green-300"
                          : "text-2xl font-black text-red-300"
                      }
                    >
                      {transaction.type === "credit" ? "+" : "-"}
                      {transaction.amount}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      {/* Recommended Mentors Ribbon */}
      {recommendedMentors.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white">Recommended Mentors</h2>
              <p className="text-sm text-slate-400">Based on platform rating and reputation</p>
            </div>
            <Link to="/explore" className="text-sm font-bold text-blue-400 hover:underline">View all</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedMentors.slice(0, 3).map((mentor) => (
              <div key={mentor._id} className="group relative flex flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-blue-500/40 hover:bg-white/[0.04]">
                <div>
                  <div className="flex items-start justify-between">
                    <UserAvatar name={mentor.name} src={mentor.avatar} size="lg" />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-white">{mentor.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
                    <span className="flex items-center gap-1 text-yellow-400">★ {mentor.rating ? mentor.rating.toFixed(1) : "New"}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-blue-300">{mentor.completedSessions || 0} sessions</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(mentor.teachSkills || []).slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">{skill}</span>
                    ))}
                  </div>
                </div>
                <Link to={`/mentors/${mentor._id}`} className="mt-6 block w-full rounded-xl bg-white/[0.05] px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-blue-500">View Profile</Link>
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}

export default Dashboard;