// src/core/observability/logger.service.ts
var LoggerService = class _LoggerService {
  static instance;
  logs = [];
  maxLogs = 1e3;
  constructor() {
  }
  static getInstance() {
    if (!_LoggerService.instance) {
      _LoggerService.instance = new _LoggerService();
    }
    return _LoggerService.instance;
  }
  log(level, message, data, context) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      data,
      workflowId: context?.workflowId,
      taskId: context?.taskId,
      agentId: context?.agentId,
      durationMs: context?.durationMs
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    const consolePrefix = `[${entry.timestamp}] [${level.toUpperCase()}]${entry.agentId ? ` [${entry.agentId}]` : ""}:`;
    if (level === "error") {
      console.error(consolePrefix, message, data || "");
    } else if (level === "warn") {
      console.warn(consolePrefix, message, data || "");
    } else {
      console.log(consolePrefix, message, data ? JSON.stringify(data).slice(0, 150) : "");
    }
    return entry;
  }
  info(message, data, context) {
    return this.log("info", message, data, context);
  }
  warn(message, data, context) {
    return this.log("warn", message, data, context);
  }
  error(message, data, context) {
    return this.log("error", message, data, context);
  }
  agentStep(agentId, message, data, context) {
    return this.log("agent_step", message, data, { ...context, agentId });
  }
  handoff(fromAgent, toAgent, task, context) {
    return this.log("handoff", `Handoff from ${fromAgent} -> ${toAgent}: ${task}`, { fromAgent, toAgent }, context);
  }
  getRecentLogs(limit = 100, filter) {
    let result = this.logs;
    if (filter?.agentId) {
      result = result.filter((l) => l.agentId === filter.agentId);
    }
    if (filter?.workflowId) {
      result = result.filter((l) => l.workflowId === filter.workflowId);
    }
    if (filter?.level) {
      result = result.filter((l) => l.level === filter.level);
    }
    return result.slice(0, limit);
  }
  clear() {
    this.logs = [];
  }
};

// api/logs.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const logger = LoggerService.getInstance();
  if (req.method === "GET") {
    try {
      const limit = req.query?.limit ? Number(req.query.limit) : 100;
      const agentId = req.query?.agentId;
      const workflowId = req.query?.workflowId;
      const level = req.query?.level;
      const logs = logger.getRecentLogs(limit, { agentId, workflowId, level });
      return res.status(200).json({ success: true, logs });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
