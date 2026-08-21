import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Plus, ArrowLeft, X, Play, Book, GraduationCap, FileText, File } from "lucide-react";
import { getTopic, getResources, createResource } from "../api/endpoints";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const TYPE_META = {
  YOUTUBE_VIDEO: { icon: Play, label: "YouTube" },
  BOOK: { icon: Book, label: "Book" },
  COURSE: { icon: GraduationCap, label: "Course" },
  ARTICLE: { icon: FileText, label: "Article" },
  PDF: { icon: File, label: "PDF" },
  OTHER: { icon: FileText, label: "Other" },
};

const STATUS_META = {
  NOT_STARTED: { label: "Not started", color: "bg-space-800 text-ink-muted" },
  IN_PROGRESS: { label: "In progress", color: "bg-purpose/10 text-purpose" },
  COMPLETED: { label: "Completed", color: "bg-signal/10 text-signal" },
};

export default function TopicDetail() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [resources, setResources] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    getTopic(id).then((res) => setTopic(res.data));
    getResources(id).then((res) => setResources(res.data));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!topic || !resources) return <Loader />;

  return (
    <div className="space-y-6">
      <Link to="/topics" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="w-3.5 h-3.5" /> Topics
      </Link>

      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-display font-semibold">{topic.name}</h1>
          {topic.description && <p className="text-sm text-ink-muted mt-1">{topic.description}</p>}
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add resource
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-ink-muted">No resources in this topic yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r, i) => {
            const typeMeta = TYPE_META[r.type] || TYPE_META.OTHER;
            const statusMeta = STATUS_META[r.status];
            const Icon = typeMeta.icon;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/resources/${r.id}`}
                  className="card p-4 flex items-center gap-4 hover:border-signal/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-space-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-ink-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{r.title}</p>
                    <p className="text-xs text-ink-faint">{typeMeta.label}</p>
                  </div>
                  <span className={`badge shrink-0 ${statusMeta.color}`}>{statusMeta.label}</span>
                  {r.masteryScore > 0 && (
                    <span className="text-xs text-ink-faint font-mono shrink-0 w-12 text-right">
                      {Math.round(r.masteryScore)}% mastery
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <NewResourceModal
            topicId={id}
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

function NewResourceModal({ topicId, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    type: "YOUTUBE_VIDEO",
    sourceUrl: "",
    rawContent: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createResource({ ...form, topicId: Number(topicId) });
      toast.success("Resource added");
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add resource");
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
        className="card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-medium text-lg">Add resource</h2>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="label">Title</label>
        <input
          required
          className="input mb-4"
          placeholder="e.g. CS50 Lecture 3 — Memory"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <label className="label">Type</label>
        <select
          className="input mb-4"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {Object.entries(TYPE_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>

        <label className="label">Source URL (optional)</label>
        <input
          className="input mb-4"
          placeholder="https://…"
          value={form.sourceUrl}
          onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
        />

        <label className="label">Notes / content</label>
        <p className="text-xs text-ink-faint mb-2">
          Paste a transcript, your notes, or key excerpts — this is what the AI will summarize and quiz you on.
        </p>
        <textarea
          className="input mb-6 resize-none"
          rows={6}
          value={form.rawContent}
          onChange={(e) => setForm({ ...form, rawContent: e.target.value })}
        />

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Adding…" : "Add resource"}
        </button>
      </motion.form>
    </motion.div>
  );
}
