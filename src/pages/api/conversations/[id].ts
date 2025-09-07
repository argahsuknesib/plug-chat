import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../database/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'Database not configured' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Conversation ID is required' });
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getConversationMessages(id, res);
            case 'POST':
                return await addMessage(id, req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Messages API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Get all messages for a conversation
async function getConversationMessages(conversationId: string, res: NextApiResponse) {
    // First check if conversation exists
    const conversationResult = await pool.query(
        'SELECT * FROM conversations WHERE id = $1',
        [conversationId]
    );

    if (conversationResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get all messages for the conversation
    const messagesResult = await pool.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId]
    );

    return res.status(200).json({
        conversation: conversationResult.rows[0],
        messages: messagesResult.rows
    });
}

// Add a message to a conversation
async function addMessage(conversationId: string, req: NextApiRequest, res: NextApiResponse) {
    const { role, content } = req.body;

    if (!role || !content) {
        return res.status(400).json({ error: 'Role and content are required' });
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    // Add the message
    const result = await pool.query(
        'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
        [conversationId, role, content]
    );

    // Update conversation's updated_at timestamp
    await pool.query(
        'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
        [conversationId]
    );

    return res.status(201).json({ message: result.rows[0] });
}
