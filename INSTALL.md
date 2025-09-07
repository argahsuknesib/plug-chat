# Installation Guide

## Web Application

### Local Development
```bash
# Clone the repository
git clone https://github.com/argahsuknesib/plug-chat.git
cd plug-chat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

### Production Deployment
```bash
# Build for production
npm run build
npm start
```

---

## Desktop Application (Electron)

### Prerequisites
- Node.js 18+
- npm or yarn

### macOS
1. Download `plug-chat-v1.0.0.dmg` from releases
2. Open the DMG file
3. Drag Plug Chat to Applications folder
4. Launch from Applications

### Linux (Debian/Ubuntu)
```bash
# Download and install .deb package
wget https://github.com/argahsuknesib/plug-chat/releases/download/v1.0.0/plug-chat_1.0.0_amd64.deb
sudo dpkg -i plug-chat_1.0.0_amd64.deb

# Or use AppImage (portable)
wget https://github.com/argahsuknesib/plug-chat/releases/download/v1.0.0/plug-chat-1.0.0.AppImage
chmod +x plug-chat-1.0.0.AppImage
./plug-chat-1.0.0.AppImage
```

### Linux (Other Distributions)
```bash
# Download and extract tar.gz
wget https://github.com/argahsuknesib/plug-chat/releases/download/v1.0.0/plug-chat-1.0.0.tar.gz
tar -xzf plug-chat-1.0.0.tar.gz
cd plug-chat-1.0.0
./plug-chat
```

---

## Docker

### Quick Start
```bash
# Pull and run the Docker image
docker pull ghcr.io/argahsuknesib/plug-chat:latest
docker run -p 3000:3000 \
  -e GROQ_API_KEY=your_key_here \
  -e OPENAI_API_KEY=your_key_here \
  ghcr.io/argahsuknesib/plug-chat:latest
```

### Docker Compose
```yaml
version: '3.8'
services:
  plug-chat:
    image: ghcr.io/argahsuknesib/plug-chat:latest
    ports:
      - "3000:3000"
    environment:
      - GROQ_API_KEY=your_groq_key
      - OPENAI_API_KEY=your_openai_key
      - ANTHROPIC_API_KEY=your_anthropic_key
      - DATABASE_URL=postgres://user:pass@postgres:5432/plugchat
    depends_on:
      - postgres
  
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: plugchat
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## ⚙️ Configuration

### Environment Variables
Create a `.env.local` file with:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DATABASE_URL=postgres://user:pass@localhost:5432/plugchat
```

### API Keys
- **Groq**: Free at [console.groq.com](https://console.groq.com)
- **OpenAI**: Paid at [platform.openai.com](https://platform.openai.com)
- **Anthropic**: Credits at [console.anthropic.com](https://console.anthropic.com)

---
