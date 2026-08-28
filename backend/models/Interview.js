const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        // ==================================================
        // USER INFORMATION
        // ==================================================

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ==================================================
        // INTERVIEW INFORMATION
        // ==================================================

        targetRole: {
            type: String,
            required: true,
            trim: true
        },

        interviewType: {
            type: String,
            enum: ["technical", "hr", "behavioral", "mixed"],
            default: "mixed"
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium"
        },


        // ==================================================
        // INTERVIEW QUESTIONS
        // ==================================================

        questions: [
            {
                // Question asked to candidate
                question: {
                    type: String,
                    required: true
                },

                // Candidate's answer
                answer: {
                    type: String,
                    default: ""
                },

                // Overall AI score
                score: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 10
                },

                // AI evaluation dimensions
                correctness: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 10
                },

                relevance: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 10
                },

                technicalDepth: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 10
                },

                communication: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 10
                },

                // Positive points identified by AI
                strengths: {
                    type: [String],
                    default: []
                },

                // Areas where candidate can improve
                improvements: {
                    type: [String],
                    default: []
                },

                // Detailed AI feedback
                feedback: {
                    type: String,
                    default: ""
                }
            }
        ],


        // ==================================================
        // OVERALL INTERVIEW SCORE
        // ==================================================

        overallScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 10
        },


        // ==================================================
        // INTERVIEW STATUS
        // ==================================================

        status: {
            type: String,
            enum: ["started", "completed"],
            default: "started"
        }
    },

    {
        timestamps: true
    }
);


// ======================================================
// EXPORT MODEL
// ======================================================

module.exports = mongoose.model("Interview", interviewSchema);