import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import AuthLayout from "../components/AuthLayout";

function VerifyEmail() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("pendingVerificationEmail") || "",
    code: ""
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCodeChange = (event) => {
    const onlyDigits = event.target.value.replace(/\D/g, "");

    setFormData({
      ...formData,
      code: onlyDigits
    });
  };

  const handleEmailChange = (event) => {
    setFormData({
      ...formData,
      email: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.email || !formData.code) {
      setError("Email and verification code are required");
      return;
    }

    if (formData.code.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/verify-email", {
        method: "POST",
        body: {
          email: formData.email.toLowerCase().trim(),
          code: formData.code
        }
      });

      localStorage.removeItem("pendingVerificationEmail");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage(data.message);

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setMessage("");
    setError("");

    if (!formData.email) {
      setError("Email is required to resend code");
      return;
    }

    try {
      setResending(true);

      const data = await apiRequest("/auth/resend-verification-code", {
        method: "POST",
        body: {
          email: formData.email.toLowerCase().trim()
        }
      });

      setMessage(data.message);
    } catch (error) {
      setError(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      badge="Verify email"
      title="Enter your verification code"
      subtitle="We sent a 6-digit code to your email. Verify your account to start using SkillSwap."
      sideTitle="One quick step before you begin."
      sideText="Email verification keeps the campus network safer and makes sure every account belongs to a real student."
      footerText="Already verified?"
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
            value={formData.email}
            onChange={handleEmailChange}
            placeholder="you@college.edu"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Verification code
          </label>

          <input
            type="text"
            value={formData.code}
            onChange={handleCodeChange}
            placeholder="Enter 6-digit code"
            maxLength="6"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 tracking-[0.4em] outline-none placeholder:tracking-normal placeholder:text-slate-600 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify and continue"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResendCode}
        disabled={resending}
        className="mt-4 w-full rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-300 hover:bg-white/[0.04] disabled:opacity-60"
      >
        {resending ? "Sending new code..." : "Resend code"}
      </button>

      <p className="mt-5 text-xs text-slate-500">
        Used wrong email?{" "}
        <Link to="/signup" className="text-slate-300 hover:text-white">
          Create account again
        </Link>
      </p>
    </AuthLayout>
  );
}

export default VerifyEmail;