import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Radar as RadarIcon, Info } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { getDecayRadar } from "../api/endpoints";
import Loader from "../components/Loader";

export default function DecayRadarPage() {
  const [radar, setRadar] = useState(null);

  useEffect(() => {
    getDecayRadar().then((res) => setRadar(res.data));
  }, []);

  if (!radar) return <Loader label="Scanning your knowledge…" />;

  const data = radar.topics.map((t) => ({
    topic: t.topicName,
    retention: t.averageRetentionPercent,
    resources: t.resourceCount,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RadarIcon className="w-5 h-5 text-signal" />
            <h1 className="text-2xl font-display font-semibold">Knowledge Decay Radar</h1>
          </div>
          <p className="text-sm text-ink-muted max-w-xl">
            Every topic decays on its own forgetting curve. This radar estimates how much of
            each subject you'd still remember right now — reviewing or quizzing yourself
            resets the curve and pushes the point back out.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 card p-6 relative overflow-hidden"
        >
          {/* signature sonar sweep, purely decorative, sits behind the chart */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="relative w-[340px] h-[340px]">
              <div className="absolute inset-0 origin-center animate-sweep">
                <div
                  className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left"
                  style={{
                    background: "linear-gradient(90deg, rgba(53,230,196,0.9), transparent)",
                  }}
                />
              </div>
            </div>
          </div>

          {data.length > 0 ? (
            <div className="w-full h-[380px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="70%">
                  <PolarGrid stroke="#232B45" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: "#E8ECF4", fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#535D7A", fontSize: 10 }} axisLine={false} />
                  <Radar
                    dataKey="retention"
                    stroke="#35E6C4"
                    fill="#35E6C4"
                    fillOpacity={0.28}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#141B30",
                      border: "1px solid #232B45",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                    formatter={(value, name, props) => [`${value}% retained`, props.payload.topic]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-ink-faint py-24 text-center relative">
              No topics yet — <Link to="/topics" className="text-signal hover:underline">create one</Link> to see your radar.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 card p-6"
        >
          <h2 className="font-display font-medium mb-4">Needs review soonest</h2>
          {radar.mostAtRisk.length > 0 ? (
            <div className="space-y-3">
              {radar.mostAtRisk.map((r) => (
                <Link
                  key={r.resourceId}
                  to={`/resources/${r.resourceId}`}
                  className="block px-3 py-2.5 rounded-xl hover:bg-space-800 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm text-ink truncate">{r.resourceTitle}</p>
                    <span className={`badge shrink-0 ${badgeColor(r.retentionPercent)}`}>
                      {r.retentionPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-ink-faint">
                    {r.topicName} · {r.daysSinceReview >= 0 ? `${r.daysSinceReview}d since review` : "never reviewed"}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">Nothing at risk right now.</p>
          )}

          <div className="mt-6 flex items-start gap-2 text-xs text-ink-faint border-t border-space-border pt-4">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              Retention is modeled as R(t) = e<sup>-t/S</sup>, where t is days since last
              review and S grows every time you review or pass a quiz on that material.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function badgeColor(pct) {
  if (pct >= 70) return "bg-signal/10 text-signal";
  if (pct >= 40) return "bg-purpose/10 text-purpose";
  return "bg-decay/10 text-decay";
}
