import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const AVAILABLE_MODELS = [
    { id: "llama-8b", name: "Llama 3.1 8B (Fast & Free)", provider: "Groq" },
    { id: "llama-70b", name: "Llama 3.3 70B (Powerful)", provider: "Groq" },
    { id: "gpt-oss-120b", name: "GPT-OSS 120B (OpenAI on Groq)", provider: "Groq" },
    { id: "gpt-oss-20b", name: "GPT-OSS 20B (OpenAI on Groq)", provider: "Groq" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "claude-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
    { id: "claude-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
];

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("llama-8b");
    const [currentProvider, setCurrentProvider] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, {
            role: "user" as const,
            content: input
        }];

        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat-multi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    messages: newMessages,
                    model: selectedModel
                })
            });

            const data = await response.json();

            if (data.reply) {
                setMessages([...newMessages, {
                    role: "assistant" as const,
                    content: data.reply
                }]);
                setCurrentProvider(data.provider || "");
            } else {
                // Handle error
                console.error("API Error:", data);
                setMessages([...newMessages, {
                    role: "assistant" as const,
                    content: `Error: ${data.error || 'Unknown error occurred'}`
                }]);
            }
        } catch (error) {
            console.error("Network Error:", error);
            setMessages([...newMessages, {
                role: "assistant" as const,
                content: "Error: Failed to connect to the server"
            }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ 
            padding: "20px", 
            maxWidth: "800px", 
            margin: "0 auto",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif"
        }}>
            <h1 style={{ 
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
                fontWeight: "500"
            }}>Plug Chat</h1>
            
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
                {currentProvider && (
                    <div style={{
                        marginTop: "5px",
                        fontSize: "12px",
                        color: "#6c757d",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
                    }}>
                        Currently using: {currentProvider}
                    </div>
                )}
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
                                            const inline = !className?.includes('language-');
                                            return !inline ? (
                                                <pre style={{
                                                    backgroundColor: "#f6f8fa",
                                                    border: "1px solid #d1d9e0",
                                                    borderRadius: "6px",
                                                    padding: "12px",
                                                    margin: "8px 0",
                                                    overflowX: "auto",
                                                    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
                                                    fontSize: "13px",
                                                    lineHeight: "1.4"
                                                }}>
                                                    <code className={className} {...rest}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            ) : (
                                                <code style={{
                                                    backgroundColor: "#f6f8fa",
                                                    padding: "2px 4px",
                                                    borderRadius: "3px",
                                                    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
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
    );
}