// src/core/knowledge/knowledge.service.ts
import fs from "fs";
import path from "path";
var KnowledgeService = class {
  knowledgeDir;
  cache = /* @__PURE__ */ new Map();
  constructor(customDir) {
    this.knowledgeDir = customDir || path.resolve(process.cwd(), "knowledge");
    this.loadAll();
  }
  loadAll() {
    if (!fs.existsSync(this.knowledgeDir)) {
      return [];
    }
    const files = fs.readdirSync(this.knowledgeDir).filter((f) => f.endsWith(".md"));
    const documents = [];
    for (const file of files) {
      const filePath = path.join(this.knowledgeDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const slug = file.replace(/\.md$/, "");
      const title = this.extractTitle(content, slug);
      const summary = this.extractSummary(content);
      const category = this.determineCategory(slug);
      const doc = {
        id: slug,
        slug,
        title,
        category,
        content,
        summary,
        tags: [category, slug],
        lastModified: fs.statSync(filePath).mtime.toISOString()
      };
      this.cache.set(slug, doc);
      documents.push(doc);
    }
    return documents;
  }
  getAll() {
    if (this.cache.size === 0) {
      this.loadAll();
    }
    return Array.from(this.cache.values());
  }
  getBySlug(slug) {
    if (this.cache.size === 0) {
      this.loadAll();
    }
    return this.cache.get(slug);
  }
  saveDocument(slug, content) {
    if (!fs.existsSync(this.knowledgeDir)) {
      fs.mkdirSync(this.knowledgeDir, { recursive: true });
    }
    const filePath = path.join(this.knowledgeDir, `${slug}.md`);
    fs.writeFileSync(filePath, content, "utf-8");
    const title = this.extractTitle(content, slug);
    const summary = this.extractSummary(content);
    const category = this.determineCategory(slug);
    const doc = {
      id: slug,
      slug,
      title,
      category,
      content,
      summary,
      tags: [category, slug],
      lastModified: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.cache.set(slug, doc);
    return doc;
  }
  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const results = [];
    for (const doc of this.getAll()) {
      const docLower = doc.content.toLowerCase();
      if (docLower.includes(q) || doc.title.toLowerCase().includes(q)) {
        const lines = doc.content.split("\n");
        const matched = lines.filter((l) => l.toLowerCase().includes(q)).slice(0, 3);
        results.push({
          slug: doc.slug,
          title: doc.title,
          matchedSections: matched.length > 0 ? matched : [doc.summary],
          relevanceScore: docLower.split(q).length - 1
        });
      }
    }
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  getContextForAgent(requiredSlugs) {
    const sections = [];
    for (const slug of requiredSlugs) {
      const doc = this.getBySlug(slug);
      if (doc) {
        sections.push(`### [KNOWLEDGE: ${doc.title}]
${doc.content}`);
      }
    }
    return sections.join("\n\n---\n\n");
  }
  extractTitle(content, fallbackSlug) {
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
    return fallbackSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  extractSummary(content) {
    const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
    return lines[0]?.slice(0, 200) || "PrimeSoul Web Solutions knowledge base document.";
  }
  determineCategory(slug) {
    if (slug.includes("sales") || slug.includes("deal") || slug.includes("discovery")) return "sales";
    if (slug.includes("marketing") || slug.includes("brand")) return "marketing";
    if (slug.includes("services") || slug.includes("products") || slug.includes("pricing")) return "services";
    if (slug.includes("company") || slug.includes("portfolio") || slug.includes("target-customers") || slug.includes("industries")) return "business";
    return "operations";
  }
};

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

// api/knowledge.ts
function sendJson(res, status, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }
  const knowledgeService = new KnowledgeService();
  const logger = LoggerService.getInstance();
  if (req.method === "GET") {
    try {
      const slug = req.query?.slug;
      if (slug) {
        const doc = knowledgeService.getBySlug(slug);
        if (!doc) return sendJson(res, 404, { success: false, error: "Document not found" });
        return sendJson(res, 200, { success: true, document: doc });
      }
      const docs = knowledgeService.getAll();
      return sendJson(res, 200, { success: true, documents: docs });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }
  if (req.method === "POST") {
    try {
      const slug = req.query?.slug || req.body?.slug;
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      body = body || {};
      const { content } = body;
      if (!slug || !content) {
        return sendJson(res, 400, { success: false, error: "Slug and content required" });
      }
      const saved = knowledgeService.saveDocument(slug, content);
      logger.info(`Knowledge document updated: ${saved.title}`);
      return sendJson(res, 200, { success: true, document: saved });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }
  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
