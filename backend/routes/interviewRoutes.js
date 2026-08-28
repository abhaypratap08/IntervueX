const express = require("express");

const {
    startInterview,
    submitAnswer,
    evaluateAnswer,
    completeInterview
} = require("../controllers/interviewController");

const router = express.Router();


// Test route
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Interview routes are working"
    });
});


// Interview routes
router.post("/start", startInterview);

router.post("/answer", submitAnswer);

router.post("/evaluate", evaluateAnswer);

router.post("/complete", completeInterview);


module.exports = router;