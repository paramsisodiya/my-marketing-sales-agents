import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Flame,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  UserCheck,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';
import { ILead } from '../../../core/types/lead.types';
import { GrowthLeadStatus, LeadTemperature, BusinessCategory, LeadSource } from '../../../core/types/growth.types';
import { apiService } from '../../services/api.service';
import { buildWhatsAppLink } from '../../../core/growth/site.config';

interface GrowthLeadsViewProps {
  leads: ILead[];
  onRefresh: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const GrowthLeadsView: React.FC<GrowthLeadsViewProps> = ({ leads, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        lead.businessName.toLowerCase().includes(q) ||
        (lead.contactName && lead.contactName.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.website && lead.website.toLowerCase().includes(q)) ||
        lead.industry.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'ALL') {
      const currentStatus = lead.growthStatus || lead.qualificationStatus;
      if (currentStatus !== statusFilter) return false;
    }

    if (temperatureFilter !== 'ALL') {
      const temp = lead.leadTemperature || (lead.leadScore >= 80 ? 'HOT' : lead.leadScore >= 60 ? 'WARM' : lead.leadScore >= 40 ? 'COOL' : 'COLD');
      if (temp !== temperatureFilter) return false;
    }

    if (categoryFilter !== 'ALL') {
      const cat = lead.businessCategory || lead.industry;
      if (!cat.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    }

    if (sourceFilter !== 'ALL') {
      if (!lead.source.toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    }

    return true;
  });

  const handleUpdateStatus = async (leadId: string, newStatus: GrowthLeadStatus) => {
    try {
      await apiService.updateLeadStatus(leadId, newStatus, `Updated status to ${newStatus}`);
      onRefresh();
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({
          ...selectedLead,
          growthStatus: newStatus,
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLead) return;

    setIsAddingNote(true);
    try {
      const res = await apiService.addLeadNote(selectedLead.id, newNoteText.trim(), 'Team Member');
      if (res) {
        setNewNoteText('');
        onRefresh();
        // Refresh selected lead notes list
        const updatedLead = await apiService.getLeads();
        const found = updatedLead.find(l => l.id === selectedLead.id);
        if (found) setSelectedLead(found);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAddingNote(false);
    }
  };

  const getTemperatureBadge = (score: number, temp?: LeadTemperature) => {
    const t = temp || (score >= 80 ? 'HOT' : score >= 60 ? 'WARM' : score >= 40 ? 'COOL' : 'COLD');
    if (t === 'HOT') return <span className="badge-pill bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1"><Flame size={11} /> HOT ({score})</span>;
    if (t === 'WARM') return <span className="badge-pill bg-emerald-500/20 text-emerald-300 border-emerald-500/30">WARM ({score})</span>;
    if (t === 'COOL') return <span className="badge-pill bg-cyan-500/20 text-cyan-300 border-cyan-500/30">COOL ({score})</span>;
    return <span className="badge-pill bg-slate-800 text-slate-400 border-slate-700">COLD ({score})</span>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Search / Filters Bar */}
      <div className="card-panel space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-indigo-400" /> Inbound Leads CRM
            </h2>
            <p className="text-xs text-slate-400">
              {filteredLeads.length} of {leads.length} leads matching filters
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search leads by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 flex items-center gap-1 mr-1">
            <Filter size={12} /> Filters:
          </span>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONTACTED">Contacted</option>
            <option value="DEMO">Demo Scheduled</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="WON">Closed Won</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Temperature Select */}
          <select
            value={temperatureFilter}
            onChange={(e) => setTemperatureFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Temperatures</option>
            <option value="HOT">🔥 Hot (80-100)</option>
            <option value="WARM">Warm (60-79)</option>
            <option value="COOL">Cool (40-59)</option>
            <option value="COLD">Cold (0-39)</option>
          </select>

          {/* Category Select */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Categories</option>
            <option value="Restaurant">Restaurant & Cafe</option>
            <option value="School">School & Coaching</option>
            <option value="Clinic">Clinic & Healthcare</option>
            <option value="Retail">Retail Store</option>
            <option value="Real Estate">Real Estate</option>
          </select>

          {/* Source Select */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Sources</option>
            <option value="AUDIT">Website Audit</option>
            <option value="QR_MENU">QR Menu Builder</option>
            <option value="WEBSITE">Website Form</option>
            <option value="REFERRAL">Customer Referral</option>
          </select>

          {(statusFilter !== 'ALL' || temperatureFilter !== 'ALL' || categoryFilter !== 'ALL' || sourceFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setTemperatureFilter('ALL');
                setCategoryFilter('ALL');
                setSourceFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="card-panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Business & Contact</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Score / Temp</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No leads found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const currentStatus = lead.growthStatus || lead.qualificationStatus;
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {/* Business & Contact */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-bold text-white text-sm">{lead.businessName}</div>
                        <div className="text-slate-400 flex items-center gap-2 text-[11px]">
                          {lead.contactName && <span>👤 {lead.contactName}</span>}
                          {lead.phone && <span>📞 {lead.phone}</span>}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {lead.businessCategory || lead.industry}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="badge-source">{lead.source}</span>
                      </td>

                      {/* Score / Temp */}
                      <td className="py-3.5 px-4">
                        {getTemperatureBadge(lead.leadScore, lead.leadTemperature)}
                      </td>

                      {/* Requirement */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{lead.requirement || 'General Growth'}</div>
                        {lead.timeline && (
                          <div className="text-[10px] text-slate-500">⏳ {lead.timeline}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentStatus === 'WON' ? 'bg-emerald-500/20 text-emerald-300' :
                          currentStatus === 'DEMO' ? 'bg-cyan-500/20 text-cyan-300' :
                          currentStatus === 'CONTACTED' ? 'bg-indigo-500/20 text-indigo-300' :
                          currentStatus === 'QUALIFIED' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="btn-secondary text-[11px] py-1 px-2.5"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Lead Details Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 sticky top-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-source">{selectedLead.source}</span>
                  {getTemperatureBadge(selectedLead.leadScore, selectedLead.leadTemperature)}
                </div>
                <h3 className="text-xl font-bold text-white">{selectedLead.businessName}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedLead.businessCategory || selectedLead.industry} • {selectedLead.location || 'India'}
                </div>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Quick Status Action Buttons */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Pipeline Stage Actions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['NEW', 'QUALIFIED', 'CONTACTED', 'DEMO', 'PROPOSAL', 'WON', 'LOST'] as GrowthLeadStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        (selectedLead.growthStatus || selectedLead.qualificationStatus) === st
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information & WhatsApp Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Contact Information</div>
                  {selectedLead.contactName && <div>👤 Name: <strong className="text-white">{selectedLead.contactName}</strong></div>}
                  {selectedLead.phone ? (
                    <div>📞 Phone: <a href={`tel:${selectedLead.phone}`} className="text-emerald-400 hover:underline">{selectedLead.phone}</a></div>
                  ) : (
                    <div className="text-slate-500">No phone provided</div>
                  )}
                  {selectedLead.email ? (
                    <div>✉️ Email: <a href={`mailto:${selectedLead.email}`} className="text-cyan-400 hover:underline">{selectedLead.email}</a></div>
                  ) : (
                    <div className="text-slate-500">No email provided</div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Project Requirement</div>
                  <div>🎯 Needs: <strong className="text-white">{selectedLead.requirement || 'General'}</strong></div>
                  <div>⏳ Timeline: <strong className="text-white">{selectedLead.timeline || 'Unspecified'}</strong></div>
                  {selectedLead.website && (
                    <div className="truncate">
                      🌐 <a href={selectedLead.website} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{selectedLead.website}</a>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="pt-1">
                      <a
                        href={buildWhatsAppLink(`Hi ${selectedLead.contactName || selectedLead.businessName}, this is PrimeSoul regarding your digital growth enquiry.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline inline-flex items-center font-bold"
                      >
                        <MessageSquare size={12} className="mr-1" /> WhatsApp Lead Directly
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes History */}
              <div className="space-y-3">
                <div className="font-bold text-white text-sm flex items-center justify-between">
                  <span>Activity & Notes History</span>
                  <span className="text-[10px] text-slate-500">{(selectedLead.notesList || []).length} Notes</span>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add team note (e.g. Called owner, scheduled demo for 3 PM)..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="form-input text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteText.trim()}
                    className="btn-primary text-xs py-2 px-3 shrink-0"
                  >
                    Add Note
                  </button>
                </form>

                {/* Notes List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedLead.notesList || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No notes recorded yet. Add the first note above.</p>
                  ) : (
                    selectedLead.notesList?.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-indigo-400">{n.author || 'Team Member'}</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-200">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/90">
              <button
                onClick={() => setSelectedLead(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
