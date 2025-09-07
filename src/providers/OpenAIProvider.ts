import OpenAI from "openai";
import {ChatMessage, ChatProvider} from "./BaseProvider";

export class OpenAIProvider implements ChatProvider{
    name = "OpenAI";
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string = "gpt-4o-mini") {
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }
    
    async sendMessage(messages: ChatMessage[]): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages
        });

        return completion.choices[0].message?.content || "";
    }
}
    
