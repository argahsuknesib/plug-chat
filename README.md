# Plug Chat 

A multi-provider AI chat application built with Next.js and TypeScript. Chat with multiple AI models including OpenAI GPT, Groq (Llama), and Anthropic Claude - all in one interface!

## Features

- **🤖 Multi-Provider Support**: OpenAI, Groq, and Anthropic models
- **💬 Markdown Support**: Rich text formatting, code blocks, and syntax highlighting
- **🎨 Clean UI**: macOS-inspired design with beautiful typography
- **🔄 Model Switching**: Switch between AI models mid-conversation
- **🗄️ Database Integration**: PostgreSQL with vector search. 

At the moment, only conversation history is stored and limited vector search is implemented with only 5 similar items to be fetched from the pgvector database. More features to be added soon!

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/argahsuknesib/plug-chat.git
cd plug-chat
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:

```env
# Required: Get a free API key from https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Optional: Add other providers
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Database (for conversation history)
DATABASE_URL=your_postgresql_connection_string
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting API Keys

### Groq (Recommended - Free)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Generate an API key
4. Enjoy generous free tier limits!

### OpenAI (Optional)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an account and add billing
3. Generate an API key

### Anthropic (Optional)
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up and get credits
3. Generate an API key

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
