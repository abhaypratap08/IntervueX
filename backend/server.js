const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const { healthCheck } = require("./controllers/healthController");
const interviewRoutes = require("./routes/interviewRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", healthCheck);
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/resumes", resumeRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "IntervueX Backend is running"
    });
});

async function startServer() {
    let mongoUri = process.env.MONGO_URI;

    // -------------------------------------------------------
    // 1. Try connecting to the configured MONGO_URI
    // -------------------------------------------------------
    if (mongoUri) {
        try {
            await mongoose.connect(mongoUri);
            console.log("MongoDB connected successfully");
        } catch (error) {
            console.warn("Could not connect to configured MongoDB:", error.message);
            console.warn("Falling back to in-memory MongoDB...\n");
            mongoUri = null;
        }
    }

    // -------------------------------------------------------
    // 2. If no URI or connection failed, start in-memory MongoDB
    // -------------------------------------------------------
    if (!mongoUri) {
        try {
            const { MongoMemoryServer } = require("mongodb-memory-server");
            const mongod = await MongoMemoryServer.create();
            const memUri = mongod.getUri();
            await mongoose.connect(memUri);
            console.log("Using in-memory MongoDB (no system MongoDB required)");
            console.log("Data will NOT persist between restarts.\n");
        } catch (memError) {
            console.error("Failed to start in-memory MongoDB:", memError.message);
            console.error("\nInstall MongoDB or set MONGO_URI in .env to fix this.");
            console.error("  npm install -g mongodb-memory-server  (already installed as devDep)");
            console.error("  OR install MongoDB: https://www.mongodb.com/docs/manual/installation/\n");
            process.exit(1);
        }
    }

    // -------------------------------------------------------
    // 3. Start Express
    // -------------------------------------------------------
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
