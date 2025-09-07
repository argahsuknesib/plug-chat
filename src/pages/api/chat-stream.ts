import { NextApiRequest, NextApiResponse } from 'next';
import { ProviderManager, createProviderFromEnv, ProviderType, ModelType } from '../../providers/ProviderManager';

console.log('🚀 Loading chat-stream API...');

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
console.log('Initializing providers for streaming...');
initializeProviders();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set up Server-Sent Events (SSE)
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });

    try {
        console.log(`Streaming request received for model: ${model}`);
        
        const provider = providerManager.getProvider(model || 'llama-8b');

        console.log(`Streaming with provider: ${provider.name}, model: ${model}`);

        // Check if provider supports streaming
        if (typeof provider.sendMessageStream === 'function') {
            console.log('Using native streaming');
            // Use streaming if available
            try {
                const stream = await provider.sendMessageStream(messages);
                
                for await (const chunk of stream) {
                    if (chunk) {
                        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                    }
                }
            } catch (streamError) {
                console.error('Native streaming failed:', streamError);
                // Fallback to regular method with simulated streaming
                const response = await provider.sendMessage(messages);
                
                // Simulate streaming by sending chunks of the response
                const words = response.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const chunk = i === 0 ? words[i] : ' ' + words[i];
                    res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                    
                    // Add a small delay to simulate streaming
                    await new Promise(resolve => setTimeout(resolve, 30));
                }
            }
        } else {
            console.log('Using simulated streaming');
            // Fallback to non-streaming with simulated chunks
            const response = await provider.sendMessage(messages);
            
            // Simulate streaming by sending chunks of the response
            const words = response.split(' ');
            for (let i = 0; i < words.length; i++) {
                const chunk = i === 0 ? words[i] : ' ' + words[i];
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
                
                // Add a small delay to simulate streaming
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        // Send completion signal
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        console.log('Streaming completed');
        res.end();

    } catch (error) {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to get response: ' + (error instanceof Error ? error.message : String(error)) })}\n\n`);
        res.end();
    }
}
