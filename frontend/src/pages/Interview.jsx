import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import Icon from "../components/Icons";

export default function Interview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(location.state?.interview || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [completing, setCompleting] = useState(false);

  // Fetch interview if not passed via state
  useEffect(() => {
    if (!interview) {
      api(`/api/interviews/start`, {
        method: "POST",
        body: { userId: "self", targetRole: "General" },
      }).catch(() => {
        // If we can't fetch, redirect
        navigate("/dashboard");
      });
    }
  }, [interview, navigate]);

  if (!interview) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  const questions = interview.questions || [];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const hasAnswer = current?.answer?.trim();
  const hasEvaluation = current?.score > 0;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await api("/api/interviews/answer", {
        method: "POST",
        body: {
          interviewId: id,
          questionIndex: currentIndex,
          answer: answer.trim(),
        },
      });

      // Update local state
      const updated = { ...interview };
      updated.questions = [...updated.questions];
      updated.questions[currentIndex] = {
        ...updated.questions[currentIndex],
        answer: answer.trim(),
      };
      setInterview(updated);
      setAnswer("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluate = async () => {
    setError("");
    setEvaluating(true);
    setEvaluation(null);
    try {
      const data = await api("/api/interviews/evaluate", {
        method: "POST",
        body: {
          interviewId: id,
          questionIndex: currentIndex,
        },
      });

      setEvaluation(data.evaluation);

      // Update local state
      const updated = { ...interview };
      updated.questions = [...updated.questions];
      updated.questions[currentIndex] = {
        ...updated.questions[currentIndex],
        ...data.evaluation,
      };
      setInterview(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleComplete = async () => {
    setError("");
    setCompleting(true);
    try {
      const data = await api("/api/interviews/complete", {
        method: "POST",
        body: { interviewId: id },
      });
      navigate("/results", { state: { interview: data.interview } });
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setEvaluation(null);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setAnswer("");
      setEvaluation(null);
    }
  };

  return (
    <div className="page interview-page">
      {/* Header */}
      <div className="interview-header">
        <div className="interview-header-left">
          <h1 className="page-title">
            {interview.targetRole} Interview
          </h1>
          <div className="interview-meta">
            <span className="badge">{interview.interviewType}</span>
            <span className="badge">{interview.difficulty}</span>
          </div>
        </div>
        <div className="interview-progress-info">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Dots */}
      <div className="question-dots">
        {questions.map((q, i) => (
          <button
            key={i}
            className={`question-dot ${
              i === currentIndex ? "active" : ""
            } ${q.score > 0 ? "completed" : ""} ${q.answer && !q.score ? "answered" : ""}`}
            onClick={() => {
              setCurrentIndex(i);
              setAnswer("");
              setEvaluation(null);
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Question Card */}
      <div className="interview-card">
        <div className="interview-card-header">
          <span className="question-number">Question {currentIndex + 1}</span>
          {hasEvaluation && (
            <span className="score-badge score-good">
              Score: {current.score}/10
            </span>
          )}
        </div>

        <p className="question-text">{current?.question}</p>

        {/* Answer Input */}
        {!hasAnswer ? (
          <div className="answer-section">
            <textarea
              className="answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={8}
            />
            <div className="answer-actions">
              <button
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
              >
                {submitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        ) : (
          <div className="answer-display">
            <p className="answer-label">Your Answer:</p>
            <p className="answer-text">{current.answer}</p>

            {/* Evaluate Button */}
            {!hasEvaluation && !evaluation && (
              <button
                className="btn btn-primary"
                onClick={handleEvaluate}
                disabled={evaluating}
              >
                {evaluating ? "Evaluating..." : "Evaluate with AI"}
              </button>
            )}

            {/* Evaluation Results */}
            {(evaluation || hasEvaluation) && (
              <div className="evaluation-results">
                <h3 className="evaluation-title">AI Evaluation</h3>
                <div className="evaluation-grid">
                  <EvalMetric label="Correctness" value={evaluation?.correctness || current.correctness} />
                  <EvalMetric label="Relevance" value={evaluation?.relevance || current.relevance} />
                  <EvalMetric label="Technical Depth" value={evaluation?.technicalDepth || current.technicalDepth} />
                  <EvalMetric label="Communication" value={evaluation?.communication || current.communication} />
                </div>

                {(evaluation?.strengths || current.strengths?.length > 0) && (
                  <div className="evaluation-section">
                    <h4><Icon name="strength" size={16} /> Strengths</h4>
                    <ul>
                      {(evaluation?.strengths || current.strengths || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(evaluation?.improvements || current.improvements?.length > 0) && (
                  <div className="evaluation-section">
                    <h4><Icon name="trendingUp" size={16} /> Areas for Improvement</h4>
                    <ul>
                      {(evaluation?.improvements || current.improvements || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(evaluation?.feedback || current.feedback) && (
                  <div className="evaluation-section">
                    <h4><Icon name="messageCircle" size={16} /> Feedback</h4>
                    <p>{evaluation?.feedback || current.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="interview-nav">
        <button
          className="btn btn-ghost"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        <div className="interview-nav-right">
          {isLast && hasEvaluation ? (
            <button
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? "Completing..." : "Complete Interview ✓"}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={goNext}
              disabled={currentIndex >= questions.length - 1}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EvalMetric({ label, value }) {
  const pct = ((value || 0) / 10) * 100;
  const color =
    value >= 8 ? "#10b981" : value >= 6 ? "#3b82f6" : value >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="eval-metric">
      <div className="eval-metric-header">
        <span>{label}</span>
        <span className="eval-metric-value">{value}/10</span>
      </div>
      <div className="eval-metric-bar">
        <div
          className="eval-metric-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
