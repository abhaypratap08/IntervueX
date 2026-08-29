const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        // ==================================================
        // USER REFERENCE
        // ==================================================

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==================================================
        // FILE INFO
        // ==================================================

        fileName: {
            type: String,
            required: true
        },

        originalName: {
            type: String,
            required: true
        },

        mimeType: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        // ==================================================
        // PARSED CONTENT
        // ==================================================

        rawText: {
            type: String,
            default: ""
        },

        // ==================================================
        // AI-EXTRACTED PROFILE
        // ==================================================

        extractedProfile: {
            name: { type: String, default: "" },
            email: { type: String, default: "" },
            phone: { type: String, default: "" },
            summary: { type: String, default: "" },
            education: [
                {
                    institution: String,
                    degree: String,
                    field: String,
                    year: String
                }
            ],
            experience: [
                {
                    company: String,
                    role: String,
                    duration: String,
                    description: String
                }
            ],
            skills: [String],
            certifications: [String],
            projects: [
                {
                    name: String,
                    description: String,
                    technologies: [String]
                }
            ]
        },

        // ==================================================
        // STANDALONE ANALYSIS (no job description)
        // ==================================================

        analysis: {
            overallScore: { type: Number, default: 0, min: 0, max: 10 },
            atsScore: { type: Number, default: 0, min: 0, max: 10 },
            formattingScore: { type: Number, default: 0, min: 0, max: 10 },
            contentScore: { type: Number, default: 0, min: 0, max: 10 },
            impactScore: { type: Number, default: 0, min: 0, max: 10 },
            strengths: [String],
            weaknesses: [String],
            suggestions: [String],
            feedback: { type: String, default: "" }
        },

        // ==================================================
        // JOB DESCRIPTION MATCH
        // ==================================================

        jobMatch: {
            jobTitle: { type: String, default: "" },
            jobDescription: { type: String, default: "" },
            matchScore: { type: Number, default: 0, min: 0, max: 100 },
            matchedSkills: [String],
            missingSkills: [String],
            skillGapAnalysis: { type: String, default: "" },
            qualificationMatch: { type: String, default: "" },
            experienceMatch: { type: String, default: "" },
            overallAssessment: { type: String, default: "" },
            recommendations: [String]
        },

        // ==================================================
        // STATUS
        // ==================================================

        status: {
            type: String,
            enum: ["uploaded", "analyzing", "analyzed", "error"],
            default: "uploaded"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resume", resumeSchema);
