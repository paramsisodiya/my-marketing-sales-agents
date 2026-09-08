import { ILlmOptions, ILlmProvider } from './provider.interface';

export class OllamaProvider implements ILlmProvider {
  public name = 'ollama';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3:8b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  public async generate(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<string> {
    const url = `${this.baseUrl}/api/generate`;

    const body: any = {
      model: this.model,
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxTokens ?? 2048,
      }
    };

    if (options?.jsonMode) {
      body.format = 'json';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Ollama API Error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return data.response;
  }

  public async generateStructured<T>(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<T> {
    const raw = await this.generate(
      `${prompt}\n\nRespond strictly in valid JSON matching this structure:
{
  "summary": "1-2 sentence summary",
  "content": "detailed markdown deliverable",
  "facts": ["list of facts"],
  "assumptions": ["list of assumptions"],
  "recommendations": ["list of recommendations"],
  "unknowns": ["list of unknowns"],
  "requiresApproval": false
}`,
      systemPrompt,
      { ...options, jsonMode: true }
    );

    try {
      return JSON.parse(raw) as T;
    } catch {
      const cleaned = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return JSON.parse(cleaned) as T;
    }
  }
}
