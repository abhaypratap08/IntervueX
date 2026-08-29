import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import ScoreCircle from "../components/ScoreCircle";
import Icon from "../components/Icons";

export default function ResumeUpload() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // States
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [resumeName, setResumeName] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [profile, setProfile] = useState(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [scoring, setScoring] = useState(false);
  const [jobMatch, setJobMatch] = useState(null);

  const [error, setError] = useState("");
  const [step, setStep] = useState("upload"); // upload | analyze | results

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB");
        return;
      }
      setFile(selected);
      setError("");
    }
  };

  // Step 1: Upload
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("userId", user.id);

      const data = await api("/api/resumes/upload", {
        method: "POST",
        body: formData,
        isForm: true,
      });

      setResumeId(data.resume.id);
      setResumeName(data.resume.fileName);
      setStep("analyze");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Step 2: Analyze
  const handleAnalyze = async () => {
    setError("");
    setAnalyzing(true);
    try {
      const data = await api("/api/resumes/analyze", {
        method: "POST",
        body: { resumeId },
      });

      setAnalysis(data.resume.analysis);
      setProfile(data.resume.extractedProfile);
      setStep("results");
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 3: Score against job
  const handleScore = async () => {
    if (!jobTitle.trim() || !jobDesc.trim()) {
      setError("Please enter both job title and description");
      return;
    }
    setError("");
    setScoring(true);
    try {
      const data = await api("/api/resumes/score", {
        method: "POST",
        body: {
          resumeId,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDesc.trim(),
        },
      });
      setJobMatch(data.resume.jobMatch);
    } catch (err) {
      setError(err.message);
    } finally {
      setScoring(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setResumeId(null);
    setResumeName("");
    setAnalysis(null);
    setProfile(null);
    setJobMatch(null);
    setJobTitle("");
    setJobDesc("");
    setError("");
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="page resume-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resume Analysis</h1>
          <p className="page-subtitle">
            Upload your resume for AI-powered scoring and job matching
          </p>
        </div>
        {step !== "upload" && (
          <button className="btn btn-ghost" onClick={handleReset}>
            ← Upload New Resume
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ============ STEP INDICATORS ============ */}
      <div className="resume-steps">
        <div className={`resume-step ${step === "upload" ? "active" : ""} ${step !== "upload" ? "done" : ""}`}>
          <span className="resume-step-num">1</span>
          <span>Upload</span>
        </div>
        <div className="resume-step-line" />
        <div className={`resume-step ${step === "analyze" ? "active" : ""} ${step === "results" ? "done" : ""}`}>
          <span className="resume-step-num">2</span>
          <span>Analyze</span>
        </div>
        <div className="resume-step-line" />
        <div className={`resume-step ${step === "results" && analysis ? "active done" : ""}`}>
          <span className="resume-step-num">3</span>
          <span>Results</span>
        </div>
      </div>

      {/* ============ STEP 1: UPLOAD ============ */}
      {step === "upload" && (
        <div className="resume-upload-card">
          <div
            className={`upload-zone ${file ? "has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
                setError("");
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {file ? (
              <>
                <div className="upload-icon"><Icon name="fileText" size={48} /></div>
                <p className="upload-filename">{file.name}</p>
                <p className="upload-size">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <p className="upload-change">Click to change file</p>
              </>
            ) : (
              <>
                <div className="upload-icon"><Icon name="upload" size={48} /></div>
                <p className="upload-title">
                  Drop your resume here, or click to browse
                </p>
                <p className="upload-hint">
                  Supports PDF and TXT files up to 5MB
                </p>
              </>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading & Extracting..." : "Upload Resume"}
          </button>
        </div>
      )}

      {/* ============ STEP 2: ANALYZE ============ */}
      {step === "analyze" && (
        <div className="resume-analyze-card">
          <div className="analyze-header">
            <div className="analyze-file-info">
              <span className="analyze-icon"><Icon name="fileText" size={32} /></span>
              <div>
                <p className="analyze-filename">{resumeName}</p>
                <p className="analyze-status">Ready for AI analysis</p>
              </div>
            </div>
          </div>

          <div className="analyze-body">
            <p className="analyze-desc">
              Our AI will analyze your resume across multiple dimensions:
            </p>
            <div className="analyze-dimensions">
              <div className="analyze-dim">
                <span><Icon name="barChart" size={20} /></span>
                <div>
                  <p className="analyze-dim-title">ATS Compatibility</p>
                  <p className="analyze-dim-desc">How well it passes applicant tracking systems</p>
                </div>
              </div>
              <div className="analyze-dim">
                <span><Icon name="pen" size={20} /></span>
                <div>
                  <p className="analyze-dim-title">Content Quality</p>
                  <p className="analyze-dim-desc">Relevance and depth of your experience</p>
                </div>
              </div>
              <div className="analyze-dim">
                <span><Icon name="crosshair" size={20} /></span>
                <div>
                  <p className="analyze-dim-title">Impact & Quantification</p>
                  <p className="analyze-dim-desc">How well achievements are measured</p>
                </div>
              </div>
              <div className="analyze-dim">
                <span><Icon name="lightbulb" size={20} /></span>
                <div>
                  <p className="analyze-dim-title">Actionable Feedback</p>
                  <p className="analyze-dim-desc">Specific suggestions to improve your resume</p>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <span className="btn-loading">
                <span className="spinner-sm" />
                Analyzing with AI...
              </span>
            ) : (
              "Analyze Resume with AI"
            )}
          </button>
        </div>
      )}

      {/* ============ STEP 3: RESULTS ============ */}
      {step === "results" && analysis && (
        <div className="resume-results">
          {/* Score Overview */}
          <div className="results-score-section">
            <div className="results-score-left">
              <ScoreCircle score={analysis.overallScore} size={140} label="Overall Score" />
            </div>
            <div className="results-score-right">
              <h2>Resume Quality Analysis</h2>
              <div className="results-mini-scores">
                <MiniScore label="ATS Score" value={analysis.atsScore} icon="barChart" />
                <MiniScore label="Formatting" value={analysis.formattingScore} icon="pen" />
                <MiniScore label="Content" value={analysis.contentScore} icon="book" />
                <MiniScore label="Impact" value={analysis.impactScore} icon="crosshair" />
              </div>
            </div>
          </div>

          {/* Extracted Profile */}
          {profile && (
            <div className="results-section">
              <h3 className="results-section-title">Extracted Profile</h3>
              <div className="profile-grid">
                <ProfileItem label="Name" value={profile.name} />
                <ProfileItem label="Email" value={profile.email} />
                <ProfileItem label="Phone" value={profile.phone} />
                <ProfileItem label="Education" value={
                  profile.education?.map(e => `${e.degree} ${e.field ? `in ${e.field}` : ""} — ${e.institution}`).join("; ") || "—"
                } />
                <ProfileItem label="Experience" value={
                  profile.experience?.map(e => `${e.role} at ${e.company}`).join("; ") || "—"
                } />
                <ProfileItem label="Skills" value={
                  <div className="tag-list">
                    {profile.skills?.map((s, i) => (
                      <span key={i} className="tag tag-blue">{s}</span>
                    ))}
                  </div>
                } />
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="results-two-col">
            <div className="results-section">
              <h3 className="results-section-title"><Icon name="strength" size={18} /> Strengths</h3>
              <ul className="results-list">
                {analysis.strengths?.map((s, i) => (
                  <li key={i} className="results-list-item green">{s}</li>
                ))}
              </ul>
            </div>
            <div className="results-section">
              <h3 className="results-section-title"><Icon name="alertTriangle" size={18} /> Areas to Improve</h3>
              <ul className="results-list">
                {analysis.weaknesses?.map((w, i) => (
                  <li key={i} className="results-list-item amber">{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="results-section">
            <h3 className="results-section-title"><Icon name="lightbulb" size={18} /> Improvement Suggestions</h3>
            <div className="suggestions-grid">
              {analysis.suggestions?.map((s, i) => (
                <div key={i} className="suggestion-card">
                  <span className="suggestion-num">{i + 1}</span>
                  <p>{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="results-section feedback-section">
            <h3 className="results-section-title"><Icon name="messageCircle" size={18} /> AI Feedback</h3>
            <p className="feedback-text">{analysis.feedback}</p>
          </div>

          {/* ============ JOB MATCH SECTION ============ */}
          <div className="results-section job-match-section">
            <h3 className="results-section-title"><Icon name="crosshair" size={18} /> Match Against Job Description</h3>
            <p className="job-match-desc">
              Paste a job description to see how well your resume matches and get targeted improvement recommendations.
            </p>

            <div className="job-match-form">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={6}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleScore}
                disabled={scoring || !jobTitle.trim() || !jobDesc.trim()}
              >
                {scoring ? (
                  <span className="btn-loading">
                    <span className="spinner-sm" />
                    Matching...
                  </span>
                ) : (
                  "Match Against Job"
                )}
              </button>
            </div>

            {/* Job Match Results */}
            {jobMatch && (
              <div className="job-match-results">
                <div className="job-match-score-row">
                  <div className="job-match-score">
                    <span className="job-match-pct">{jobMatch.matchScore}%</span>
                    <span className="job-match-label">Match Score</span>
                  </div>
                  <div className="job-match-bar-wrap">
                    <div className="job-match-bar">
                      <div
                        className="job-match-bar-fill"
                        style={{
                          width: `${jobMatch.matchScore}%`,
                          background:
                            jobMatch.matchScore >= 70
                              ? "#10b981"
                              : jobMatch.matchScore >= 40
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="job-match-two-col">
                  <div>
                    <h4><Icon name="check" size={14} /> Matched Skills</h4>
                    <div className="tag-list">
                      {jobMatch.matchedSkills?.map((s, i) => (
                        <span key={i} className="tag tag-green">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4><Icon name="x" size={14} /> Missing Skills</h4>
                    <div className="tag-list">
                      {jobMatch.missingSkills?.map((s, i) => (
                        <span key={i} className="tag tag-amber">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="job-match-analysis">
                  <div className="job-match-detail">
                    <h4><Icon name="barChart" size={14} /> Skill Gap Analysis</h4>
                    <p>{jobMatch.skillGapAnalysis}</p>
                  </div>
                  <div className="job-match-detail">
                    <h4><Icon name="award" size={14} /> Qualification Match</h4>
                    <p>{jobMatch.qualificationMatch}</p>
                  </div>
                  <div className="job-match-detail">
                    <h4><Icon name="briefcase" size={14} /> Experience Match</h4>
                    <p>{jobMatch.experienceMatch}</p>
                  </div>
                  <div className="job-match-detail">
                    <h4><Icon name="clipboardList" size={14} /> Overall Assessment</h4>
                    <p>{jobMatch.overallAssessment}</p>
                  </div>
                </div>

                <div className="job-match-recommendations">
                  <h4><Icon name="rocket" size={14} /> Recommendations to Improve Match</h4>
                  <ul className="results-list">
                    {jobMatch.recommendations?.map((r, i) => (
                      <li key={i} className="results-list-item blue">{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniScore({ label, value, icon }) {
  const color =
    value >= 8 ? "#10b981" : value >= 6 ? "#3b82f6" : value >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <div className="mini-score">
      <span className="mini-score-icon"><Icon name={icon} size={16} /></span>
      <div className="mini-score-info">
        <p className="mini-score-label">{label}</p>
        <div className="mini-score-bar">
          <div className="mini-score-fill" style={{ width: `${(value / 10) * 100}%`, background: color }} />
        </div>
        <p className="mini-score-value" style={{ color }}>{value}/10</p>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div className="profile-item">
      <span className="profile-label">{label}</span>
      <span className="profile-value">{value}</span>
    </div>
  );
}
