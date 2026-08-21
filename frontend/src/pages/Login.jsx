import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radar, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="card p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center">
            <Radar className="w-4 h-4 text-signal" />
          </div>
          <span className="font-display font-semibold text-lg">Recall</span>
        </div>
        <h1 className="text-xl font-display font-semibold mt-4 mb-1">Welcome back</h1>
        <p className="text-sm text-ink-muted mb-6">Sign in to pick up where you left off.</p>

        <label className="label">Email</label>
        <input
          type="email"
          required
          className="input mb-4"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
        />

        <label className="label">Password</label>
        <input
          type="password"
          required
          className="input mb-6"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign in"}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-sm text-ink-muted text-center mt-6">
          New here?{" "}
          <Link to="/register" className="text-signal hover:underline">
            Create an account
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-signal/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-signal/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-signal/10" />
      </div>
      {children}
    </div>
  );
}
