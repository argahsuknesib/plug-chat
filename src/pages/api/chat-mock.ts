import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages } = request.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return response.status(400).json({ error: 'Messages array is required' });
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    
    if (!latestMessage || latestMessage.role !== 'user') {
        return response.status(400).json({ error: 'Latest message must be from user' });
    }

    try {
        // Simple mock response for testing
        const mockResponses = [
            "Hello! I'm a test assistant. How can I help you today?",
            "That's an interesting question! Let me think about that...",
            "I understand what you're asking. Here's my response:",
            "Thanks for your message! I'm currently running in test mode.",
            "I'm here to help! What would you like to know?"
        ];

        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        // Add a small delay to simulate thinking
        await new Promise(resolve => setTimeout(resolve, 1000));

        response.status(200).json({ reply: randomResponse });

    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
}
