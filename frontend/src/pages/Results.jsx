import { useLocation, Link, Navigate } from "react-router-dom";
import ScoreCircle from "../components/ScoreCircle";

export default function Results() {
  const location = useLocation();
  const interview = location.state?.interview;

  if (!interview) {
    return <Navigate to="/dashboard" replace />;
  }

  const questions = interview.questions || [];
  const overallScore = interview.overallScore || 0;

  // Calculate average dimension scores
  const avgCorrectness = avg(questions.map((q) => q.correctness || 0));
  const avgRelevance = avg(questions.map((q) => q.relevance || 0));
  const avgTechnical = avg(questions.map((q) => q.technicalDepth || 0));
  const avgCommunication = avg(questions.map((q) => q.communication || 0));

  const grade = getGrade(overallScore);

  return (
    <div className="page results-page">
      {/* Header */}
      <div className="results-header">
        <div className="results-header-content">
          <h1 className="page-title">Interview Complete!</h1>
          <p className="page-subtitle">
            {interview.targetRole} • {interview.interviewType} • {interview.difficulty}
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Overall Score */}
      <div className="results-overall">
        <div className="results-overall-left">
          <ScoreCircle score={overallScore} size={160} label="Overall Score" />
          <div className={`grade-badge grade-${grade}`}>
            {grade.charAt(0).toUpperCase() + grade.slice(1)}
          </div>
        </div>

        <div className="results-overall-right">
          <h2>Performance Summary</h2>
          <div className="results-dimensions">
            <DimensionBar label="Correctness" value={avgCorrectness} />
            <DimensionBar label="Relevance" value={avgRelevance} />
            <DimensionBar label="Technical Depth" value={avgTechnical} />
            <DimensionBar label="Communication" value={avgCommunication} />
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="results-breakdown">
        <h2 className="section-mini-title">Question-by-Question Breakdown</h2>
        <div className="results-questions">
          {questions.map((q, i) => (
            <div key={i} className="results-question-card">
              <div className="results-question-header">
                <span className="results-q-num">Q{i + 1}</span>
                <span className="results-q-score">
                  {q.score > 0 ? `${q.score}/10` : "Not evaluated"}
                </span>
              </div>
              <p className="results-q-question">{q.question}</p>
              {q.answer && (
                <div className="results-q-answer">
                  <p className="results-q-label">Your Answer:</p>
                  <p>{q.answer}</p>
                </div>
              )}
              {q.feedback && (
                <div className="results-q-feedback">
                  <p className="results-q-label">AI Feedback:</p>
                  <p>{q.feedback}</p>
                </div>
              )}
              {q.strengths?.length > 0 && (
                <div className="results-q-tags">
                  <p className="results-q-label">Strengths:</p>
                  <div className="tag-list">
                    {q.strengths.map((s, j) => (
                      <span key={j} className="tag tag-green">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {q.improvements?.length > 0 && (
                <div className="results-q-tags">
                  <p className="results-q-label">Improvements:</p>
                  <div className="tag-list">
                    {q.improvements.map((s, j) => (
                      <span key={j} className="tag tag-amber">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <Link to="/interview/start" className="btn btn-primary btn-lg">
          Practice Again →
        </Link>
        <Link to="/dashboard" className="btn btn-outline btn-lg">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function DimensionBar({ label, value }) {
  const pct = (value / 10) * 100;
  const color =
    value >= 8 ? "#10b981" : value >= 6 ? "#3b82f6" : value >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="dim-bar">
      <div className="dim-bar-header">
        <span>{label}</span>
        <span className="dim-bar-value">{value.toFixed(1)}/10</span>
      </div>
      <div className="dim-bar-track">
        <div className="dim-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function getGrade(score) {
  if (score >= 8) return "excellent";
  if (score >= 6) return "good";
  if (score >= 4) return "average";
  return "poor";
}
