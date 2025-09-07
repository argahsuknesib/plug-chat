import { NextApiRequest, NextApiResponse } from "next";
import { ProviderManager, createProviderFromEnv, ProviderType, ModelType } from "../../providers/ProviderManager";
import pool from "../../database/db";

// Initialize provider manager
const providerManager = new ProviderManager();

// Add providers based on available environment variables
function initializeProviders() {
    const providers: Array<{name: string, provider: ProviderType, model: ModelType}> = [
        // OpenAI models
        { name: "gpt-4o", provider: "openai", model: "gpt-4o" },
        { name: "gpt-4o-mini", provider: "openai", model: "gpt-4o-mini" },
        { name: "gpt-4-turbo", provider: "openai", model: "gpt-4-turbo" },
        
        // Groq models (Production - Currently Available)
        { name: "llama-8b", provider: "groq", model: "llama-3.1-8b-instant" },
        { name: "llama-70b", provider: "groq", model: "llama-3.3-70b-versatile" },
        { name: "gpt-oss-120b", provider: "groq", model: "openai/gpt-oss-120b" },
        { name: "gpt-oss-20b", provider: "groq", model: "openai/gpt-oss-20b" },
        
        // Anthropic models
        { name: "claude-sonnet", provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
        { name: "claude-haiku", provider: "anthropic", model: "claude-3-haiku-20240307" },
        { name: "claude-opus", provider: "anthropic", model: "claude-3-opus-20240229" },
    ];

    providers.forEach(({ name, provider, model }) => {
        try {
            const config = createProviderFromEnv(provider, model);
            providerManager.addProvider(name, config);
            console.log(`✓ Added provider: ${name}`);
        } catch (error) {
            console.log(`⚠ Skipped provider ${name}: ${(error as Error).message}`);
        }
    });
}

// Initialize providers once
initializeProviders();

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, model = "llama-8b" } = request.body; // Default to Llama 8B (fast and free)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return response.status(400).json({ error: 'Messages array is required' });
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    
    if (!latestMessage || latestMessage.role !== 'user') {
        return response.status(400).json({ error: 'Latest message must be from user' });
    }

    // Check if the requested model is available
    const availableProviders = providerManager.listProviders();
    if (!availableProviders.includes(model)) {
        return response.status(400).json({ 
            error: `Model '${model}' not available. Available models: ${availableProviders.join(', ')}` 
        });
    }

    try {
        // Optional: Store conversation in database (simplified version without embeddings for now)
        if (process.env.DATABASE_URL) {
            try {
                await pool.query(
                    "INSERT INTO messages (role, content) VALUES ($1, $2)",
                    ['user', latestMessage.content]
                );
            } catch (dbError) {
                console.warn("Database storage failed:", dbError);
                // Continue without database storage
            }
        }

        // Add system message for context
        const systemMessage = {
            role: "system" as const,
            content: "You are a helpful assistant. Provide clear, concise, and helpful responses."
        };

        const chatMessages = [systemMessage, ...messages];

        // Send message using the selected provider
        const reply = await providerManager.sendMessage(model, chatMessages);

        // Optional: Store assistant response in database
        if (process.env.DATABASE_URL) {
            try {
                await pool.query(
                    "INSERT INTO messages (role, content) VALUES ($1, $2)",
                    ["assistant", reply]
                );
            } catch (dbError) {
                console.warn("Database storage failed:", dbError);
                // Continue without database storage
            }
        }

        response.status(200).json({ 
            reply,
            model: model,
            provider: providerManager.getProvider(model).name
        });

    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({ 
            error: 'Internal Server Error',
            details: (error as Error).message,
            availableModels: providerManager.listProviders()
        });
    }
}

// Export function to get available models
export async function getAvailableModels() {
    return providerManager.listProviders();
}
