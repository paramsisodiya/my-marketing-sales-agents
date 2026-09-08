import { ILlmOptions, ILlmProvider } from './provider.interface';

export class GeminiProvider implements ILlmProvider {
  public name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model;
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generate(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const contents: any[] = [];
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will strictly follow these system instructions and output format.' }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const generationConfig: any = {
      temperature: options?.temperature ?? 0.4,
      maxOutputTokens: options?.maxTokens ?? 2048,
    };

    if (options?.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('No candidate content returned from Gemini API.');
    }

    return candidate;
  }

  public async generateStructured<T>(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<T> {
    const raw = await this.generate(
      `${prompt}\n\nYou MUST respond strictly in valid JSON matching this schema:
{
  "summary": "1-2 sentence executive summary",
  "content": "detailed markdown response",
  "facts": ["list of verified facts"],
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
      // Fallback if JSON markdown wrapping occurs
      const cleaned = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return JSON.parse(cleaned) as T;
    }
  }
}
