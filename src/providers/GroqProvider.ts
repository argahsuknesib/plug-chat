import Groq from "groq-sdk";
import { ChatMessage, ChatProvider } from "./BaseProvider";

export class GroqProvider implements ChatProvider {
    name = "Groq";
    private client: Groq;
    private model: string;

    constructor(apiKey: string, model: string = "llama-3.1-70b-versatile") {
        this.client = new Groq({ apiKey });
        this.model = model;
    }

    async sendMessage(messages: ChatMessage[]): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        });

        return completion.choices[0].message?.content || "";
    }

    async* sendMessageStream(messages: ChatMessage[]): AsyncIterable<string> {
        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            stream: true
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    }
}
