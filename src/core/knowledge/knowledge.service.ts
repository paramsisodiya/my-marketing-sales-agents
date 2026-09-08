import fs from 'fs';
import path from 'path';
import { IKnowledgeDocument, IKnowledgeSearchResult } from '../types/knowledge.types';

export class KnowledgeService {
  private knowledgeDir: string;
  private cache: Map<string, IKnowledgeDocument> = new Map();

  constructor(customDir?: string) {
    this.knowledgeDir = customDir || path.resolve(process.cwd(), 'knowledge');
    this.loadAll();
  }

  public loadAll(): IKnowledgeDocument[] {
    if (!fs.existsSync(this.knowledgeDir)) {
      return [];
    }

    const files = fs.readdirSync(this.knowledgeDir).filter(f => f.endsWith('.md'));
    const documents: IKnowledgeDocument[] = [];

    for (const file of files) {
      const filePath = path.join(this.knowledgeDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const slug = file.replace(/\.md$/, '');
      const title = this.extractTitle(content, slug);
      const summary = this.extractSummary(content);
      const category = this.determineCategory(slug);

      const doc: IKnowledgeDocument = {
        id: slug,
        slug,
        title,
        category,
        content,
        summary,
        tags: [category, slug],
        lastModified: fs.statSync(filePath).mtime.toISOString(),
      };

      this.cache.set(slug, doc);
      documents.push(doc);
    }

    return documents;
  }

  public getAll(): IKnowledgeDocument[] {
    if (this.cache.size === 0) {
      this.loadAll();
    }
    return Array.from(this.cache.values());
  }

  public getBySlug(slug: string): IKnowledgeDocument | undefined {
    if (this.cache.size === 0) {
      this.loadAll();
    }
    return this.cache.get(slug);
  }

  public saveDocument(slug: string, content: string): IKnowledgeDocument {
    if (!fs.existsSync(this.knowledgeDir)) {
      fs.mkdirSync(this.knowledgeDir, { recursive: true });
    }

    const filePath = path.join(this.knowledgeDir, `${slug}.md`);
    fs.writeFileSync(filePath, content, 'utf-8');

    const title = this.extractTitle(content, slug);
    const summary = this.extractSummary(content);
    const category = this.determineCategory(slug);

    const doc: IKnowledgeDocument = {
      id: slug,
      slug,
      title,
      category,
      content,
      summary,
      tags: [category, slug],
      lastModified: new Date().toISOString(),
    };

    this.cache.set(slug, doc);
    return doc;
  }

  public search(query: string): IKnowledgeSearchResult[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: IKnowledgeSearchResult[] = [];
    for (const doc of this.getAll()) {
      const docLower = doc.content.toLowerCase();
      if (docLower.includes(q) || doc.title.toLowerCase().includes(q)) {
        const lines = doc.content.split('\n');
        const matched = lines.filter(l => l.toLowerCase().includes(q)).slice(0, 3);
        results.push({
          slug: doc.slug,
          title: doc.title,
          matchedSections: matched.length > 0 ? matched : [doc.summary],
          relevanceScore: docLower.split(q).length - 1,
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  public getContextForAgent(requiredSlugs: string[]): string {
    const sections: string[] = [];
    for (const slug of requiredSlugs) {
      const doc = this.getBySlug(slug);
      if (doc) {
        sections.push(`### [KNOWLEDGE: ${doc.title}]\n${doc.content}`);
      }
    }
    return sections.join('\n\n---\n\n');
  }

  private extractTitle(content: string, fallbackSlug: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
    return fallbackSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private extractSummary(content: string): string {
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    return lines[0]?.slice(0, 200) || 'PrimeSoul Web Solutions knowledge base document.';
  }

  private determineCategory(slug: string): 'business' | 'services' | 'sales' | 'marketing' | 'operations' {
    if (slug.includes('sales') || slug.includes('deal') || slug.includes('discovery')) return 'sales';
    if (slug.includes('marketing') || slug.includes('brand')) return 'marketing';
    if (slug.includes('services') || slug.includes('products') || slug.includes('pricing')) return 'services';
    if (slug.includes('company') || slug.includes('portfolio') || slug.includes('target-customers') || slug.includes('industries')) return 'business';
    return 'operations';
  }
}
