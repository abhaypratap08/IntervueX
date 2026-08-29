import { Link } from "react-router-dom";
import Icon from "../components/Icons";

const features = [
  {
    icon: "bot",
    title: "AI-Powered Evaluation",
    desc: "Get instant, detailed feedback on your answers using advanced AI that understands technical depth, relevance, and communication quality.",
  },
  {
    icon: "barChart",
    title: "Multi-Dimensional Scoring",
    desc: "Scores across correctness, relevance, technical depth, and communication — not just a single number.",
  },
  {
    icon: "target",
    title: "Role-Specific Practice",
    desc: "Practice interviews tailored to your target role — frontend, backend, data science, ML, and more.",
  },
  {
    icon: "lightbulb",
    title: "Actionable Feedback",
    desc: "Receive specific strengths and improvement areas after every answer to accelerate your growth.",
  },
  {
    icon: "trendingUp",
    title: "Track Progress",
    desc: "Monitor your improvement over time with detailed score history and performance trends.",
  },
  {
    icon: "zap",
    title: "Instant Results",
    desc: "No waiting — get evaluated immediately after each answer so you can learn while the context is fresh.",
  },
];  const steps = [
    {
      num: "01",
      title: "Create Your Profile",
      desc: "Sign up and set your target role and skills so the AI can tailor questions to your career goals.",
    },
    {
      num: "02",
      title: "Start an Interview",
      desc: "Choose your interview type and difficulty. The AI generates relevant questions for your role.",
    },
    {
      num: "03",
      title: "Answer & Get Evaluated",
      desc: "Type your answers and receive instant AI-powered scoring with detailed feedback on each response.",
    },
    {
      num: "04",
      title: "Review & Improve",
      desc: "Review your overall score, identify weak areas, and practice again to improve.",
    },
  ];

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon"><Icon name="target" size={22} /></span>
            <span className="brand-text">IntervueX</span>
          </Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">AI-Powered Interview Coaching</div>
        <h1 className="hero-title">
          Ace Your Next
          <br />
          <span className="hero-gradient">Placement Interview</span>
        </h1>
        <p className="hero-subtitle">
          Practice with an AI interviewer that evaluates your answers in real-time
          across multiple dimensions — technical depth, relevance, and communication.
          Get actionable feedback to land your dream role.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Practicing Free →
          </Link>
          <a href="#how-it-works" className="btn btn-outline btn-lg">
            See How It Works
          </a>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-card-dots">
                <span /><span /><span />
              </div>
              <span className="hero-card-title">AI Evaluation</span>
            </div>
            <div className="hero-card-body">
              <div className="hero-score-row">
                <div className="hero-score-item">
                  <div className="hero-score-ring green" />
                  <div>
                    <p className="hero-score-label">Correctness</p>
                    <p className="hero-score-val">8.5/10</p>
                  </div>
                </div>
                <div className="hero-score-item">
                  <div className="hero-score-ring blue" />
                  <div>
                    <p className="hero-score-label">Relevance</p>
                    <p className="hero-score-val">9.0/10</p>
                  </div>
                </div>
              </div>
              <div className="hero-score-row">
                <div className="hero-score-item">
                  <div className="hero-score-ring purple" />
                  <div>
                    <p className="hero-score-label">Technical Depth</p>
                    <p className="hero-score-val">7.5/10</p>
                  </div>
                </div>
                <div className="hero-score-item">
                  <div className="hero-score-ring amber" />
                  <div>
                    <p className="hero-score-label">Communication</p>
                    <p className="hero-score-val">8.0/10</p>
                  </div>
                </div>
              </div>
              <div className="hero-feedback">
                <span className="hero-feedback-icon"><Icon name="lightbulb" size={18} /></span>
                <p>Strong technical foundation. Consider adding more real-world examples to strengthen your answers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <div className="section-inner">
          <p className="section-tag">Features</p>
          <h2 className="section-title">Everything you need to prepare</h2>
          <p className="section-desc">
            IntervueX combines AI intelligence with interview best practices to give
            you the most effective preparation experience.
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon"><Icon name={f.icon} size={28} /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section section-dark">
        <div className="section-inner">
          <p className="section-tag">How It Works</p>
          <h2 className="section-title">From signup to interview-ready in minutes</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to ace your interview?</h2>
          <p className="cta-desc">
            Join IntervueX and start practicing with AI-powered interviews today.
            It's free to get started.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="navbar-brand">
            <span className="brand-icon"><Icon name="target" size={22} /></span>
            <span className="brand-text">IntervueX</span>
          </div>
          <p className="footer-copy">AI-Powered Placement Interview Intelligence & Coaching</p>
        </div>
      </footer>
    </div>
  );
}
