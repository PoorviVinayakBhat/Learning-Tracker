import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, Layers, X, GraduationCap, Briefcase, Target, BookOpen } from "lucide-react";
import { getTopics, createTopic, deleteTopic } from "../api/endpoints";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const PURPOSE_META = {
  EXAM: { icon: GraduationCap, color: "text-decay bg-decay/10" },
  INTERVIEW: { icon: Briefcase, color: "text-purpose bg-purpose/10" },
  WORK: { icon: Target, color: "text-signal bg-signal/10" },
  GENERAL: { icon: BookOpen, color: "text-ink-muted bg-space-800" },
};

export default function Topics() {
  const [topics, setTopics] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => getTopics().then((res) => setTopics(res.data));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this topic and all its resources?")) return;
    await deleteTopic(id);
    toast.success("Topic deleted");
    load();
  };

  if (!topics) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-semibold">Topics</h1>
          <p className="text-sm text-ink-muted mt-1">Group what you're learning by subject or goal.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New topic
        </button>
      </div>

      {topics.length === 0 ? (
        <div className="card p-16 text-center">
          <Layers className="w-8 h-8 text-ink-faint mx-auto mb-3" />
          <p className="text-ink-muted">No topics yet. Create your first one to start tracking resources.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t, i) => {
            const meta = PURPOSE_META[t.purpose] || PURPOSE_META.GENERAL;
            const Icon = meta.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link to={`/topics/${t.id}`} className="card p-5 flex flex-col h-full group hover:border-signal/40 transition-colors relative">
                  <button
                    onClick={(e) => handleDelete(t.id, e)}
                    className="absolute top-3 right-3 text-ink-faint hover:text-decay opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-medium mb-1">{t.name}</h3>
                  {t.description && (
                    <p className="text-sm text-ink-muted line-clamp-2 mb-3">{t.description}</p>
                  )}
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <span className="badge bg-space-800 text-ink-muted">{t.purpose}</span>
                    {t.targetDate && (
                      <span className="text-xs text-ink-faint font-mono">
                        due {new Date(t.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <NewTopicModal
            onClose={() => setModalOpen(false)}
            onCreated={() => {
              setModalOpen(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewTopicModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", purpose: "GENERAL", targetDate: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTopic({
        ...form,
        targetDate: form.targetDate ? `${form.targetDate}T00:00:00` : null,
      });
      toast.success("Topic created");
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create topic");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-space-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="card p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-medium text-lg">New topic</h2>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="label">Name</label>
        <input
          required
          className="input mb-4"
          placeholder="e.g. System Design"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label className="label">Description (optional)</label>
        <textarea
          className="input mb-4 resize-none"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="label">Purpose</label>
            <select
              className="input"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            >
              <option value="GENERAL">General</option>
              <option value="EXAM">Exam</option>
              <option value="INTERVIEW">Interview</option>
              <option value="WORK">Work</option>
            </select>
          </div>
          <div>
            <label className="label">Target date</label>
            <input
              type="date"
              className="input"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Creating…" : "Create topic"}
        </button>
      </motion.form>
    </motion.div>
  );
}
