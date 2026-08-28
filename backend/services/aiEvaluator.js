require("dotenv").config();

const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
    console.error("ERROR: GROQ_API_KEY is missing from .env");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const evaluateWithAI = async ({
    question,
    answer,
    targetRole,
    difficulty
}) => {
    try {
        const prompt = `
You are an expert technical interviewer for a placement interview.

You are evaluating a candidate who is applying for the role of:
${targetRole}

Interview difficulty:
${difficulty}

Interview Question:
${question}

Candidate Answer:
${answer}

Evaluate the candidate's answer based on:

1. Correctness
2. Relevance to the question
3. Technical depth
4. Communication quality
5. Overall interview quality

IMPORTANT:
Evaluate the actual content of the answer.
Do NOT give a high score simply because the answer is long.
Do NOT give a low score simply because the answer is short.
Consider whether the candidate demonstrates genuine understanding.

Return ONLY valid JSON.

Use exactly this structure:

{
    "score": 0,
    "correctness": 0,
    "relevance": 0,
    "technicalDepth": 0,
    "communication": 0,
    "strengths": [],
    "improvements": [],
    "feedback": ""
}

Rules:

- score must be between 0 and 10.
- correctness must be between 0 and 10.
- relevance must be between 0 and 10.
- technicalDepth must be between 0 and 10.
- communication must be between 0 and 10.
- strengths must contain 2 to 4 useful points.
- improvements must contain 1 to 3 useful points.
- feedback must be professional and specific.
- Do not use markdown.
- Do not include anything outside the JSON object.
`;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content: "You are an expert placement interview evaluator. Return only valid JSON when requested."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],

            temperature: 0.2,

            response_format: {
                type: "json_object"
            }
        });

        let text = completion.choices[0].message.content.trim();

        // Remove markdown code fences if returned
        text = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        const evaluation = JSON.parse(text);

        // Validate important fields
        if (
            typeof evaluation.score !== "number" ||
            typeof evaluation.correctness !== "number" ||
            typeof evaluation.relevance !== "number" ||
            typeof evaluation.technicalDepth !== "number" ||
            typeof evaluation.communication !== "number"
        ) {
            throw new Error("Invalid AI evaluation format");
        }

        return evaluation;

    } catch (error) {
        console.error("Groq AI evaluation error:", error.message);

        throw new Error("AI evaluation failed");
    }
};

module.exports = {
    evaluateWithAI
};