export type LogLevel = 'info' | 'warn' | 'error' | 'agent_step' | 'handoff' | 'approval_event';

export interface ILogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  workflowId?: string;
  taskId?: string;
  agentId?: string;
  durationMs?: number;
  message: string;
  data?: Record<string, any>;
}

export class LoggerService {
  private static instance: LoggerService;
  private logs: ILogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public log(level: LogLevel, message: string, data?: Record<string, any>, context?: { workflowId?: string; taskId?: string; agentId?: string; durationMs?: number }): ILogEntry {
    const entry: ILogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      workflowId: context?.workflowId,
      taskId: context?.taskId,
      agentId: context?.agentId,
      durationMs: context?.durationMs,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const consolePrefix = `[${entry.timestamp}] [${level.toUpperCase()}]${entry.agentId ? ` [${entry.agentId}]` : ''}:`;
    if (level === 'error') {
      console.error(consolePrefix, message, data || '');
    } else if (level === 'warn') {
      console.warn(consolePrefix, message, data || '');
    } else {
      console.log(consolePrefix, message, data ? JSON.stringify(data).slice(0, 150) : '');
    }

    return entry;
  }

  public info(message: string, data?: Record<string, any>, context?: any): ILogEntry {
    return this.log('info', message, data, context);
  }

  public warn(message: string, data?: Record<string, any>, context?: any): ILogEntry {
    return this.log('warn', message, data, context);
  }

  public error(message: string, data?: Record<string, any>, context?: any): ILogEntry {
    return this.log('error', message, data, context);
  }

  public agentStep(agentId: string, message: string, data?: Record<string, any>, context?: any): ILogEntry {
    return this.log('agent_step', message, data, { ...context, agentId });
  }

  public handoff(fromAgent: string, toAgent: string, task: string, context?: any): ILogEntry {
    return this.log('handoff', `Handoff from ${fromAgent} -> ${toAgent}: ${task}`, { fromAgent, toAgent }, context);
  }

  public getRecentLogs(limit: number = 100, filter?: { agentId?: string; workflowId?: string; level?: LogLevel }): ILogEntry[] {
    let result = this.logs;
    if (filter?.agentId) {
      result = result.filter(l => l.agentId === filter.agentId);
    }
    if (filter?.workflowId) {
      result = result.filter(l => l.workflowId === filter.workflowId);
    }
    if (filter?.level) {
      result = result.filter(l => l.level === filter.level);
    }
    return result.slice(0, limit);
  }

  public clear(): void {
    this.logs = [];
  }
}
