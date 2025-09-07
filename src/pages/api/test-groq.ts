import { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.GROQ_API_KEY) {
        return response.status(400).json({ error: 'GROQ_API_KEY not found' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Test models from official Groq docs (Production models)
    const testModels = [
        "llama-3.1-8b-instant",
        "llama-3.3-70b-versatile",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b"
    ];

    const results = [];

    for (const model of testModels) {
        try {
            const completion = await groq.chat.completions.create({
                model: model,
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 5
            });
            
            results.push({
                model: model,
                status: "available",
                response: completion.choices[0].message?.content || ""
            });
        } catch (error) {
            results.push({
                model: model,
                status: "error",
                error: (error as Error).message
            });
        }
    }

    response.status(200).json({
        groqApiKey: "configured",
        testResults: results,
        workingModels: results.filter(r => r.status === "available").map(r => r.model)
    });
}
