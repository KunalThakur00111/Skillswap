import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import AuthLayout from "../components/AuthLayout";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = formData.email.toLowerCase().trim();

      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: {
          name: formData.name.trim(),
          email: normalizedEmail,
          password: formData.password
        }
      });

      localStorage.setItem("pendingVerificationEmail", normalizedEmail);

      setMessage(data.message);

      setTimeout(() => {
        navigate("/verify-email");
      }, 800);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Join SkillSwap"
      title="Create your account"
      subtitle="Verify your student email, add your skills, and start learning with peers on your campus."
      sideTitle="Turn your skills into learning credits."
      sideText="Teach what you know, earn credits, and use those credits to learn from other students."
      footerText="Already have an account?"
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
            Full name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Kunal Thakur"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            College email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@college.edu"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-slate-500">
            Use an approved college email domain.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-slate-500">
            Minimum 6 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-xs text-slate-500">
        Already received a code?{" "}
        <Link to="/verify-email" className="text-slate-300 hover:text-white">
          Verify email
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;