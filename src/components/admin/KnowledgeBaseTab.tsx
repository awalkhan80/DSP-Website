import React, { useState, useEffect, useRef } from 'react';
import { getStoredSession } from '../../utils/adminAuth';

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  category: 'tour' | 'pricing' | 'faq' | 'policy' | 'company' | 'general';
  content: string;
  tags: string[];
  isActive: boolean;
  updatedAt: string;
}

export const KnowledgeBaseTab: React.FC = () => {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryCategory, setEntryCategory] = useState<'tour' | 'pricing' | 'faq' | 'policy' | 'company' | 'general'>('tour');
  const [entryContent, setEntryContent] = useState('');
  const [entryTags, setEntryTags] = useState('');
  const [entryIsActive, setEntryIsActive] = useState(true);
  const [savingEntry, setSavingEntry] = useState(false);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulator State
  const [testQuery, setTestQuery] = useState<string>('What is the price for Evening Desert Safari for 2 adults?');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  const session = getStoredSession();
  const getAuthHeaders = (): Record<string, string> => {
    const token = session?.token || 'phx_token_admin_awalgsm';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    };
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge-base/entries', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.entries)) {
        setEntries(data.entries);
      }
    } catch (err: any) {
      console.error('Failed to load knowledge base entries:', err);
      setStatusMessage({ text: 'Failed to fetch knowledge base from server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEntry(null);
    setEntryTitle('');
    setEntryCategory('tour');
    setEntryContent('');
    setEntryTags('');
    setEntryIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: KnowledgeBaseEntry) => {
    setEditingEntry(entry);
    setEntryTitle(entry.title);
    setEntryCategory(entry.category || 'general');
    setEntryContent(entry.content);
    setEntryTags(Array.isArray(entry.tags) ? entry.tags.join(', ') : '');
    setEntryIsActive(entry.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryContent.trim()) {
      alert('Please fill out both Title and Content fields.');
      return;
    }

    setSavingEntry(true);
    setStatusMessage(null);

    const payload = {
      title: entryTitle.trim(),
      category: entryCategory,
      content: entryContent.trim(),
      tags: entryTags.split(',').map((t) => t.trim()).filter(Boolean),
      isActive: entryIsActive,
    };

    try {
      let res: Response;
      if (editingEntry) {
        res = await fetch(`/api/admin/knowledge-base/entries/${editingEntry.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/knowledge-base/entries', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.ok) {
        setStatusMessage({
          text: editingEntry ? 'Entry updated and live on AI Concierge!' : 'Entry created and available immediately!',
          type: 'success',
        });
        setIsModalOpen(false);
        fetchEntries();
      } else {
        setStatusMessage({ text: data.error || 'Failed to save entry', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Network error: ${err.message}`, type: 'error' });
    } finally {
      setSavingEntry(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge base entry?')) return;
    try {
      const res = await fetch(`/api/admin/knowledge-base/entries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMessage({ text: 'Knowledge base entry deleted', type: 'success' });
        fetchEntries();
      } else {
        setStatusMessage({ text: data.error || 'Failed to delete entry', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Network error: ${err.message}`, type: 'error' });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/knowledge-base/entries/${id}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok) {
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isActive: data.entry.isActive } : e))
        );
      }
    } catch (err) {
      console.error('Failed to toggle entry status:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const text = await file.text();
      const trimmed = text ? text.trim() : '';

      if (!trimmed) {
        throw new Error(`The file "${file.name}" is empty.`);
      }

      if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
        throw new Error(`The file "${file.name}" contains HTML web markup instead of valid JSON or text configuration.`);
      }

      const isJson = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';

      if (isJson) {
        try {
          JSON.parse(trimmed);
        } catch (jsonErr: any) {
          throw new Error(`Invalid JSON syntax in "${file.name}": ${jsonErr.message}`);
        }
      }

      const res = await fetch('/api/admin/knowledge_base/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content: trimmed,
          format: isJson ? 'json' : 'text',
          fileName: file.name,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await res.text();
        throw new Error(
          `Server returned non-JSON response (${res.status}): ${
            rawText.startsWith('<') ? 'HTML page returned by server.' : rawText.substring(0, 100)
          }`
        );
      }

      const data = await res.json();
      if (data.ok) {
        setUploadSuccess(data.message || `Successfully imported entries from ${file.name}!`);
        fetchEntries();
      } else {
        setUploadError(data.error || 'Upload validation failed.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error reading or uploading file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadJson = async () => {
    try {
      const token = session?.token || 'phx_token_admin_awalgsm';
      const res = await fetch(`/api/admin/knowledge-base/export?token=${encodeURIComponent(token)}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Export failed (${res.status}): ${text.startsWith('<') ? 'Server error' : text.substring(0, 100)}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'phoenix_knowledge_base.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleTestSimulator = async () => {
    if (!testQuery.trim()) return;
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testQuery }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (e: any) {
      setSimResult({ ok: false, error: e.message });
    } finally {
      setSimulating(false);
    }
  };

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      (Array.isArray(e.tags) && e.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesCat && matchesSearch;
  });

  const activeCount = entries.filter((e) => e.isActive !== false).length;
  const inactiveCount = entries.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-amber-400 text-[22px]">psychology</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Live Verified Knowledge Base
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activeCount} Active Entries
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">Knowledge Base &amp; Tour Details</h2>
          <p className="text-xs text-stone-300 max-w-2xl mt-1 leading-relaxed">
            Create, edit, and manage tour prices, vehicle capacities, camp menus, safety rules, and booking policies. Changes update the AI Concierge immediately without requiring a code deployment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export JSON</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>{uploading ? 'Validating...' : 'Upload JSON / Text'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Status Banners */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {statusMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-stone-400 hover:text-stone-600"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
            <span>{uploadSuccess}</span>
          </div>
          <button type="button" onClick={() => setUploadSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 rounded-xl border border-red-300 bg-red-50 text-red-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-red-600">report</span>
            <span>{uploadError}</span>
          </div>
          <button type="button" onClick={() => setUploadError(null)} className="text-red-700 hover:text-red-900">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Interactive AI Simulator Card */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#EA580C] text-[20px]">smart_toy</span>
            <h3 className="text-sm font-bold text-stone-900">Live AI Concierge Grounding &amp; Math Simulator</h3>
          </div>
          <span className="text-[11px] text-stone-500">Test how the agent answers using active knowledge entries</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. What is the price for Can-Am 2-seater buggy for 30 mins?"
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#EA580C] outline-none"
          />
          <button
            type="button"
            onClick={handleTestSimulator}
            disabled={simulating}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-[#EA580C] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {simulating ? 'Testing...' : 'Simulate Response'}
          </button>
        </div>

        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
          <span>Quick Tests:</span>
          {[
            'Price for 2 adults evening safari',
            'Is dune bashing safe for pregnant women?',
            'Can-Am 2-seater buggy price for 30 mins',
            'Check burj khalifa availability for tomorrow',
            'What is the payment policy for desert safaris?',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setTestQuery(chip)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 cursor-pointer transition-colors text-[10px]"
            >
              {chip}
            </button>
          ))}
        </div>

        {simResult && (
          <div className="mt-3 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="font-bold text-stone-800 flex items-center justify-between">
              <span>Agent Output:</span>
              <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-mono text-[10px]">
                Engine: {simResult.model || 'Knowledge Base Grounded'}
              </span>
            </div>
            <p className="whitespace-pre-line text-stone-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200">
              {simResult.reply}
            </p>
            {simResult.actionCard && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-center justify-between">
                <div>
                  <strong>Structured Quote Card:</strong> {simResult.actionCard.data?.tour || 'Tour'} —{' '}
                  <span className="font-bold text-[#EA580C]">AED {simResult.actionCard.data?.total_aed}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {simResult.actionCard.data?.payment_policy === 'advance_only' ? 'Advance Payment' : '100% Pay on Arrival'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Entries' },
            { id: 'tour', label: 'Tours & Pricing' },
            { id: 'policy', label: 'Booking Policies' },
            { id: 'faq', label: 'FAQs' },
            { id: 'company', label: 'Company Info' },
            { id: 'general', label: 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-stone-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search entries & tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Entries Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500 space-y-2">
          <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
          <p>Loading knowledge base entries...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200 space-y-2">
          <span className="material-symbols-outlined text-stone-300 text-[40px]">menu_book</span>
          <p className="font-bold text-sm text-stone-700">No knowledge base entries match your filter</p>
          <p className="text-stone-500 text-[11px]">Click "Add Entry" to create new verified guidelines or upload a JSON file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const isCatTour = entry.category === 'tour' || entry.category === 'pricing';
            const isCatPolicy = entry.category === 'policy';
            const isCatFaq = entry.category === 'faq';

            return (
              <div
                key={entry.id}
                className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-xs ${
                  entry.isActive !== false ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50/50'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isCatTour
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : isCatPolicy
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : isCatFaq
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}
                      >
                        {entry.category}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 font-serif">{entry.title}</h4>
                    </div>

                    {/* Active Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(entry.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        entry.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300 border border-stone-300'
                      }`}
                      title={entry.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${entry.isActive !== false ? 'bg-emerald-600' : 'bg-stone-400'}`}></span>
                      <span>{entry.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50/80 p-3 rounded-xl border border-stone-100">
                    {entry.content}
                  </p>

                  {/* Tags */}
                  {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {entry.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] text-stone-400 mt-3">
                  <span>Updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(entry)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingEntry ? 'Edit Knowledge Base Entry' : 'Create Knowledge Base Entry'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Entry Title</label>
                <input
                  type="text"
                  placeholder="e.g. Evening Safari Prices & Inclusions"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 outline-none text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Category</label>
                  <select
                    value={entryCategory}
                    onChange={(e) => setEntryCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 outline-none bg-white text-xs"
                  >
                    <option value="tour">Tour &amp; Pricing</option>
                    <option value="policy">Booking Policy</option>
                    <option value="faq">FAQ</option>
                    <option value="company">Company Info</option>
                    <option value="pricing">Special Rates</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Active State</label>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entryIsActive}
                      onChange={(e) => setEntryIsActive(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-stone-700">
                      {entryIsActive ? 'Active (Consulted by Bot)' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700">Detailed Content &amp; Verified Facts</label>
                  <span className="text-[10px] text-stone-400">Include exact AED prices, hours, and rules</span>
                </div>
                <textarea
                  rows={6}
                  placeholder="Provide precise details, inclusions, rates, and policies..."
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 focus:border-amber-500 outline-none text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Lookup Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. evening, safari, bbq, rates, timing"
                  value={entryTags}
                  onChange={(e) => setEntryTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEntry}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {savingEntry ? 'Saving...' : editingEntry ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
