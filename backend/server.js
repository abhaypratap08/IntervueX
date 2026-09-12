
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

let mongoConnection;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    if (!mongoConnection) {
        mongoConnection = mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log("MongoDB connected successfully"))
            .catch((error) => {
                mongoConnection = null;
                throw error;
            });
    }

    await mongoConnection;
}

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error.message);
        res.status(503).json({
            success: false,
            message: "Database unavailable"
        });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Failed to connect to MongoDB:", error.message);
            process.exit(1);
        });
}

module.exports = app;
