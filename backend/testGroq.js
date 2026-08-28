require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI interview assistant."
                },
                {
                    role: "user",
                    content: "Say hello to IntervueX in one sentence."
                }
            ],

            temperature: 0.2
        });

        console.log("\nGroq response:\n");

        console.log(
            completion.choices[0].message.content
        );

    } catch (error) {
        console.error("\nGroq test failed:");
        console.error(error.message);
    }
}

testGroq();