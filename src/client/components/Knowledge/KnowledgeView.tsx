import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Save,
  Check,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';
import { IKnowledgeDocument } from '../../../core/types/knowledge.types';
import { apiService } from '../../services/api.service';

interface KnowledgeViewProps {
  documents: IKnowledgeDocument[];
  onRefresh: () => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  documents,
  onRefresh,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(documents[0]?.slug || 'company');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const activeDoc = documents.find(d => d.slug === selectedSlug) || documents[0];

  const handleSelectDoc = (doc: IKnowledgeDocument) => {
    setSelectedSlug(doc.slug);
    setIsEditing(false);
    setEditContent(doc.content);
  };

  const handleSave = async () => {
    if (!activeDoc) return;
    setIsSaving(true);
    try {
      await apiService.saveKnowledgeDoc(activeDoc.slug, editContent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving document: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="var(--primary)" />
          <span>PrimeSoul Centralized Knowledge Base</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
          Single source of business truth. All 9 AI agents reference these documents to ensure zero hallucination of pricing, services, or claims.
        </p>
      </div>

      {/* Main Knowledge Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        {/* Document Navigation Drawer */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontSize: '12px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '560px', overflowY: 'auto' }}>
            {filteredDocs.map(doc => {
              const isSelected = activeDoc?.slug === doc.slug;
              return (
                <button
                  key={doc.slug}
                  onClick={() => handleSelectDoc(doc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <FileText size={14} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.slug}.md
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Viewer & Editor */}
        {activeDoc ? (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>{activeDoc.title}</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  File: \knowledge\{activeDoc.slug}.md • Last modified: {new Date(activeDoc.lastModified).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!isEditing ? (
                  <button
                    onClick={() => { setIsEditing(true); setEditContent(activeDoc.content); }}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit Document
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      {saveSuccess ? <Check size={14} color="var(--emerald)" /> : <Save size={14} />}
                      <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Knowledge'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                className="form-textarea"
                rows={22}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6' }}
              />
            ) : (
              <div style={{
                backgroundColor: 'rgba(11, 15, 25, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                maxHeight: '560px',
                overflowY: 'auto',
              }}>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13.5px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.65',
                  margin: 0,
                }}>
                  {activeDoc.content}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a document to inspect business rules and service frameworks.
          </div>
        )}
      </div>
    </div>
  );
};
