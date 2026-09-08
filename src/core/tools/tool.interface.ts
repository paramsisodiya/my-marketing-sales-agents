export interface IToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
}

export interface ITool {
  name: string;
  description: string;
  parameters: IToolParameter[];
  execute(args: Record<string, any>): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
}
