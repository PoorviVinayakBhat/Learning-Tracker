import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radar, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "./Login";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      toast.success("Account created — let's get learning.");
      navigate("/");
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = errors ? Object.values(errors)[0] : err.response?.data?.message;
      toast.error(message || "Could not create account");
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
        <h1 className="text-xl font-display font-semibold mt-4 mb-1">Create your account</h1>
        <p className="text-sm text-ink-muted mb-6">Start tracking everything you learn, in one place.</p>

        <label className="label">Full name</label>
        <input
          required
          className="input mb-4"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Ada Lovelace"
        />

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
          minLength={6}
          className="input mb-6"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="At least 6 characters"
        />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create account"}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-sm text-ink-muted text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-signal hover:underline">
            Sign in
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}
