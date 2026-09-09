import { createRequire } from 'module'; const require = createRequire(import.meta.url);

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

// src/api/knowledge.ts
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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }
  const knowledgeService = new KnowledgeService();
  const urlObj = new URL(req.url || "/", "http://localhost");
  const slug = req.query && req.query.slug || urlObj.searchParams.get("slug");
  if (req.method === "GET") {
    if (slug) {
      const doc = knowledgeService.getDocument(slug);
      if (!doc) return sendJson(res, 404, { success: false, error: `Document ${slug} not found` });
      return sendJson(res, 200, { success: true, document: doc });
    }
    const documents = knowledgeService.getAllDocuments();
    return sendJson(res, 200, { success: true, documents, count: documents.length });
  }
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const targetSlug = slug || body.slug;
      const { content } = body;
      if (!targetSlug || content === void 0) {
        return sendJson(res, 400, { success: false, error: "slug and content are required" });
      }
      const updated = knowledgeService.updateDocument(targetSlug, content);
      return sendJson(res, 200, { success: true, document: updated });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message || "Failed to update document" });
    }
  }
  return sendJson(res, 405, { success: false, error: `Method ${req.method} not allowed` });
}
export {
  handler as default
};
