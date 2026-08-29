const express = require("express");
const multer = require("multer");

const {
    uploadResume,
    analyzeResumeEndpoint,
    scoreAgainstJobEndpoint,
    getResume,
    getUserResumes,
    deleteResume
} = require("../controllers/resumeController");

const router = express.Router();

// ============================================================
// MULTER CONFIG — Memory storage (no temp files on disk)
// ============================================================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});


// ============================================================
// ROUTES
// ============================================================

// Upload resume
router.post("/upload", upload.single("resume"), uploadResume);

// Analyze resume (AI evaluation)
router.post("/analyze", analyzeResumeEndpoint);

// Score against job description
router.post("/score", scoreAgainstJobEndpoint);

// Get single resume
router.get("/:id", getResume);

// Get all resumes for a user
router.get("/", getUserResumes);

// Delete resume
router.delete("/:id", deleteResume);


module.exports = router;
