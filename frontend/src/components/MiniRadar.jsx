import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

export default function MiniRadar({ topics }) {
  const data = topics.map((t) => ({
    topic: t.topicName.length > 10 ? t.topicName.slice(0, 10) + "…" : t.topicName,
    retention: t.averageRetentionPercent,
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#232B45" />
          <PolarAngleAxis dataKey="topic" tick={{ fill: "#8B94AC", fontSize: 11 }} />
          <Radar
            dataKey="retention"
            stroke="#35E6C4"
            fill="#35E6C4"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
