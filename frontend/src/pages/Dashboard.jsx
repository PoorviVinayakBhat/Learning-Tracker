import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Brain, Target, Radar, Sparkles } from "lucide-react";
import { getDashboard, getDecayRadar } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import MiniRadar from "../components/MiniRadar";
import Loader from "../components/Loader";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [radar, setRadar] = useState(null);

  useEffect(() => {
    getDashboard().then((res) => setStats(res.data));
    getDecayRadar().then((res) => setRadar(res.data));
  }, []);

  if (!stats) return <Loader />;

  const firstName = user?.fullName?.split(" ")[0];

  const cards = [
    { label: "Resources tracked", value: stats.totalResources, icon: BookOpen, color: "text-signal" },
    { label: "Completed", value: stats.completedResources, icon: CheckCircle2, color: "text-signal" },
    { label: "Avg. quiz score", value: `${stats.averageQuizScore}%`, icon: Brain, color: "text-purpose" },
    { label: "Overall retention", value: `${stats.overallRetentionPercent}%`, icon: Target, color: retentionColor(stats.overallRetentionPercent) },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <p className="text-sm text-ink-faint font-mono mb-1">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="card p-5"
          >
            <c.icon className={`w-5 h-5 mb-3 ${c.color}`} />
            <p className="text-2xl font-display font-semibold">{c.value}</p>
            <p className="text-xs text-ink-muted mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 card p-6 flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-2 self-start mb-4">
            <Radar className="w-4 h-4 text-signal" />
            <h2 className="font-display font-medium">Decay Radar</h2>
          </div>
          {radar && radar.topics.length > 0 ? (
            <MiniRadar topics={radar.topics} />
          ) : (
            <p className="text-sm text-ink-faint py-10">Add topics & resources to see your radar.</p>
          )}
          <Link to="/decay-radar" className="btn-secondary w-full mt-4 text-sm">
            View full radar
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purpose" />
            <h2 className="font-display font-medium">Most at risk of being forgotten</h2>
          </div>
          {radar && radar.mostAtRisk.length > 0 ? (
            <div className="space-y-3">
              {radar.mostAtRisk.slice(0, 6).map((r) => (
                <Link
                  key={r.resourceId}
                  to={`/resources/${r.resourceId}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-space-800 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{r.resourceTitle}</p>
                    <p className="text-xs text-ink-faint">{r.topicName}</p>
                  </div>
                  <span className={`badge shrink-0 ${retentionBadgeColor(r.retentionPercent)}`}>
                    {r.retentionPercent}%
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint py-10 text-center">
              Nothing to review yet — go add some resources.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function retentionColor(pct) {
  if (pct >= 70) return "text-signal";
  if (pct >= 40) return "text-purpose";
  return "text-decay";
}

function retentionBadgeColor(pct) {
  if (pct >= 70) return "bg-signal/10 text-signal";
  if (pct >= 40) return "bg-purpose/10 text-purpose";
  return "bg-decay/10 text-decay";
}
