import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Brain,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  getResource,
  updateResource,
  summarizeResource,
  generateQuiz,
  submitQuiz,
  markReviewed,
} from "../api/endpoints";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const load = () => getResource(id).then((res) => setResource(res.data));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await summarizeResource(id);
      setResource(res.data);
      toast.success("Summary ready");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not summarize");
    } finally {
      setSummarizing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    setQuiz(null);
    try {
      const res = await generateQuiz(id, 5);
      setQuiz(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate quiz");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleStatusChange = async (status) => {
    const res = await updateResource(id, { ...resource, status, topicId: resource.topic?.id });
    setResource(res.data);
  };

  const handleMarkReviewed = async () => {
    const res = await markReviewed(id);
    setResource(res.data);
    toast.success("Marked as reviewed — retention boosted");
  };

  if (!resource) return <Loader />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to="/topics" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      <div className="animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl font-display font-semibold">{resource.title}</h1>
          {resource.sourceUrl && (
            <a
              href={resource.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-signal hover:underline flex items-center gap-1 shrink-0"
            >
              Open source <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={resource.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input py-1.5 text-sm w-auto"
          >
            <option value="NOT_STARTED">Not started</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button onClick={handleMarkReviewed} className="btn-secondary text-sm py-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Mark reviewed
          </button>
          <span className="text-xs text-ink-faint font-mono ml-auto">
            Mastery {Math.round(resource.masteryScore)}%
          </span>
        </div>
      </div>

      {/* Notes */}
      {resource.rawContent && (
        <div className="card p-5">
          <h2 className="text-sm font-medium text-ink-muted mb-2">Your notes</h2>
          <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{resource.rawContent}</p>
        </div>
      )}

      {/* AI Summary */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purpose" />
            <h2 className="font-display font-medium">AI Summary</h2>
          </div>
          <button onClick={handleSummarize} disabled={summarizing} className="btn-secondary text-sm py-1.5">
            {summarizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Summarizing…
              </>
            ) : resource.aiSummary ? (
              "Regenerate"
            ) : (
              "Generate summary"
            )}
          </button>
        </div>
        {resource.aiSummary ? (
          <div className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{resource.aiSummary}</div>
        ) : (
          <p className="text-sm text-ink-faint">No summary yet. Generate one from your notes above.</p>
        )}
      </motion.div>

      {/* Quiz */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-signal" />
            <h2 className="font-display font-medium">Quiz yourself</h2>
          </div>
          <button onClick={handleGenerateQuiz} disabled={generatingQuiz} className="btn-primary text-sm py-1.5">
            {generatingQuiz ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…
              </>
            ) : (
              "Generate quiz"
            )}
          </button>
        </div>

        {quiz ? (
          <QuizRunner quiz={quiz} onComplete={() => load()} />
        ) : (
          <p className="text-sm text-ink-faint">
            Generate a 5-question quiz from your summary (or notes) to test what you remember.
          </p>
        )}
      </motion.div>
    </div>
  );
}

function QuizRunner({ quiz, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitQuiz(quiz.id, answers);
      setResult(res.data);
      onComplete();
    } catch (err) {
      toast.error("Could not submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-8 h-8 text-signal mx-auto mb-2" />
        <p className="text-2xl font-display font-semibold">
          {result.correctAnswers}/{result.totalQuestions}
        </p>
        <p className="text-sm text-ink-muted">{Math.round(result.scorePercent)}% — retention updated</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="border-t border-space-border pt-4 first:border-t-0 first:pt-0">
          <p className="text-sm font-medium text-ink mb-2">
            {idx + 1}. {q.questionText}
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {["A", "B", "C", "D"].map((opt) => {
              const text = q[`option${opt}`];
              if (!text) return null;
              const selected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    selected
                      ? "border-signal bg-signal/10 text-signal"
                      : "border-space-border bg-space-900 text-ink-muted hover:border-space-600"
                  }`}
                >
                  <span className="font-mono text-xs mr-1.5">{opt}</span> {text}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
        className="btn-primary w-full mt-2"
      >
        {submitting ? "Submitting…" : "Submit answers"}
      </button>
    </div>
  );
}
