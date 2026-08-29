import { useEffect, useRef, useState } from "react";

const COLORS = {
  excellent: { stroke: "#10b981", bg: "rgba(16,185,129,0.1)" },
  good: { stroke: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  average: { stroke: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  poor: { stroke: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

function getGrade(score) {
  if (score >= 8) return "excellent";
  if (score >= 6) return "good";
  if (score >= 4) return "average";
  return "poor";
}

export default function ScoreCircle({ score, max = 10, size = 120, label }) {
  const [animated, setAnimated] = useState(0);
  const ref = useRef(null);
  const grade = getGrade(score);
  const color = COLORS[grade];
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = animated / max;
  const offset = circumference * (1 - pct);

  useEffect(() => {
    let start = null;
    const duration = 1000;
    const from = 0;
    const to = score;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(from + (to - from) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(step);
    }

    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [score]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <div
        style={{
          position: "relative",
          marginTop: -size,
          height: size,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: size * 0.28,
            fontWeight: 700,
            color: color.stroke,
            lineHeight: 1,
          }}
        >
          {Math.round(animated * 10) / 10}
        </span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          /{max}
        </span>
      </div>
      {label && (
        <p style={{ marginTop: 8, fontSize: 13, color: "#64748b", fontWeight: 500 }}>
          {label}
        </p>
      )}
    </div>
  );
}
