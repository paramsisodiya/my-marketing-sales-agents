import { ILlmProvider } from './provider.interface';
import { MockProvider } from './mock.provider';
import { GeminiProvider } from './gemini.provider';
import { OllamaProvider } from './ollama.provider';

export type ProviderType = 'mock' | 'gemini' | 'ollama';

export class LlmFactory {
  private static instance: ILlmProvider | null = null;
  private static currentProviderType: ProviderType = 'mock';

  public static getProvider(type?: ProviderType): ILlmProvider {
    const selectedType = type || (process.env.AI_PROVIDER as ProviderType) || 'mock';

    if (this.instance && this.currentProviderType === selectedType) {
      return this.instance;
    }

    this.currentProviderType = selectedType;

    switch (selectedType) {
      case 'gemini':
        this.instance = new GeminiProvider(process.env.GEMINI_API_KEY);
        break;
      case 'ollama':
        this.instance = new OllamaProvider(process.env.OLLAMA_BASE_URL, process.env.OLLAMA_MODEL);
        break;
      case 'mock':
      default:
        this.instance = new MockProvider();
        break;
    }

    return this.instance;
  }

  public static setProvider(type: ProviderType, config?: { apiKey?: string; baseUrl?: string; model?: string }): ILlmProvider {
    this.currentProviderType = type;
    switch (type) {
      case 'gemini':
        this.instance = new GeminiProvider(config?.apiKey, config?.model || 'gemini-1.5-flash');
        break;
      case 'ollama':
        this.instance = new OllamaProvider(config?.baseUrl, config?.model || 'llama3:8b');
        break;
      case 'mock':
      default:
        this.instance = new MockProvider();
        break;
    }
    return this.instance;
  }

  public static getCurrentProviderType(): ProviderType {
    return this.currentProviderType;
  }
}
