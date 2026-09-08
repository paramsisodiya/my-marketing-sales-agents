import { describe, it, expect } from 'vitest';
import { KnowledgeService } from '../src/core/knowledge/knowledge.service';

describe('PrimeSoul AI Knowledge Base Suite', () => {
  const service = new KnowledgeService();

  it('should load all 12 core knowledge documents', () => {
    const docs = service.getAll();
    expect(docs.length).toBe(12);

    const slugs = docs.map(d => d.slug);
    expect(slugs).toContain('company');
    expect(slugs).toContain('services');
    expect(slugs).toContain('products');
    expect(slugs).toContain('pricing');
    expect(slugs).toContain('portfolio');
    expect(slugs).toContain('target-customers');
    expect(slugs).toContain('industries');
    expect(slugs).toContain('brand-voice');
    expect(slugs).toContain('sales-playbook');
    expect(slugs).toContain('marketing-playbook');
    expect(slugs).toContain('proposal-guidelines');
    expect(slugs).toContain('business-rules');
  });

  it('should search knowledge base by keyword', () => {
    const results = service.search('SPIN');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe('sales-playbook');
  });

  it('should format context for agent injection', () => {
    const context = service.getContextForAgent(['company', 'services']);
    expect(context).toContain('PrimeSoul Web Solutions');
    expect(context).toContain('Website Design & Development');
  });
});
