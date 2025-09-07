import Anthropic from "@anthropic-ai/sdk";
import { ChatMessage, ChatProvider } from "./BaseProvider";

export class AnthropicProvider implements ChatProvider {
    name = "Anthropic";
    private client: Anthropic;
    private model: string;

    constructor(apiKey: string, model: string = "claude-3-haiku-20240307") {
        this.client = new Anthropic({ apiKey });
        this.model = model;
    }

    async sendMessage(messages: ChatMessage[]): Promise<string> {
        // Anthropic requires system messages to be separate
        const systemMessage = messages.find(msg => msg.role === 'system');
        const conversationMessages = messages.filter(msg => msg.role !== 'system');

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 1024,
            system: systemMessage?.content || "You are a helpful assistant.",
            messages: conversationMessages.map(msg => ({
                role: msg.role as "user" | "assistant",
                content: msg.content
            }))
        });

        return response.content[0].type === 'text' ? response.content[0].text : "";
    }
}
