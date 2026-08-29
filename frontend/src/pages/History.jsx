import { Link } from "react-router-dom";
import Icon from "../components/Icons";

export default function History() {
  // In a real app, this would fetch from the API
  const interviews = [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Interview History</h1>
          <p className="page-subtitle">Review your past interview sessions</p>
        </div>
        <Link to="/interview/start" className="btn btn-primary">
          + New Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="clipboardList" size={48} /></div>
          <h3>No interview history yet</h3>
          <p>Complete your first interview to see your results here.</p>
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
                <th>Difficulty</th>
                <th>Score</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => (
                <tr key={interview._id}>
                  <td>{interview.targetRole}</td>
                  <td>
                    <span className="badge">{interview.interviewType}</span>
                  </td>
                  <td>
                    <span className="badge">{interview.difficulty}</span>
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
  );
}

function getScoreClass(score) {
  if (score >= 8) return "excellent";
  if (score >= 6) return "good";
  if (score >= 4) return "average";
  return "poor";
}
