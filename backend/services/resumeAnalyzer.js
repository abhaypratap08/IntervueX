require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = "openai/gpt-oss-120b";


// ============================================================
// 1. EXTRACT PROFILE FROM RESUME TEXT
// ============================================================

async function extractProfile(resumeText) {
    const prompt = `
You are an expert resume parser. Extract structured information from this resume text.

RESUME TEXT:
${truncate(resumeText, 6000)}

Return ONLY valid JSON with this exact structure:
{
    "name": "Full name of the candidate",
    "email": "Email address",
    "phone": "Phone number",
    "summary": "Professional summary or objective (1-2 sentences)",
    "education": [
        {
            "institution": "University/School name",
            "degree": "Degree type (e.g. B.Tech, BCA, MCA)",
            "field": "Field of study",
            "year": "Graduation year or duration"
        }
    ],
    "experience": [
        {
            "company": "Company name",
            "role": "Job title",
            "duration": "Duration (e.g. Jan 2023 - Present)",
            "description": "Brief description of responsibilities"
        }
    ],
    "skills": ["Skill 1", "Skill 2", "..."],
    "certifications": ["Certification 1", "..."],
    "projects": [
        {
            "name": "Project name",
            "description": "Brief description",
            "technologies": ["Tech 1", "Tech 2"]
        }
    ]
}

Rules:
- Extract information exactly as written in the resume.
- If a field is not found, use an empty string or empty array.
- Do NOT make up information.
- Do NOT include anything outside the JSON object.
`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: "You are an expert resume parser. Return only valid JSON."
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
    });

    const text = completion.choices[0].message.content.trim();
    return JSON.parse(cleanJson(text));
}


// ============================================================
// 2. ANALYZE RESUME QUALITY (standalone, no job description)
// ============================================================

async function analyzeResume(resumeText, profile) {
    const prompt = `
You are an expert resume reviewer and career coach with 15+ years of experience.

Analyze this resume and provide a comprehensive quality assessment.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

RESUME TEXT:
${truncate(resumeText, 6000)}

Evaluate the resume across these dimensions:

1. **Overall Score** (0-10): General quality of the resume
2. **ATS Score** (0-10): How well it passes Applicant Tracking Systems
3. **Formatting Score** (0-10): Layout, readability, consistency
4. **Content Score** (0-10): Quality and relevance of content
5. **Impact Score** (0-10): How well achievements are quantified and impactful

Return ONLY valid JSON:
{
    "overallScore": 0,
    "atsScore": 0,
    "formattingScore": 0,
    "contentScore": 0,
    "impactScore": 0,
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4"],
    "feedback": "Detailed 2-3 sentence overall assessment of the resume quality and readiness for job applications."
}

Rules:
- All scores must be between 0 and 10.
- strengths: list 2-4 specific positive aspects.
- weaknesses: list 1-3 specific areas that need improvement.
- suggestions: list 3-5 actionable improvement suggestions.
- feedback: professional, specific, and constructive.
- Do NOT use markdown.
- Do not include anything outside the JSON object.
`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: "You are an expert resume reviewer. Return only valid JSON when requested."
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
    });

    const text = completion.choices[0].message.content.trim();
    return JSON.parse(cleanJson(text));
}


// ============================================================
// 3. SCORE RESUME AGAINST JOB DESCRIPTION
// ============================================================

async function scoreAgainstJob(resumeText, profile, jobTitle, jobDescription) {
    const prompt = `
You are an expert recruitment analyst. Score how well this candidate's resume matches a job description.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

RESUME TEXT:
${truncate(resumeText, 6000)}

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${truncate(jobDescription, 4000)}

Provide a detailed match analysis:

Return ONLY valid JSON:
{
    "matchScore": 0,
    "matchedSkills": ["Skill that matches"],
    "missingSkills": ["Skill required but missing from resume"],
    "skillGapAnalysis": "Detailed analysis of skill gaps between resume and job requirements (2-3 sentences)",
    "qualificationMatch": "How well education and qualifications match (1-2 sentences)",
    "experienceMatch": "How well experience level and relevance match (1-2 sentences)",
    "overallAssessment": "Overall assessment of candidate fit for this role (2-3 sentences)",
    "recommendations": ["Specific recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Rules:
- matchScore must be between 0 and 100 (percentage).
- matchedSkills: list actual skills from the resume that match the job requirements.
- missingSkills: list skills required by the job but absent from the resume.
- recommendations: list 3-5 specific actions the candidate can take to improve their match.
- Be honest and specific — do not inflate scores.
- Do NOT use markdown.
- Do not include anything outside the JSON object.
`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: "system",
                content: "You are an expert recruitment analyst. Return only valid JSON when requested."
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
    });

    const text = completion.choices[0].message.content.trim();
    return JSON.parse(cleanJson(text));
}


// ============================================================
// HELPERS
// ============================================================

function truncate(text, maxLen) {
    if (!text) return "";
    return text.length > maxLen ? text.substring(0, maxLen) + "\n...[truncated]" : text;
}

function cleanJson(text) {
    return text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
}


module.exports = {
    extractProfile,
    analyzeResume,
    scoreAgainstJob
};
