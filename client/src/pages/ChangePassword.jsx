import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import SectionCard from "../components/ui/SectionCard";
import StatusBadge from "../components/ui/StatusBadge";

function ChangePassword() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getPasswordStrength = () => {
    const password = formData.newPassword;

    if (!password) {
      return {
        label: "Not started",
        tone: "default",
        width: "w-0"
      };
    }

    if (password.length < 6) {
      return {
        label: "Weak",
        tone: "rejected",
        width: "w-1/3"
      };
    }

    if (password.length < 10) {
      return {
        label: "Good",
        tone: "pending",
        width: "w-2/3"
      };
    }

    return {
      label: "Strong",
      tone: "verified",
      width: "w-full"
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.currentPassword || !formData.newPassword) {
      setError("Current password and new password are required");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/change-password", {
        method: "PATCH",
        token,
        body: {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      });

      setMessage(data.message);

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        navigate("/profile");
      }, 900);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <main>
      <PageHeader
        eyebrow="Security"
        title="Change your password"
        description="Keep your SkillSwap account secure by updating your password regularly."
        actions={
          <Link
            to="/profile"
            className="rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-slate-200"
          >
            Back to profile
          </Link>
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <SectionCard
          title="Update password"
          description="Enter your current password and choose a new one."
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Current password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                New password
              </label>

              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
              />

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Password strength</p>
                  <StatusBadge status={strength.tone}>{strength.label}</StatusBadge>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full bg-blue-500 transition-all ${strength.width}`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Confirm new password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-blue-500 px-6 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
              >
                {loading ? "Changing password..." : "Change password"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="rounded-2xl border border-white/10 px-6 py-4 font-bold text-slate-300 hover:bg-white/[0.04]"
              >
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Security tips"
          description="Simple rules to keep your account protected."
        >
          <div className="space-y-4">
            <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="font-semibold text-blue-200">
                Use a unique password
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Avoid reusing the same password from other websites or college
                accounts.
              </p>
            </div>

            <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
              <p className="font-semibold text-green-200">
                Keep it hard to guess
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Longer passwords with mixed characters are safer than short
                obvious ones.
              </p>
            </div>

            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-5">
              <p className="font-semibold text-purple-200">
                Forgot password?
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use email reset from the login page if you ever lose access.
              </p>

              <Link
                to="/forgot-password"
                className="mt-4 inline-block rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.04]"
              >
                Reset password
              </Link>
            </div>
          </div>
        </SectionCard>
      </section>
    </main>
  );
}

export default ChangePassword;