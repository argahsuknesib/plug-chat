import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const providerStatus = {
        openai: !!process.env.OPENAI_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        database: !!process.env.DATABASE_URL
    };

    const availableModels = [];

    if (providerStatus.groq) {
        availableModels.push(
            { id: "llama-8b", name: "Llama 3.1 8B (Fast & Free)", provider: "Groq", status: "available" },
            { id: "llama-70b", name: "Llama 3.3 70B (Powerful)", provider: "Groq", status: "available" },
            { id: "gpt-oss-120b", name: "GPT-OSS 120B (OpenAI on Groq)", provider: "Groq", status: "available" },
            { id: "gpt-oss-20b", name: "GPT-OSS 20B (OpenAI on Groq)", provider: "Groq", status: "available" }
        );
    }

    if (providerStatus.openai) {
        availableModels.push(
            { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", status: "available" },
            { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", status: "available" }
        );
    }

    if (providerStatus.anthropic) {
        availableModels.push(
            { id: "claude-haiku", name: "Claude 3 Haiku", provider: "Anthropic", status: "available" },
            { id: "claude-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", status: "available" }
        );
    }

    response.status(200).json({
        providerStatus,
        availableModels,
        recommendations: {
            free: "llama-8b",
            fast: "llama-8b", 
            powerful: "llama-70b",
            reasoning: "claude-sonnet"
        }
    });
}
