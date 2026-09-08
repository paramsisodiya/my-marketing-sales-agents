import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Mail,
  FileText,
  Share2,
  Send,
  AlertCircle,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';
import { IApprovalItem, ApprovalStatus } from '../../../core/types/approval.types';
import { apiService } from '../../services/api.service';

interface ApprovalsViewProps {
  approvals: IApprovalItem[];
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvals,
  onRefresh,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('REVIEW');
  const [activeItem, setActiveItem] = useState<IApprovalItem | null>(approvals[0] || null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const filteredApprovals = selectedStatus === 'ALL'
    ? approvals
    : approvals.filter(a => a.status === selectedStatus);

  const handleSelectItem = (item: IApprovalItem) => {
    setActiveItem(item);
    setEditedContent(item.revisedContent || item.draftContent);
    setFeedbackComment('');
  };

  const handleAction = async (action: 'APPROVE' | 'REVISE' | 'REJECT') => {
    if (!activeItem) return;
    setIsProcessing(true);
    try {
      await apiService.actionApproval(
        activeItem.id,
        action,
        feedbackComment,
        editedContent !== activeItem.draftContent ? editedContent : undefined
      );
      onRefresh();
    } catch (err: any) {
      alert(`Error processing approval: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COLD_EMAIL': return <Mail size={16} color="var(--primary)" />;
      case 'PROPOSAL': return <FileText size={16} color="var(--cyan)" />;
      case 'SOCIAL_POST': return <Share2 size={16} color="var(--amber)" />;
      default: return <MessageSquare size={16} color="var(--emerald)" />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="var(--amber)" />
            <span>Human-in-the-Loop Governance & Approval Center</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>
            Enforcing zero-hallucination compliance. Outbound emails, client proposals, and public marketing require human sign-off before dispatch.
          </p>
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {['REVIEW', 'APPROVED', 'REVISED', 'REJECTED', 'ALL'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedStatus === st ? 'var(--primary)' : 'transparent',
                color: selectedStatus === st ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: selectedStatus === st ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {st === 'REVIEW' ? 'Pending Review' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Approval Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
        {/* Approvals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredApprovals.length === 0 ? (
            <div className="glass-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No items in this approval queue.
            </div>
          ) : (
            filteredApprovals.map(item => {
              const isSelected = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    borderLeft: `3px solid ${
                      item.status === 'REVIEW' ? 'var(--amber)' :
                      item.status === 'APPROVED' ? 'var(--emerald)' :
                      item.status === 'REJECTED' ? 'var(--rose)' : 'var(--primary)'
                    }`,
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getTypeIcon(item.type)}
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#ffffff' }}>{item.title}</span>
                    </div>
                    <span className={`badge ${
                      item.status === 'REVIEW' ? 'badge-amber' :
                      item.status === 'APPROVED' ? 'badge-emerald' :
                      item.status === 'REJECTED' ? 'badge-rose' : 'badge-indigo'
                    }`} style={{ fontSize: '10px' }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 8px 0', lineHeight: '1.4' }}>
                    {item.summary}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} /> {new Date(item.createdAt).toLocaleString()} • Agent: <strong>{item.agentId}</strong>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Content Review & Action Studio */}
        {activeItem ? (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-indigo">{activeItem.type}</span>
                  <h3 style={{ fontSize: '17px', margin: 0 }}>{activeItem.title}</h3>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Originating Agent: <strong>{activeItem.agentId}</strong> • Status: <strong>{activeItem.status}</strong>
                </div>
              </div>
            </div>

            {/* Editable Content Workspace */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Draft Content (Editable for refinement)
                </label>
                <span style={{ fontSize: '11px', color: 'var(--cyan)' }}>You can edit directly before approving</span>
              </div>
              <textarea
                className="form-textarea"
                rows={12}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.5' }}
              />
            </div>

            {/* Reviewer Feedback Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Reviewer Notes / Feedback (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Add revision request or compliance notes..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => handleAction('APPROVE')}
                disabled={isProcessing}
                className="btn btn-emerald"
                style={{ flex: 1, gap: '8px' }}
              >
                <CheckCircle2 size={16} />
                <span>Approve & Authorize</span>
              </button>
              <button
                onClick={() => handleAction('REVISE')}
                disabled={isProcessing}
                className="btn btn-secondary"
                style={{ gap: '8px' }}
              >
                <Edit3 size={16} />
                <span>Save Revisions</span>
              </button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={isProcessing}
                className="btn btn-rose"
                style={{ gap: '8px' }}
              >
                <XCircle size={16} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select an item from the queue to inspect draft content and authorize execution.
          </div>
        )}
      </div>
    </div>
  );
};
