import { Radar } from "lucide-react";

export default function Loader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <Radar className="w-5 h-5 text-signal" />
        <span className="absolute inset-0 rounded-full border border-signal/40 animate-pulse-ring" />
      </div>
      <p className="text-sm text-ink-faint font-mono">{label}</p>
    </div>
  );
}
