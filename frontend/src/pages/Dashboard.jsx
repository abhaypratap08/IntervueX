import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import Icon from "../components/Icons";

export default function Dashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We don't have a list-interviews endpoint yet, so we'll show empty state
    // In a real app, you'd fetch: api("/api/interviews?userId=" + user.id)
    setLoading(false);
  }, [user]);

  const stats = [
    {
      icon: "mic",
      label: "Total Interviews",
      value: interviews.length || "—",
      color: "#3b82f6",
    },
    {
      icon: "barChart",
      label: "Avg. Score",
      value:
        interviews.length > 0
          ? (
              interviews.reduce((a, b) => a + (b.overallScore || 0), 0) /
              interviews.length
            ).toFixed(1) + "/10"
          : "—",
      color: "#10b981",
    },
    {
      icon: "check",
      label: "Completed",
      value: interviews.filter((i) => i.status === "completed").length || "—",
      color: "#8b5cf6",
    },
    {
      icon: "target",
      label: "Target Role",
      value: user?.targetRole || "Not set",
      color: "#f59e0b",
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="page-subtitle">
            Here's your interview preparation overview
          </p>
        </div>
        <Link to="/interview/start" className="btn btn-primary">
          + New Interview
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + "15", color: s.color }}>
              <Icon name={s.icon} size={20} />
            </div>
            <div className="stat-info">
              <p className="stat-label">{s.label}</p>
              <p className="stat-value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-mini-title">Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/interview/start" className="action-card">
            <div className="action-icon"><Icon name="mic" size={28} /></div>
            <h3>Start Interview</h3>
            <p>Practice with AI-generated questions tailored to your role</p>
          </Link>
          <Link to="/history" className="action-card">
            <div className="action-icon"><Icon name="clipboardList" size={28} /></div>
            <h3>View History</h3>
            <p>Review past interviews and track your improvement</p>
          </Link>
          <div className="action-card action-card-info">
            <div className="action-icon"><Icon name="lightbulb" size={28} /></div>
            <h3>Tips</h3>
            <p>
              <strong>STAR Method:</strong> Structure answers with Situation, Task,
              Action, Result for behavioral questions.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="recent-section">
        <h2 className="section-mini-title">Recent Interviews</h2>
        {loading ? (
          <div className="page-center">
            <div className="spinner" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="target" size={48} /></div>
            <h3>No interviews yet</h3>
            <p>Start your first AI-powered interview to see your results here.</p>
            <Link to="/interview/start" className="btn btn-primary">
              Start Your First Interview
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {interviews.slice(0, 5).map((interview) => (
                  <tr key={interview._id}>
                    <td>{interview.targetRole}</td>
                    <td>
                      <span className="badge">{interview.interviewType}</span>
                    </td>
                    <td>
                      <span className={`score-badge score-${getScoreClass(interview.overallScore)}`}>
                        {interview.overallScore}/10
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${interview.status}`}>
                        {interview.status}
                      </span>
                    </td>
                    <td>{new Date(interview.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getScoreClass(score) {
  if (score >= 8) return "excellent";
  if (score >= 6) return "good";
  if (score >= 4) return "average";
  return "poor";
}
