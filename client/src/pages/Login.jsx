import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = formData.email.toLowerCase().trim();

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email: normalizedEmail,
          password: formData.password
        }
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage(data.message);

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Welcome back"
      title="Login to SkillSwap"
      subtitle="Continue learning from peers, managing sessions, and tracking your credits."
      sideTitle="Your campus learning network is waiting."
      sideText="Access your dashboard to discover mentors, manage sessions, and grow your skills with students around you."
      footerText="Don’t have an account?"
      footerLinkText="Create account"
      footerLinkTo="/signup"
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
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-xs text-slate-500">
        Need to verify your email?{" "}
        <Link to="/verify-email" className="text-slate-300 hover:text-white">
          Verify here
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;