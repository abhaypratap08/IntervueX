const Interview = require("../models/Interview");
const { evaluateWithAI } = require("../services/aiEvaluator");


// ======================================================
// START A NEW INTERVIEW
// ======================================================

const startInterview = async (req, res) => {
    try {
        const {
            userId,
            targetRole,
            interviewType,
            difficulty
        } = req.body;

        // Validate required fields
        if (!userId || !targetRole) {
            return res.status(400).json({
                success: false,
                message: "userId and targetRole are required"
            });
        }

        // Demo questions for now
        const questions = [
            {
                question: `Tell me about yourself and your experience relevant to ${targetRole}.`
            },
            {
                question: `Why do you want to work as a ${targetRole}?`
            },
            {
                question: `What are the most important skills required for a ${targetRole}?`
            },
            {
                question: "Describe a technical project you have worked on."
            },
            {
                question: "How do you approach solving a difficult technical problem?"
            }
        ];

        // Create interview
        const interview = await Interview.create({
            userId,
            targetRole,
            interviewType: interviewType || "mixed",
            difficulty: difficulty || "medium",
            questions
        });

        res.status(201).json({
            success: true,
            message: "Interview started successfully",
            interview
        });

    } catch (error) {
        console.error("Start interview error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to start interview",
            error: error.message
        });
    }
};


// ======================================================
// SUBMIT ANSWER
// ======================================================

const submitAnswer = async (req, res) => {
    try {
        const {
            interviewId,
            questionIndex,
            answer
        } = req.body;

        // Validate request
        if (
            !interviewId ||
            questionIndex === undefined ||
            !answer
        ) {
            return res.status(400).json({
                success: false,
                message: "interviewId, questionIndex and answer are required"
            });
        }

        // Find interview
        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        // Find question
        const question = interview.questions[questionIndex];

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Save answer
        question.answer = answer;

        await interview.save();

        res.json({
            success: true,
            message: "Answer submitted successfully",
            questionIndex,
            answer
        });

    } catch (error) {
        console.error("Submit answer error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit answer",
            error: error.message
        });
    }
};


// ======================================================
// AI EVALUATION
// ======================================================

const evaluateAnswer = async (req, res) => {
    try {
        const {
            interviewId,
            questionIndex
        } = req.body;

        // Validate request
        if (
            !interviewId ||
            questionIndex === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "interviewId and questionIndex are required"
            });
        }

        // Find interview
        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        // Find question
        const question = interview.questions[questionIndex];

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Check answer
        if (
            !question.answer ||
            !question.answer.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please submit an answer first"
            });
        }

        console.log(
            `Evaluating question ${questionIndex} using Groq AI...`
        );

        // Send answer to Groq
        const evaluation = await evaluateWithAI({
            question: question.question,
            answer: question.answer,
            targetRole: interview.targetRole,
            difficulty: interview.difficulty
        });

        // Save AI evaluation
        question.score = evaluation.score;

        question.correctness = evaluation.correctness;

        question.relevance = evaluation.relevance;

        question.technicalDepth =
            evaluation.technicalDepth;

        question.communication =
            evaluation.communication;

        question.strengths =
            evaluation.strengths;

        question.improvements =
            evaluation.improvements;

        question.feedback =
            evaluation.feedback;

        // Save to MongoDB
        await interview.save();

        console.log(
            `Question ${questionIndex} evaluated successfully. Score: ${evaluation.score}/10`
        );

        // Return evaluation
        res.json({
            success: true,

            message:
                "Answer evaluated successfully using AI",

            evaluation: {
                score: evaluation.score,

                correctness:
                    evaluation.correctness,

                relevance:
                    evaluation.relevance,

                technicalDepth:
                    evaluation.technicalDepth,

                communication:
                    evaluation.communication,

                strengths:
                    evaluation.strengths,

                improvements:
                    evaluation.improvements,

                feedback:
                    evaluation.feedback
            }
        });

    } catch (error) {

        console.error(
            "Evaluate answer error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to evaluate answer",

            error: error.message
        });
    }
};


// ======================================================
// COMPLETE INTERVIEW
// ======================================================

const completeInterview = async (req, res) => {
    try {

        const { interviewId } = req.body;


        // --------------------------------------------------
        // 1. Validate interview ID
        // --------------------------------------------------

        if (!interviewId) {
            return res.status(400).json({
                success: false,
                message: "interviewId is required"
            });
        }


        // --------------------------------------------------
        // 2. Find interview
        // --------------------------------------------------

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }


        // --------------------------------------------------
        // 3. Check that all questions have answers
        // --------------------------------------------------

        const unansweredQuestions =
            interview.questions.filter(
                (question) =>
                    !question.answer ||
                    !question.answer.trim()
            );


        if (unansweredQuestions.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Please answer all interview questions before completing the interview",

                unansweredQuestions:
                    unansweredQuestions.length
            });
        }


        // --------------------------------------------------
        // 4. Check that all questions are evaluated
        // --------------------------------------------------

        const unevaluatedQuestions =
            interview.questions.filter(
                (question) =>
                    question.score === undefined ||
                    question.score === null ||
                    question.score === 0
            );


        if (unevaluatedQuestions.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Please evaluate all answers before completing the interview",

                unevaluatedQuestions:
                    unevaluatedQuestions.length
            });
        }


        // --------------------------------------------------
        // 5. Calculate overall score
        // --------------------------------------------------

        const totalScore =
            interview.questions.reduce(
                (total, question) =>
                    total + question.score,
                0
            );


        const overallScore =
            totalScore /
            interview.questions.length;


        // Round to 2 decimal places

        const roundedOverallScore =
            Math.round(
                overallScore * 100
            ) / 100;


        // --------------------------------------------------
        // 6. Save overall score
        // --------------------------------------------------

        interview.overallScore =
            roundedOverallScore;


        // --------------------------------------------------
        // 7. Mark interview as completed
        // --------------------------------------------------

        interview.status = "completed";


        // --------------------------------------------------
        // 8. Save interview
        // --------------------------------------------------

        await interview.save();


        console.log(
            `Interview ${interviewId} completed. Overall score: ${roundedOverallScore}/10`
        );


        // --------------------------------------------------
        // 9. Return final interview result
        // --------------------------------------------------

        res.json({
            success: true,

            message:
                "Interview completed successfully",

            interview: {
                id: interview._id,

                targetRole:
                    interview.targetRole,

                interviewType:
                    interview.interviewType,

                difficulty:
                    interview.difficulty,

                overallScore:
                    interview.overallScore,

                status:
                    interview.status,

                questions:
                    interview.questions
            }
        });


    } catch (error) {

        console.error(
            "Complete interview error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to complete interview",

            error: error.message
        });
    }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
    startInterview,
    submitAnswer,
    evaluateAnswer,
    completeInterview
};