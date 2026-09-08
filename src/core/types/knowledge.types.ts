export interface IKnowledgeDocument {
  id: string;
  slug: string;
  title: string;
  category: 'business' | 'services' | 'sales' | 'marketing' | 'operations';
  content: string;
  summary: string;
  tags: string[];
  lastModified: string;
}

export interface IKnowledgeSearchResult {
  slug: string;
  title: string;
  matchedSections: string[];
  relevanceScore: number;
}
