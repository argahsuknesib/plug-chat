import React, { useState, useEffect } from 'react';

interface Conversation {
    id: string;
    title: string;
    model: string;
    provider: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    first_message: string;
}

interface ChatHistoryProps {
    onConversationSelect: (conversationId: string) => void;
    onNewChat: () => void;
    currentConversationId?: string | null;
}

export default function ChatHistory({ 
    onConversationSelect, 
    onNewChat, 
    currentConversationId 
}: ChatHistoryProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // macOS system font stack to match main app
    const systemFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/conversations');
            const data = await response.json();
            
            if (response.ok) {
                setConversations(data.conversations || []);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch conversations');
            }
        } catch (err) {
            setError('Failed to fetch conversations');
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this conversation?')) {
            return;
        }

        try {
            const response = await fetch(`/api/conversations?id=${conversationId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setConversations(prev => prev.filter(c => c.id !== conversationId));
                
                // If we deleted the current conversation, start a new chat
                if (currentConversationId === conversationId) {
                    onNewChat();
                }
            } else {
                alert('Failed to delete conversation');
            }
        } catch (err) {
            console.error('Error deleting conversation:', err);
            alert('Failed to delete conversation');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const truncateText = (text: string, maxLength: number = 60) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div style={{ 
                width: "320px", 
                backgroundColor: "#f9fafb", 
                borderRight: "1px solid #e5e7eb", 
                padding: "16px",
                fontFamily: systemFont
            }}>
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "16px" 
                }}>
                    <h2 style={{ 
                        fontSize: "18px", 
                        fontWeight: "600", 
                        color: "#111827", 
                        margin: "0" 
                    }}>
                        Chat History
                    </h2>
                    <button 
                        onClick={onNewChat}
                        style={{
                            padding: "6px 12px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "14px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: systemFont
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                    >
                        New Chat
                    </button>
                </div>
                <div style={{ marginTop: "8px" }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} style={{ 
                            marginBottom: "8px",
                            height: "64px", 
                            backgroundColor: "#e5e7eb", 
                            borderRadius: "8px",
                            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            width: "320px", 
            backgroundColor: "#f9fafb", 
            borderRight: "1px solid #e5e7eb", 
            padding: "16px", 
            display: "flex", 
            flexDirection: "column", 
            height: "100%",
            fontFamily: systemFont
        }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "16px" 
            }}>
                <h2 style={{ 
                    fontSize: "18px", 
                    fontWeight: "600", 
                    color: "#111827", 
                    margin: "0" 
                }}>
                    Chat History
                </h2>
                <button 
                    onClick={onNewChat}
                    style={{
                        padding: "6px 12px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "14px",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: systemFont,
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                >
                    New Chat
                </button>
            </div>

            {error && (
                <div style={{
                    marginBottom: "16px",
                    padding: "12px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "14px",
                    fontFamily: systemFont
                }}>
                    {error}
                    <button 
                        onClick={fetchConversations}
                        style={{
                            marginLeft: "8px",
                            textDecoration: "underline",
                            background: "none",
                            border: "none",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontFamily: systemFont
                        }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = "none"}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = "underline"}
                    >
                        Retry
                    </button>
                </div>
            )}

            <div style={{ 
                flex: "1", 
                overflowY: "auto", 
                marginTop: "8px" 
            }}>
                {conversations.length === 0 ? (
                    <div style={{ 
                        textAlign: "center", 
                        color: "#6b7280", 
                        marginTop: "32px" 
                    }}>
                        <p style={{ 
                            fontSize: "14px", 
                            margin: "0 0 4px 0",
                            fontFamily: systemFont
                        }}>
                            No conversations yet.
                        </p>
                        <p style={{ 
                            fontSize: "12px", 
                            margin: "0",
                            fontFamily: systemFont
                        }}>
                            Start a new chat to begin!
                        </p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => onConversationSelect(conversation.id)}
                            style={{
                                cursor: "pointer",
                                padding: "12px",
                                borderRadius: "8px",
                                border: currentConversationId === conversation.id 
                                    ? "1px solid #dbeafe" 
                                    : "1px solid #e5e7eb",
                                backgroundColor: currentConversationId === conversation.id 
                                    ? "#eff6ff" 
                                    : "white",
                                marginBottom: "8px",
                                transition: "all 0.2s",
                                fontFamily: systemFont,
                                position: "relative"
                            }}
                            onMouseOver={(e) => {
                                if (currentConversationId !== conversation.id) {
                                    e.currentTarget.style.backgroundColor = "#f9fafb";
                                    e.currentTarget.style.borderColor = "#d1d5db";
                                }
                                // Show delete button on hover
                                const deleteBtn = e.currentTarget.querySelector('button[title="Delete conversation"]') as HTMLElement;
                                if (deleteBtn) {
                                    deleteBtn.style.opacity = "1";
                                }
                            }}
                            onMouseOut={(e) => {
                                if (currentConversationId !== conversation.id) {
                                    e.currentTarget.style.backgroundColor = "white";
                                    e.currentTarget.style.borderColor = "#e5e7eb";
                                }
                                // Hide delete button when not hovering
                                const deleteBtn = e.currentTarget.querySelector('button[title="Delete conversation"]') as HTMLElement;
                                if (deleteBtn) {
                                    deleteBtn.style.opacity = "0";
                                }
                            }}
                        >
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "flex-start" 
                            }}>
                                <div style={{ 
                                    flex: "1", 
                                    minWidth: "0" 
                                }}>
                                    <h3 style={{ 
                                        fontWeight: "500", 
                                        color: "#111827", 
                                        fontSize: "14px", 
                                        margin: "0",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        fontFamily: systemFont
                                    }}>
                                        {conversation.title}
                                    </h3>
                                    <p style={{ 
                                        fontSize: "12px", 
                                        color: "#6b7280", 
                                        margin: "4px 0 0 0",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        lineHeight: "1.3",
                                        fontFamily: systemFont
                                    }}>
                                        {truncateText(conversation.first_message || 'No messages yet')}
                                    </p>
                                    <div style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "space-between", 
                                        marginTop: "8px" 
                                    }}>
                                        <span style={{ 
                                            fontSize: "12px", 
                                            color: "#9ca3af",
                                            fontFamily: systemFont
                                        }}>
                                            {formatDate(conversation.updated_at)}
                                        </span>
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: "8px" 
                                        }}>
                                            <span style={{ 
                                                fontSize: "12px", 
                                                backgroundColor: "#f3f4f6", 
                                                color: "#4b5563", 
                                                padding: "2px 8px", 
                                                borderRadius: "4px",
                                                fontFamily: systemFont
                                            }}>
                                                {conversation.provider}
                                            </span>
                                            <span style={{ 
                                                fontSize: "12px", 
                                                color: "#9ca3af",
                                                fontFamily: systemFont
                                            }}>
                                                {conversation.message_count} msgs
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => deleteConversation(conversation.id, e)}
                                    style={{
                                        opacity: "0",
                                        marginLeft: "8px",
                                        padding: "4px",
                                        backgroundColor: "transparent",
                                        border: "none",
                                        color: "#9ca3af",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        borderRadius: "4px"
                                    }}
                                    title="Delete conversation"
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.color = "#dc2626";
                                        e.currentTarget.style.backgroundColor = "#fef2f2";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.color = "#9ca3af";
                                        e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                >
                                    <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {conversations.length > 0 && (
                <div style={{ 
                    marginTop: "16px", 
                    paddingTop: "16px", 
                    borderTop: "1px solid #e5e7eb" 
                }}>
                    <button
                        onClick={fetchConversations}
                        style={{
                            width: "100%",
                            fontSize: "12px",
                            color: "#6b7280",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "color 0.2s",
                            fontFamily: systemFont
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = "#374151"}
                        onMouseOut={(e) => e.currentTarget.style.color = "#6b7280"}
                    >
                        Refresh
                    </button>
                </div>
            )}
        </div>
    );
}
