import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  Radar,
  CalendarClock,
  Search,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { searchResources } from "../api/endpoints";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/topics", label: "Topics", icon: Layers },
  { to: "/decay-radar", label: "Decay Radar", icon: Radar },
  { to: "/planner", label: "Revision Planner", icon: CalendarClock },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await searchResources(query.trim());
      setResults(res.data);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-space-border bg-space-900/60 backdrop-blur-sm px-5 py-6">
        <div className="flex items-center gap-2.5 px-1 mb-8">
          <div className="relative w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center">
            <Radar className="w-4 h-4 text-signal" />
            <span className="absolute inset-0 rounded-lg border border-signal/40 animate-pulse-ring" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Recall</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-signal/10 text-signal border border-signal/20"
                    : "text-ink-muted border border-transparent hover:text-ink hover:bg-space-800"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-space-border">
          <div className="px-1 mb-3">
            <p className="text-sm font-medium text-ink truncate">{user?.fullName}</p>
            <p className="text-xs text-ink-faint truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-muted hover:text-decay hover:bg-decay/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-space-border bg-space-950/70 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-3.5 flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value) setResults(null);
                }}
                placeholder="Search your resources…"
                className="input pl-9 py-2 text-sm"
              />
            </form>
            <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-ink-faint font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purpose" />
              AI-assisted learning
            </div>
          </div>
          {results !== null && (
            <div className="px-6 pb-3">
              <SearchResults results={results} searching={searching} onClose={() => setResults(null)} />
            </div>
          )}
        </header>

        <motion.main
          key={window.location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

function SearchResults({ results, searching, onClose }) {
  const navigate = useNavigate();
  if (searching) return <p className="text-sm text-ink-faint">Searching…</p>;
  if (results.length === 0) return <p className="text-sm text-ink-faint">No matches found.</p>;
  return (
    <div className="card p-2 max-h-64 overflow-y-auto">
      {results.map((r) => (
        <button
          key={r.id}
          onClick={() => {
            onClose();
            navigate(`/resources/${r.id}`);
          }}
          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-space-800 text-sm text-ink"
        >
          {r.title}
        </button>
      ))}
    </div>
  );
}
