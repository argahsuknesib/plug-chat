# Chat History Setup Guide

This guide will help you set up persistent chat history for your Plug Chat application.

## 🚀 What's New

Your chat application now includes:
- **Persistent Chat History** - All conversations are saved to PostgreSQL
- **Conversation Management** - Organize chats by conversation with auto-generated titles
- **Sidebar Navigation** - Browse and resume previous conversations
- **Real-time Updates** - Chat history updates as you send messages
- **Clean UI** - Organized sidebar with conversation metadata

## 📋 Prerequisites

1. **PostgreSQL Database** - You need a running PostgreSQL instance
2. **Environment Variables** - DATABASE_URL must be configured

## 🛠️ Setup Instructions

### Step 1: Set up your DATABASE_URL

Add this to your `.env.local` file:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/plugchat"
```

**Examples:**
- Local PostgreSQL: `postgresql://postgres:password@localhost:5432/plugchat`
- Supabase: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`
- Railway: `postgresql://postgres:[password]@[host]:[port]/railway`
- Neon: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### Step 2: Initialize the Database

Run the initialization script:
```bash
./scripts/init-database.sh
```

Or manually run the SQL:
```bash
psql $DATABASE_URL -f ./scripts/init-db.sql
```

### Step 3: Start the Application

```bash
npm run dev
```

## 📊 Database Schema

The chat history system uses two main tables:

### `conversations`
- `id` - Unique conversation identifier
- `title` - Auto-generated from first message
- `model` - AI model used for the conversation
- `provider` - AI provider (OpenAI, Groq, Anthropic)
- `created_at` / `updated_at` - Timestamps

### `messages`
- `id` - Unique message identifier
- `conversation_id` - Links to conversation
- `role` - 'user', 'assistant', or 'system'
- `content` - Message text
- `created_at` - Timestamp
- `embedding` - Optional vector for semantic search (future feature)

## 🎯 Features

### Chat History Sidebar
- **Browse Conversations**: See all your past chats organized by date
- **Quick Preview**: View conversation title and first message
- **Model Information**: See which AI model was used
- **Message Count**: Track conversation length
- **Delete Conversations**: Remove unwanted chat history

### Conversation Management
- **Auto-Titles**: Conversations are automatically titled from the first message
- **Resume Chats**: Click any conversation to continue where you left off
- **New Chat Button**: Start fresh conversations anytime
- **Model Persistence**: Each conversation remembers its AI model

### Real-time Updates
- **Live Storage**: Messages are saved as you send them
- **Streaming Support**: Works with all streaming and non-streaming models
- **Error Handling**: Graceful fallbacks if database is unavailable

## 🚧 Troubleshooting

### Database Connection Issues
```bash
# Test your database connection
psql $DATABASE_URL -c "SELECT version();"
```

### Missing Tables
```bash
# Re-run the initialization script
./scripts/init-database.sh
```

### Environment Variable Issues
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL
```

### Chat History Not Appearing
1. Check browser console for errors
2. Verify database connection
3. Ensure tables exist: `SELECT * FROM conversations LIMIT 1;`

## 🔮 Future Enhancements

- **Semantic Search**: Find conversations by content meaning
- **Export Conversations**: Download chat history as JSON/PDF
- **Conversation Tags**: Organize chats with custom labels
- **Shared Conversations**: Collaborate on chats with others
- **Advanced Filters**: Filter by model, date, or content type

## 💡 Usage Tips

1. **Start New Chats**: Use "New Chat" for different topics
2. **Descriptive First Messages**: Better titles are auto-generated from clear first messages
3. **Model Selection**: Choose your model before starting a conversation
4. **Regular Cleanup**: Delete old conversations you no longer need

---

Your chat history is now persistent and organized! 🎉
