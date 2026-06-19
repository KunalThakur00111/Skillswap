import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.toLowerCase().trim();

      const data = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: {
          email: normalizedEmail
        }
      });

      localStorage.setItem("passwordResetEmail", normalizedEmail);
      setMessage(data.message);

      setTimeout(() => {
        navigate("/reset-password");
      }, 900);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Password help"
      title="Reset your password"
      subtitle="Enter your account email and we’ll send you a reset code."
      sideTitle="Get back to your learning sessions."
      sideText="Use a reset code to create a new password and continue managing your profile, credits, and sessions."
      footerText="Remember your password?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      {error && (
        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-200">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@college.edu"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Sending reset code..." : "Send reset code"}
        </button>
      </form>

      <p className="mt-5 text-xs text-slate-500">
        Already have a reset code?{" "}
        <Link to="/reset-password" className="text-slate-300 hover:text-white">
          Enter code
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;