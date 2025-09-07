import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import ChatHistory from '../components/ChatHistory';

interface Message {
    role: "user" | "assistant";
    content: string;
}

const AVAILABLE_MODELS = [
    // Groq Models (Fast & Free - Full Streaming Support)
    { id: "llama-8b", name: "🚀 Llama 3.1 8B (Fast & Free)", provider: "Groq" },
    { id: "llama-70b", name: "🔥 Llama 3.3 70B (Powerful)", provider: "Groq" },
    
    // OpenAI GPT-5 Series (Latest - SSE Streaming)
    { id: "gpt-5", name: "⭐ GPT-5 (Flagship - Best for Coding & Agents)", provider: "OpenAI" },
    { id: "gpt-5-mini", name: "⭐ GPT-5 Mini (Faster & Cheaper)", provider: "OpenAI" },
    { id: "gpt-5-nano", name: "⭐ GPT-5 Nano (Fastest - Summarization)", provider: "OpenAI" },
    
    // OpenAI GPT-4o Series (Full Streaming Support)
    { id: "gpt-4o", name: "GPT-4o (Latest Available)", provider: "OpenAI" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Cheap)", provider: "OpenAI" },
    
    // OpenAI GPT-3.5 Series (Full Streaming Support)
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo (Reliable)", provider: "OpenAI" },
    
    // OpenAI o1 Series (Advanced Reasoning)
    { id: "o1-preview", name: "🧠 GPT-o1 Preview (Advanced Reasoning)", provider: "OpenAI" },
    { id: "o1-mini", name: "🧠 GPT-o1 Mini (Fast Reasoning)", provider: "OpenAI" },
    
    // Groq Additional Models
    { id: "gpt-oss-120b", name: "GPT-OSS 120B (OpenAI on Groq)", provider: "Groq" },
    { id: "gpt-oss-20b", name: "GPT-OSS 20B (OpenAI on Groq)", provider: "Groq" },
    
    // Anthropic Claude
    { id: "claude-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
    { id: "claude-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
];

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("llama-8b");
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [conversationTitle, setConversationTitle] = useState<string>("");

    // Generate conversation title from first message
    const generateTitle = (message: string): string => {
        const words = message.trim().split(' ');
        if (words.length <= 6) {
            return message;
        }
        return words.slice(0, 6).join(' ') + '...';
    };

    // Create new conversation
    const createNewConversation = async (firstMessage: string, model: string): Promise<string | null> => {
        const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === model);
        const title = generateTitle(firstMessage);
        
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    model,
                    provider: selectedModelInfo?.provider || 'Unknown'
                })
            });

            const data = await response.json();
            if (response.ok) {
                return data.conversation.id;
            }
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
        return null;
    };

    // Load conversation messages
    const loadConversation = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/conversations/${conversationId}`);
            const data = await response.json();
            
            if (response.ok) {
                const { conversation, messages: dbMessages } = data;
                setCurrentConversationId(conversationId);
                setConversationTitle(conversation.title);
                setSelectedModel(conversation.model);
                
                // Convert database messages to our format
                const chatMessages: Message[] = dbMessages
                    .filter((msg: { role: string }) => msg.role !== 'system')
                    .map((msg: { role: string; content: string }) => ({
                        role: msg.role as "user" | "assistant",
                        content: msg.content
                    }));
                
                setMessages(chatMessages);
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    // Start new chat
    const startNewChat = () => {
        setMessages([]);
        setInput("");
        setCurrentConversationId(null);
        setConversationTitle("");
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = {
            role: "user" as const,
            content: input
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input;
        setInput("");
        setLoading(true);

        // Create conversation if this is the first message
        let conversationId = currentConversationId;
        if (!conversationId && newMessages.length === 1) {
            conversationId = await createNewConversation(currentInput, selectedModel);
            if (conversationId) {
                setCurrentConversationId(conversationId);
                setConversationTitle(generateTitle(currentInput));
            }
        }

        // Add an empty assistant message that we'll fill with streaming content
        const assistantMessage = {
            role: "assistant" as const,
            content: ""
        };
        const messagesWithAssistant = [...newMessages, assistantMessage];
        setMessages(messagesWithAssistant);

        try {
            console.log('Starting streaming request...');
            const response = await fetch("/api/chat-stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    messages: newMessages,
                    model: selectedModel,
                    conversationId: conversationId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    console.log('Stream completed');
                    break;
                }

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            console.log('Received data:', data);
                            
                            if (data.error) {
                                throw new Error(data.error);
                            }
                            
                            if (data.content) {
                                accumulatedContent += data.content;
                                
                                // Update the assistant message with the accumulated content
                                setMessages(prevMessages => {
                                    const updatedMessages = [...prevMessages];
                                    if (updatedMessages.length > 0) {
                                        updatedMessages[updatedMessages.length - 1] = {
                                            role: "assistant" as const,
                                            content: accumulatedContent
                                        };
                                    }
                                    return updatedMessages;
                                });
                            }
                            
                            if (data.done) {
                                console.log('Streaming done');
                                setLoading(false);
                                return;
                            }
                        } catch {
                            console.warn('Failed to parse SSE data:', line);
                            // Skip invalid JSON lines
                            continue;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming Error:", error);
            setMessages([...newMessages, {
                role: "assistant" as const,
                content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to the server'}`
            }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Chat History Sidebar */}
            <ChatHistory 
                onConversationSelect={loadConversation}
                onNewChat={startNewChat}
                currentConversationId={currentConversationId}
            />
            
            {/* Main Chat Area */}
            <div style={{ 
                flex: 1,
                padding: "20px", 
                maxWidth: "800px", 
                margin: "0 auto",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
                display: "flex",
                flexDirection: "column"
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <h1 style={{ 
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
                        fontWeight: "500",
                        margin: "0"
                    }}>
                        {conversationTitle || "Plug Chat"}
                    </h1>
                    
                    {currentConversationId && (
                        <button
                            onClick={startNewChat}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#007AFF",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "14px",
                                cursor: "pointer",
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
                            }}
                        >
                            New Chat
                        </button>
                    )}
                </div>
            
            <div style={{ 
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef"
            }}>
                <label style={{ 
                    display: "block",
                    marginBottom: "8px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#495057"
                }}>
                    AI Model:
                </label>
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                        fontSize: "14px",
                        backgroundColor: "white"
                    }}
                    disabled={loading}
                >
                    {AVAILABLE_MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                            {model.name} ({model.provider})
                        </option>
                    ))}
                </select>
            </div>
            
            <div style={{ 
                border: "1px solid #e1e5e9", 
                padding: "0", 
                height: "500px", 
                overflowY: "scroll", 
                marginBottom: "15px",
                borderRadius: "12px",
                backgroundColor: "#fafbfc"
            }}>
                <div style={{ padding: "15px" }}>
                {messages.map((message, index) => (
                    <div key={index} style={{ 
                        marginBottom: "15px", 
                        padding: "12px", 
                        backgroundColor: message.role === "user" ? "#e3f2fd" : "#f3e5f5",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        borderRadius: "8px",
                        border: message.role === "user" ? "1px solid #bbdefb" : "1px solid #e1bee7"
                    }}>
                        <div style={{ 
                            fontWeight: "600", 
                            marginBottom: "8px",
                            color: message.role === "user" ? "#1565c0" : "#7b1fa2",
                            fontSize: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                        }}>
                            {message.role === "user" ? "You" : "Assistant"}
                        </div>
                        <div style={{ 
                            color: "#333",
                            fontSize: "14px"
                        }}>
                            {message.role === "assistant" ? (
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code: (props) => {
                                            const { className, children, ...rest } = props;
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : '';
                                            const inline = !className?.includes('language-');
                                            
                                            return !inline ? (
                                                <SyntaxHighlighter
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    style={oneLight as any}
                                                    language={language}
                                                    PreTag="div"
                                                    customStyle={{
                                                        backgroundColor: "#f6f8fa",
                                                        border: "1px solid #d1d9e0",
                                                        borderRadius: "6px",
                                                        padding: "12px",
                                                        margin: "8px 0",
                                                        fontSize: "13px",
                                                        lineHeight: "1.4",
                                                        fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace"
                                                    }}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code style={{
                                                    backgroundColor: "#f6f8fa",
                                                    padding: "2px 4px",
                                                    borderRadius: "3px",
                                                    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                                                    fontSize: "12px",
                                                    border: "1px solid #d1d9e0"
                                                }} {...rest}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p: ({children}) => (
                                            <p style={{ margin: "8px 0", lineHeight: "1.6" }}>
                                                {children}
                                            </p>
                                        ),
                                        strong: ({children}) => (
                                            <strong style={{ fontWeight: "600", color: "#1a1a1a" }}>
                                                {children}
                                            </strong>
                                        ),
                                        em: ({children}) => (
                                            <em style={{ fontStyle: "italic", color: "#555" }}>
                                                {children}
                                            </em>
                                        ),
                                        ul: ({children}) => (
                                            <ul style={{ 
                                                margin: "8px 0", 
                                                paddingLeft: "20px",
                                                listStyleType: "disc"
                                            }}>
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({children}) => (
                                            <ol style={{ 
                                                margin: "8px 0", 
                                                paddingLeft: "20px",
                                                listStyleType: "decimal"
                                            }}>
                                                {children}
                                            </ol>
                                        ),
                                        li: ({children}) => (
                                            <li style={{ margin: "4px 0", lineHeight: "1.5" }}>
                                                {children}
                                            </li>
                                        ),
                                        h1: ({children}) => (
                                            <h1 style={{ 
                                                fontSize: "20px", 
                                                fontWeight: "600", 
                                                margin: "16px 0 8px 0",
                                                color: "#1a1a1a"
                                            }}>
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({children}) => (
                                            <h2 style={{ 
                                                fontSize: "18px", 
                                                fontWeight: "600", 
                                                margin: "14px 0 6px 0",
                                                color: "#1a1a1a"
                                            }}>
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({children}) => (
                                            <h3 style={{ 
                                                fontSize: "16px", 
                                                fontWeight: "600", 
                                                margin: "12px 0 4px 0",
                                                color: "#1a1a1a"
                                            }}>
                                                {children}
                                            </h3>
                                        ),
                                        blockquote: ({children}) => (
                                            <blockquote style={{
                                                borderLeft: "4px solid #d1d9e0",
                                                paddingLeft: "12px",
                                                margin: "8px 0",
                                                color: "#656d76",
                                                fontStyle: "italic"
                                            }}>
                                                {children}
                                            </blockquote>
                                        )
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            ) : (
                                message.content
                            )}
                        </div>
                    </div>
                ))}
                {loading && <div style={{ 
                    color: "#666",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                    fontSize: "14px"
                }}>Assistant is typing...</div>}
                </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                    style={{ 
                        flex: 1, 
                        padding: "10px", 
                        border: "1px solid #ccc", 
                        borderRadius: "4px",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                        fontSize: "14px"
                    }}
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    style={{ 
                        padding: "10px 20px", 
                        backgroundColor: "#007bff", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px",
                        cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                        opacity: loading || !input.trim() ? 0.6 : 1,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
                        fontSize: "14px",
                        fontWeight: "500"
                    }}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </div>
            
            </div>
        </div>
    );
}