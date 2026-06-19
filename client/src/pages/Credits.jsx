import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

function Credits() {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCreditsData = async () => {
    try {
      setLoading(true);
      setError("");

      const profileData = await apiRequest("/users/profile", {
        token
      });

      const transactionsData = await apiRequest("/credits/transactions", {
        token
      });

      setProfile(profileData.user);
      setTransactions(transactionsData.transactions || []);

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
      loadCreditsData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    const earned = transactions
      .filter((transaction) => transaction.type === "credit")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const spent = transactions
      .filter((transaction) => transaction.type === "debit")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      earned,
      spent,
      total: transactions.length,
      credits: transactions.filter((transaction) => transaction.type === "credit")
        .length,
      debits: transactions.filter((transaction) => transaction.type === "debit")
        .length
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "all") {
      return transactions;
    }

    return transactions.filter(
      (transaction) => transaction.type === activeFilter
    );
  }, [activeFilter, transactions]);

  const filters = [
    {
      label: "All",
      value: "all",
      count: summary.total
    },
    {
      label: "Credits",
      value: "credit",
      count: summary.credits
    },
    {
      label: "Debits",
      value: "debit",
      count: summary.debits
    }
  ];

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <main>
      <PageHeader
        eyebrow="Credits"
        title="Your credit wallet"
        description="Track how many credits you have, how many you earned by teaching, and how many you spent while learning from peers."
        actions={
          <Link
            to="/explore"
            className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
          >
            Spend credits
          </Link>
        }
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-4">
        <StatCard
          label="Balance"
          value={profile?.credits ?? 0}
          helper="Available credits"
          tone="blue"
        />

        <StatCard
          label="Earned"
          value={`+${summary.earned}`}
          helper="By teaching sessions"
          tone="green"
        />

        <StatCard
          label="Spent"
          value={`-${summary.spent}`}
          helper="On learning sessions"
          tone="red"
        />

        <StatCard
          label="Transactions"
          value={summary.total}
          helper="Wallet activity"
          tone="purple"
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <SectionCard
          title="How credits work"
          description="Credits make SkillSwap fair. Teach to earn. Learn by spending."
        >
          <div className="space-y-4">
            <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="text-sm font-semibold text-green-200">
                Mentor completes a session
              </p>
              <p className="mt-2 text-3xl font-black">+10</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Credits are added to the mentor after a session is completed.
              </p>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
              <p className="text-sm font-semibold text-red-200">
                Learner books a session
              </p>
              <p className="mt-2 text-3xl font-black">-10</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Credits are deducted from the learner when the session is
                completed.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-sm font-semibold text-blue-200">
                Balance updates automatically
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Every completed session creates a wallet transaction, so your
                history stays clear and traceable.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Transaction history"
          description="View credit and debit activity generated by your sessions."
          action={
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={
                    activeFilter === filter.value
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
            <p className="text-slate-400">Loading credit history...</p>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Complete a session to see credit activity here."
              action={
                <Link
                  to="/explore"
                  className="rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white hover:bg-blue-600"
                >
                  Find mentors
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <article
                  key={transaction._id}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={transaction.type}>
                          {transaction.type === "credit" ? "Credit" : "Debit"}
                        </StatusBadge>

                        <span className="text-sm text-slate-500">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>

                      <p className="mt-4 font-semibold text-slate-100">
                        {transaction.description || "Credit transaction"}
                      </p>

                      {transaction.session && (
                        <p className="mt-2 text-sm text-slate-400">
                          Session: {transaction.session.skill || "Session"} ·{" "}
                          {transaction.session.status || "updated"}
                        </p>
                      )}
                    </div>

                    <div className="md:text-right">
                      <p
                        className={
                          transaction.type === "credit"
                            ? "text-3xl font-black text-green-300"
                            : "text-3xl font-black text-red-300"
                        }
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                        {transaction.amount}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Balance after: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </section>
    </main>
  );
}

export default Credits;