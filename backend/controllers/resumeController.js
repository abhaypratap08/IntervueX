const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const {
    extractProfile,
    analyzeResume,
    scoreAgainstJob
} = require("../services/resumeAnalyzer");


// ============================================================
// UPLOAD RESUME
// ============================================================

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        // Extract text from PDF (buffer is in memory, no temp file)
        let rawText = "";
        if (req.file.mimetype === "application/pdf") {
            const pdfData = await pdfParse(req.file.buffer);
            rawText = pdfData.text;
        } else {
            // For .txt files
            rawText = req.file.buffer.toString("utf-8");
        }

        if (!rawText.trim()) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from the uploaded file"
            });
        }

        // Generate a unique filename (memory storage doesn't create one)
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + req.file.originalname;

        // Save to database
        const resume = await Resume.create({
            userId,
            fileName,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            rawText,
            status: "uploaded"
        });

        res.status(201).json({
            success: true,
            message: "Resume uploaded and text extracted successfully",
            resume: {
                id: resume._id,
                fileName: resume.originalName,
                fileSize: resume.fileSize,
                textLength: rawText.length,
                status: resume.status,
                createdAt: resume.createdAt
            }
        });

    } catch (error) {
        console.error("Upload error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to upload resume",
            error: error.message
        });
    }
};


// ============================================================
// ANALYZE RESUME (standalone — no job description)
// ============================================================

const analyzeResumeEndpoint = async (req, res) => {
    try {
        const { resumeId } = req.body;

        if (!resumeId) {
            return res.status(400).json({
                success: false,
                message: "resumeId is required"
            });
        }

        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        // Mark as analyzing
        resume.status = "analyzing";
        await resume.save();

        console.log(`Analyzing resume ${resumeId}...`);

        // Step 1: Extract profile
        const profile = await extractProfile(resume.rawText);
        resume.extractedProfile = profile;
        console.log("Profile extracted for:", profile.name || "unknown");

        // Step 2: Analyze resume quality
        const analysis = await analyzeResume(resume.rawText, profile);
        resume.analysis = {
            overallScore: analysis.overallScore || 0,
            atsScore: analysis.atsScore || 0,
            formattingScore: analysis.formattingScore || 0,
            contentScore: analysis.contentScore || 0,
            impactScore: analysis.impactScore || 0,
            strengths: analysis.strengths || [],
            weaknesses: analysis.weaknesses || [],
            suggestions: analysis.suggestions || [],
            feedback: analysis.feedback || ""
        };

        resume.status = "analyzed";
        await resume.save();

        console.log(`Resume ${resumeId} analyzed. Score: ${analysis.overallScore}/10`);

        res.json({
            success: true,
            message: "Resume analyzed successfully",
            resume: {
                id: resume._id,
                fileName: resume.originalName,
                extractedProfile: resume.extractedProfile,
                analysis: resume.analysis,
                status: resume.status
            }
        });

    } catch (error) {
        console.error("Analysis error:", error);

        // Mark as error
        if (req.body.resumeId) {
            Resume.findByIdAndUpdate(req.body.resumeId, { status: "error" }).catch(() => {});
        }

        res.status(500).json({
            success: false,
            message: "Failed to analyze resume",
            error: error.message
        });
    }
};


// ============================================================
// SCORE AGAINST JOB DESCRIPTION
// ============================================================

const scoreAgainstJobEndpoint = async (req, res) => {
    try {
        const { resumeId, jobTitle, jobDescription } = req.body;

        if (!resumeId || !jobTitle || !jobDescription) {
            return res.status(400).json({
                success: false,
                message: "resumeId, jobTitle, and jobDescription are required"
            });
        }

        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        // If resume hasn't been analyzed yet, extract profile first
        let profile = resume.extractedProfile;
        if (!profile || !profile.name) {
            console.log("Extracting profile first...");
            profile = await extractProfile(resume.rawText);
            resume.extractedProfile = profile;
        }

        console.log(`Scoring resume ${resumeId} against job: ${jobTitle}...`);

        // Score against job description
        const match = await scoreAgainstJob(
            resume.rawText,
            profile,
            jobTitle,
            jobDescription
        );

        resume.jobMatch = {
            jobTitle,
            jobDescription,
            matchScore: match.matchScore || 0,
            matchedSkills: match.matchedSkills || [],
            missingSkills: match.missingSkills || [],
            skillGapAnalysis: match.skillGapAnalysis || "",
            qualificationMatch: match.qualificationMatch || "",
            experienceMatch: match.experienceMatch || "",
            overallAssessment: match.overallAssessment || "",
            recommendations: match.recommendations || []
        };

        await resume.save();

        console.log(`Resume ${resumeId} scored: ${match.matchScore}% match`);

        res.json({
            success: true,
            message: "Resume scored against job description successfully",
            resume: {
                id: resume._id,
                fileName: resume.originalName,
                extractedProfile: resume.extractedProfile,
                jobMatch: resume.jobMatch
            }
        });

    } catch (error) {
        console.error("Job scoring error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to score resume against job",
            error: error.message
        });
    }
};


// ============================================================
// GET RESUME BY ID
// ============================================================

const getResume = async (req, res) => {
    try {
        const { id } = req.params;

        const resume = await Resume.findById(id);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.json({
            success: true,
            resume
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get resume",
            error: error.message
        });
    }
};


// ============================================================
// GET ALL RESUMES FOR A USER
// ============================================================

const getUserResumes = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId query parameter is required"
            });
        }

        const resumes = await Resume.find({ userId })
            .sort({ createdAt: -1 })
            .select("-rawText"); // Don't send raw text in list

        res.json({
            success: true,
            count: resumes.length,
            resumes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get resumes",
            error: error.message
        });
    }
};


// ============================================================
// DELETE RESUME
// ============================================================

const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;

        const resume = await Resume.findByIdAndDelete(id);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.json({
            success: true,
            message: "Resume deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete resume",
            error: error.message
        });
    }
};


module.exports = {
    uploadResume,
    analyzeResumeEndpoint,
    scoreAgainstJobEndpoint,
    getResume,
    getUserResumes,
    deleteResume
};
