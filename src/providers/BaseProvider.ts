export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatProvider {
    name: string;
    sendMessage(messages: ChatMessage[]): Promise<string>;
}