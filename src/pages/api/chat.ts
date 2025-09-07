import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import pool from "../../database/db";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

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
        const embeddingResponse = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage.content
        });

        const embedding = embeddingResponse.data[0].embedding;

        await pool.query(
            "INSERT INTO messages (role, content, embedding) VALUES ($1, $2, $3)",
            ['user', latestMessage.content, embedding]
        );

        const recall = await pool.query(
            "SELECT content FROM messages ORDER BY embedding <--> $1 LIMIT 5",
            [embedding]
        );

        const memoryContext = recall.rows.map((row) => row.content).join("\n");

        const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "system", content: "You are a helpful assistant. Use the following context to answer the user's question." },
            { role: "system", content: memoryContext },
            ...messages.map(msg => ({ role: msg.role as "user" | "assistant", content: msg.content }))
        ];

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: chatMessages
        });

        const reply = completion.choices[0].message?.content || "";

        const replyEmbedding = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: reply
        });

        await pool.query(
            "INSERT INTO messages (role, content, embedding) VALUES ($1, $2, $3)",
            ["assistant", reply, replyEmbedding.data[0].embedding]
        );

        response.status(200).json({ reply });

    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
}
