#!/bin/bash

# Database initialization script for plug-chat
# This script will set up the required PostgreSQL database and tables

echo "🚀 Initializing plug-chat database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set."
    echo "Please set it in your .env.local file like:"
    echo "DATABASE_URL='postgresql://username:password@localhost:5432/plugchat'"
    exit 1
fi

# Run the SQL initialization script
echo "📊 Creating tables and indexes..."
psql "$DATABASE_URL" -f ./scripts/init-db.sql

if [ $? -eq 0 ]; then
    echo "✅ Database initialized successfully!"
    echo ""
    echo "Your chat history will now be stored in PostgreSQL."
    echo "You can start the app with: npm run dev"
else
    echo "❌ Database initialization failed."
    echo "Please check your DATABASE_URL and ensure PostgreSQL is running."
    exit 1
fi
