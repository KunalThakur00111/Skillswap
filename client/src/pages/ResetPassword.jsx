import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import AuthLayout from "../components/AuthLayout";

function ResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: localStorage.getItem("passwordResetEmail") || "",
    code: "",
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

  const handleCodeChange = (event) => {
    const onlyDigits = event.target.value.replace(/\D/g, "");

    setFormData({
      ...formData,
      code: onlyDigits
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.email || !formData.code || !formData.newPassword) {
      setError("Email, reset code, and new password are required");
      return;
    }

    if (formData.code.length !== 6) {
      setError("Reset code must be 6 digits");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: {
          email: formData.email.toLowerCase().trim(),
          code: formData.code,
          newPassword: formData.newPassword
        }
      });

      localStorage.removeItem("passwordResetEmail");
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

  return (
    <AuthLayout
      badge="Create new password"
      title="Enter reset code"
      subtitle="Use the code sent to your email and choose a new password for your account."
      sideTitle="Securely recover your account."
      sideText="Reset codes expire quickly so your account stays protected while still giving you a simple recovery flow."
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@college.edu"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Reset code
          </label>

          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleCodeChange}
            placeholder="Enter 6-digit code"
            maxLength="6"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 tracking-[0.4em] outline-none placeholder:tracking-normal placeholder:text-slate-600 focus:border-blue-500"
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
            placeholder="Create new password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Resetting password..." : "Reset password"}
        </button>
      </form>

      <p className="mt-5 text-xs text-slate-500">
        Need another code?{" "}
        <Link to="/forgot-password" className="text-slate-300 hover:text-white">
          Send again
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ResetPassword;