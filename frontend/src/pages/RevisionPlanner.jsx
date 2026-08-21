import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Sparkles } from "lucide-react";
import { getTodayPlan } from "../api/endpoints";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function RevisionPlanner() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await getTodayPlan();
      setPlan(res.data.plan);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate a plan");
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="w-5 h-5 text-signal" />
          <h1 className="text-2xl font-display font-semibold">Revision Planner</h1>
        </div>
        <p className="text-sm text-ink-muted">
          An AI-prioritized plan for today, driven by your Decay Radar and any upcoming exam or interview dates.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 min-h-[240px]">
        {loading ? (
          <Loader label="Building today's plan…" />
        ) : plan ? (
          <div className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{plan}</div>
        ) : hasLoaded ? (
          <p className="text-sm text-ink-faint">No plan available yet — add some topics first.</p>
        ) : null}
      </motion.div>

      <button onClick={fetchPlan} disabled={loading} className="btn-secondary w-full">
        <Sparkles className="w-4 h-4" /> Regenerate plan
      </button>
    </div>
  );
}
