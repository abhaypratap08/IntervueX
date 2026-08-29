import { useEffect, useState } from "react";

function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.message);
      })
      .catch((error) => {
        console.error("Backend connection failed:", error);
        setStatus("Backend connection failed");
      });
  }, []);

  return (
    <div>
      <h1>IntervueX</h1>
      <p>AI-Powered Placement Interview Intelligence & Coaching</p>

      <p>Backend Status: {status}</p>
    </div>
  );
}

export default Home;
