import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import Icon from "../components/Icons";

const TYPES = [
  { value: "technical", label: "Technical", icon: "code", desc: "Coding, algorithms, system design" },
  { value: "hr", label: "HR", icon: "users", desc: "Culture fit, behavioral, situational" },
  { value: "behavioral", label: "Behavioral", icon: "brain", desc: "STAR method, leadership, teamwork" },
  { value: "mixed", label: "Mixed", icon: "target", desc: "Combination of all question types" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", icon: "check", desc: "Fundamentals & basic concepts" },
  { value: "medium", label: "Medium", icon: "clock", desc: "Intermediate concepts & problem solving" },
  { value: "hard", label: "Hard", icon: "alertTriangle", desc: "Advanced topics & complex scenarios" },
];

export default function StartInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState(user?.targetRole || "");
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setError("Please enter or select a target role");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await api("/api/interviews/start", {
        method: "POST",
        body: {
          userId: user.id,
          targetRole: targetRole.trim(),
          interviewType,
          difficulty,
        },
      });

      const interviewId = data.interview._id;
      navigate(`/interview/${interviewId}`, { state: { interview: data.interview } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Start New Interview</h1>
          <p className="page-subtitle">Configure your interview session</p>
        </div>
      </div>

      <form onSubmit={handleStart} className="start-form">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Target Role */}
        <div className="form-section">
          <h2 className="form-section-title">Target Role</h2>
          <input
            type="text"
            className="form-input-lg"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Frontend Developer, Data Scientist..."
          />
        </div>

        {/* Interview Type */}
        <div className="form-section">
          <h2 className="form-section-title">Interview Type</h2>
          <div className="option-grid">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`option-card ${interviewType === t.value ? "selected" : ""}`}
                onClick={() => setInterviewType(t.value)}
              >
                <span className="option-icon"><Icon name={t.icon} size={28} /></span>
                <span className="option-label">{t.label}</span>
                <span className="option-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="form-section">
          <h2 className="form-section-title">Difficulty</h2>
          <div className="option-grid option-grid-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                className={`option-card ${difficulty === d.value ? "selected" : ""}`}
                onClick={() => setDifficulty(d.value)}
              >
                <span className="option-icon"><Icon name={d.icon} size={28} /></span>
                <span className="option-label">{d.label}</span>
                <span className="option-desc">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Interview →"}
          </button>
        </div>
      </form>
    </div>
  );
}
