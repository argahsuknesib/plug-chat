import { ChatProvider, ChatMessage } from "./BaseProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { GroqProvider } from "./GroqProvider";
import { AnthropicProvider } from "./AnthropicProvider";

export type ProviderType = 'openai' | 'groq' | 'anthropic';
export type ModelType = 
    // OpenAI GPT-5 series (Latest Flagship Models - Requires Verification)
    | 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano'
    // OpenAI GPT-4o series (Available)
    | 'gpt-4o' | 'gpt-4o-mini'
    // OpenAI GPT-3.5 (Available)
    | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0125' | 'gpt-3.5-turbo-1106'
    // OpenAI o1 series (reasoning models - May require verification)
    | 'o1-preview' | 'o1-mini'
    // Groq models (Production - Currently Available)
    | 'llama-3.1-8b-instant' | 'llama-3.3-70b-versatile'
    | 'openai/gpt-oss-120b' | 'openai/gpt-oss-20b'
    // Anthropic models
    | 'claude-3-5-sonnet-20241022' | 'claude-3-haiku-20240307' | 'claude-3-opus-20240229';

interface ProviderConfig {
    provider: ProviderType;
    model: ModelType;
    apiKey: string;
}

export class ProviderManager {
    private providers: Map<string, ChatProvider> = new Map();

    constructor() {}

    addProvider(name: string, config: ProviderConfig): void {
        let provider: ChatProvider;

        switch (config.provider) {
            case 'openai':
                provider = new OpenAIProvider(config.apiKey, config.model);
                break;
            
            case 'groq':
                provider = new GroqProvider(config.apiKey, config.model);
                break;
            
            case 'anthropic':
                provider = new AnthropicProvider(config.apiKey, config.model);
                break;
            
            default:
                throw new Error(`Unsupported provider: ${config.provider}`);
        }

        this.providers.set(name, provider);
    }

    getProvider(name: string): ChatProvider {
        const provider = this.providers.get(name);
        if (!provider) {
            throw new Error(`Provider not found: ${name}`);
        }
        return provider;
    }

    listProviders(): string[] {
        return Array.from(this.providers.keys());
    }

    async sendMessage(providerName: string, messages: ChatMessage[]): Promise<string> {
        const provider = this.getProvider(providerName);
        return await provider.sendMessage(messages);
    }
}

// Utility function to create provider from environment variables
export function createProviderFromEnv(
    provider: ProviderType, 
    model: ModelType
): ProviderConfig {
    let apiKey: string;
    
    switch (provider) {
        case 'openai':
            apiKey = process.env.OPENAI_API_KEY || '';
            break;
        case 'groq':
            apiKey = process.env.GROQ_API_KEY || '';
            break;
        case 'anthropic':
            apiKey = process.env.ANTHROPIC_API_KEY || '';
            break;
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!apiKey) {
        throw new Error(`API key not found for provider: ${provider}`);
    }

    return { provider, model, apiKey };
}
