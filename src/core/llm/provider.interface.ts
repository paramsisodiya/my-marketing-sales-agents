export interface ILlmOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface ILlmProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generate(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<string>;
  generateStructured<T>(prompt: string, systemPrompt?: string, options?: ILlmOptions): Promise<T>;
}
