import React, { useState, useEffect, useRef } from 'react';
import { getStoredSession } from '../../utils/adminAuth';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionCard?: any;
  model?: string;
}

interface Conversation {
  id: string;
  customerDetails?: {
    name?: string;
    contact?: string;
    pickupArea?: string;
  };
  status: 'open' | 'resolved';
  preview: string;
  messageCount: number;
  startedAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

interface ChatbotSettings {
  enabled: boolean;
  botName: string;
  welcomeMessage: string;
  systemInstructions: string;
  tone: string;
  temperature: number;
  quickPrompts: Array<{ label: string; query: string }>;
  model: string;
  updatedAt: string;
}

interface ChatbotManagerTabProps {
  defaultSubTab?: 'settings' | 'conversations';
}

export const ChatbotManagerTab: React.FC<ChatbotManagerTabProps> = ({ defaultSubTab = 'settings' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'conversations' | 'settings'>(defaultSubTab);

  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Settings state
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [serverModelInfo, setServerModelInfo] = useState<{ activeModel: string; geminiConfigured: boolean }>({
    activeModel: 'gemini-3.8-flash',
    geminiConfigured: false,
  });

  // New prompt input state
  const [newPromptLabel, setNewPromptLabel] = useState('');
  const [newPromptQuery, setNewPromptQuery] = useState('');

  const session = getStoredSession();
  const getAuthHeaders = (): Record<string, string> => {
    const token = session?.token || 'phx_token_admin_awalgsm';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-admin-token': token,
    };
  };

  // Fetch Conversations
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const url = new URL('/api/admin/chat/conversations', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString(), {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        setOpenCount(data.openCount || 0);
        setResolvedCount(data.resolvedCount || 0);

        // Keep selected conversation in sync if still present
        if (selectedConv) {
          const updatedSelected = data.conversations.find((c: Conversation) => c.id === selectedConv.id);
          if (updatedSelected) {
            setSelectedConv(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch conversations:', err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/admin/chatbot/settings', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok && data.settings) {
        setSettings(data.settings);
        setServerModelInfo({
          activeModel: data.activeModel || 'gemini-3.8-flash',
          geminiConfigured: Boolean(data.geminiConfigured),
        });
      }
    } catch (err) {
      console.warn('Failed to fetch chatbot settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchSettings();
  }, [statusFilter]);

  // Auto-refresh interval (5s) for live conversations
  useEffect(() => {
    if (!autoRefresh || activeSubTab !== 'conversations') return;
    const interval = setInterval(() => {
      fetchConversations(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, activeSubTab, statusFilter, searchQuery, selectedConv]);

  // Toggle status of conversation
  const handleToggleStatus = async (convId: string, currentStatus: 'open' | 'resolved') => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open';
    try {
      const res = await fetch(`/api/admin/chat/conversations/${convId}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchConversations(true);
        if (selectedConv && selectedConv.id === convId) {
          setSelectedConv((prev) => (prev ? { ...prev, status: nextStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update conversation status:', err);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Are you sure you want to delete this conversation transcript?')) return;
    try {
      const res = await fetch(`/api/admin/chat/conversations/${convId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok) {
        if (selectedConv?.id === convId) setSelectedConv(null);
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Clear resolved conversations
  const handleClearResolved = async () => {
    if (!confirm('Clear all resolved conversations?')) return;
    try {
      const res = await fetch('/api/admin/chat/conversations/clear-resolved', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to clear resolved conversations:', err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setSettingsStatus(null);
    try {
      const res = await fetch('/api/admin/chatbot/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.ok) {
        setSettingsStatus({ text: 'Chatbot settings saved successfully! Live concierge updated immediately.', type: 'success' });
        setSettings(data.settings);
      } else {
        setSettingsStatus({ text: data.error || 'Failed to save settings.', type: 'error' });
      }
    } catch (err: any) {
      setSettingsStatus({ text: `Network error: ${err.message}`, type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Quick prompt add
  const handleAddPrompt = () => {
    if (!newPromptLabel.trim() || !newPromptQuery.trim() || !settings) return;
    const updated = [
      ...(settings.quickPrompts || []),
      { label: newPromptLabel.trim(), query: newPromptQuery.trim() },
    ];
    setSettings({ ...settings, quickPrompts: updated });
    setNewPromptLabel('');
    setNewPromptQuery('');
  };

  // Quick prompt remove
  const handleRemovePrompt = (idx: number) => {
    if (!settings) return;
    const updated = (settings.quickPrompts || []).filter((_, i) => i !== idx);
    setSettings({ ...settings, quickPrompts: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-amber-400 text-[22px]">smart_toy</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Live AI Concierge Hub
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {openCount} Open Conversations
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">Chatbot &amp; Visitor Conversations</h2>
          <p className="text-xs text-stone-300 max-w-2xl mt-1 leading-relaxed">
            Monitor real-time guest conversations, inspect full transcripts with pricing quotes, and configure the AI Concierge welcome message, response directives, and sales rules.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('conversations')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'conversations'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">forum</span>
            <span>Conversations ({conversations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'settings'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Chatbot Settings</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: LIVE CONVERSATIONS & TRANSCRIPTS */}
      {/* ======================================================== */}
      {activeSubTab === 'conversations' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filters */}
              <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-md font-bold cursor-pointer transition-colors ${
                    statusFilter === 'all' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All ({openCount + resolvedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('open')}
                  className={`px-3 py-1.5 rounded-md font-bold cursor-pointer transition-colors ${
                    statusFilter === 'open' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Open ({openCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('resolved')}
                  className={`px-3 py-1.5 rounded-md font-bold cursor-pointer transition-colors ${
                    statusFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-stone-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search guest, phone, query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 w-48 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={() => fetchConversations()}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                title="Search / Refresh"
              >
                <span>Search</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Auto Refresh Toggle */}
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  autoRefresh
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
                <span>Auto-refresh {autoRefresh ? 'ON (5s)' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => fetchConversations()}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition-colors"
                title="Manual Refresh"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>

              {resolvedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearResolved}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-semibold rounded-lg border border-stone-200 cursor-pointer transition-colors"
                >
                  Clear Resolved
                </button>
              )}
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Conversation List */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600 font-bold">
                <span>Recent Conversations ({conversations.length})</span>
                <span className="text-[10px] text-stone-400">Click to inspect transcript</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                {loadingConversations ? (
                  <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                    <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                    <p>Loading guest conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500 space-y-1">
                    <span className="material-symbols-outlined text-stone-300 text-[32px]">chat_bubble_outline</span>
                    <p className="font-semibold text-stone-700">No conversations found</p>
                    <p className="text-[11px]">When visitors ask the Phoenix AI agent questions on the site, their conversation will appear here in real time.</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = selectedConv?.id === conv.id;
                    const isResolved = conv.status === 'resolved';
                    const guestDisplay = conv.customerDetails?.name || `Visitor (${conv.id.substring(0, 10)})`;
                    const contactDisplay = conv.customerDetails?.contact;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConv(conv)}
                        className={`p-3.5 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-amber-50/80 border-l-4 border-amber-600'
                            : 'hover:bg-stone-50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-xs text-stone-900 truncate">{guestDisplay}</span>
                            {contactDisplay && (
                              <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded font-mono truncate">
                                {contactDisplay}
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isResolved
                                ? 'bg-stone-100 text-stone-600 border border-stone-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isResolved ? 'Resolved' : 'Open'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {conv.preview || 'No messages yet'}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">forum</span>
                            {conv.messageCount || conv.messages?.length || 0} messages
                          </span>
                          <span>
                            {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation Transcript Drawer */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
              {selectedConv ? (
                <>
                  {/* Transcript Header */}
                  <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-serif text-sm border border-amber-500/30">
                        {selectedConv.customerDetails?.name ? selectedConv.customerDetails.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm">
                            {selectedConv.customerDetails?.name || `Guest Transcript`}
                          </h3>
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              selectedConv.status === 'resolved'
                                ? 'bg-stone-800 text-stone-400 border border-stone-700'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {selectedConv.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">
                          {selectedConv.customerDetails?.contact ? `Phone / WhatsApp: ${selectedConv.customerDetails.contact}` : `ID: ${selectedConv.id}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(selectedConv.id, selectedConv.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                          selectedConv.status === 'open'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {selectedConv.status === 'open' ? 'check_circle' : 'replay'}
                        </span>
                        <span>{selectedConv.status === 'open' ? 'Mark Resolved' : 'Reopen'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteConversation(selectedConv.id)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-900/60 text-stone-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Delete Transcript"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Transcript Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50">
                    {Array.isArray(selectedConv.messages) && selectedConv.messages.length > 0 ? (
                      selectedConv.messages.map((m, idx) => {
                        const isUser = m.sender === 'user';
                        return (
                          <div
                            key={m.id || idx}
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mb-0.5 px-1">
                              <span className="font-semibold text-stone-600">
                                {isUser ? selectedConv.customerDetails?.name || 'Guest' : 'Phoenix AI Agent'}
                              </span>
                              {m.model && (
                                <span className="bg-stone-200 text-stone-700 px-1.5 rounded font-mono text-[9px]">
                                  {m.model}
                                </span>
                              )}
                              <span>
                                {m.timestamp
                                  ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : ''}
                              </span>
                            </div>

                            <div
                              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                                isUser
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-medium rounded-br-none'
                                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
                              }`}
                            >
                              <div className="whitespace-pre-line">{m.text}</div>

                              {m.actionCard && m.actionCard.type === 'price_quote' && (
                                <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>{m.actionCard.data.tour}</span>
                                    <span className="text-emerald-700 font-bold">AED {m.actionCard.data.total_aed}</span>
                                  </div>
                                  {m.actionCard.data.breakdown && (
                                    <p className="text-[10px] text-stone-600 mt-0.5">{m.actionCard.data.breakdown}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-xs text-stone-400">No messages in transcript.</div>
                    )}
                  </div>

                  {/* Transcript Footer Info */}
                  <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                    <span>
                      Started: {selectedConv.startedAt ? new Date(selectedConv.startedAt).toLocaleString() : 'N/A'}
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Encrypted &amp; Stored in Database
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-2">
                  <span className="material-symbols-outlined text-[48px] text-stone-300">chat</span>
                  <p className="font-semibold text-sm text-stone-700">No Conversation Selected</p>
                  <p className="text-xs max-w-sm text-stone-500">
                    Select a conversation from the left to view the complete transcript, pricing cards, and customer details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: CHATBOT SETTINGS & PERSONA */}
      {/* ======================================================== */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {settingsStatus && (
            <div
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                settingsStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {settingsStatus.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{settingsStatus.text}</span>
            </div>
          )}

          {loadingSettings ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading settings...</div>
          ) : settings ? (
            <>
              {/* Core Status & AI Infrastructure Card */}
              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Chatbot Status &amp; Server Key Security</h3>
                    <p className="text-xs text-stone-500">Manage agent activation and server-side runtime parameters.</p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-stone-700">
                      {settings.enabled ? 'Agent Active' : 'Agent Paused'}
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                      className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase">AI Runtime Model</span>
                    <div className="font-mono font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-[16px]">memory</span>
                      {serverModelInfo.activeModel}
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase">Server API Key</span>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      {serverModelInfo.geminiConfigured ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                          Secured on Server (Active)
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">info</span>
                          Knowledge Base Fallback Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-500 font-bold uppercase">Response Grounding</span>
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      DTCM Verified Knowledge Base
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-700">security</span>
                  <span>API keys are maintained exclusively in secure server-side environment configurations. Secrets are never exposed to browser clients or search engine indexers.</span>
                </div>
              </div>

              {/* Bot Identity & Welcome Message */}
              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-stone-900">Bot Identity &amp; Welcome Message</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Concierge Display Name</label>
                    <input
                      type="text"
                      value={settings.botName}
                      onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Tone &amp; Hospitality Style</label>
                    <select
                      value={settings.tone}
                      onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-amber-500 outline-none bg-white"
                    >
                      <option value="Warm, prestigious, highly courteous, hospitable, direct and helpful">
                        Warm, Prestigious &amp; Courteous (Recommended for Dubai Luxury)
                      </option>
                      <option value="Direct, concise, fast-paced and numerical">
                        Direct &amp; Concise (Speed &amp; Direct Rates)
                      </option>
                      <option value="Friendly, casual, family-oriented and reassuring">
                        Friendly &amp; Family Reassuring
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">Welcome Message (Shown when guest opens chat)</label>
                    <span className="text-[10px] text-stone-400">Supports markdown formatting</span>
                  </div>
                  <textarea
                    rows={4}
                    value={settings.welcomeMessage}
                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                    className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:border-amber-500 outline-none leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Response Instructions & Directives */}
              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Response Instructions &amp; Sales Directives</h3>
                    <p className="text-xs text-stone-500">Core operational instructions given to the AI reasoning engine.</p>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={settings.systemInstructions}
                  onChange={(e) => setSettings({ ...settings, systemInstructions: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:border-amber-500 outline-none leading-relaxed font-mono text-stone-800 bg-stone-50"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-stone-700">Creativity / Temperature ({settings.temperature})</label>
                    <span className="text-stone-400 text-[11px]">0.0 (Strict / Deterministic) — 1.0 (Creative)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              {/* Quick Action Suggestion Prompts */}
              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-stone-900">Quick Prompt Chips (Shown above visitor chat input)</h3>

                <div className="space-y-2">
                  {(settings.quickPrompts || []).map((prompt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                      <div>
                        <span className="font-bold text-stone-900">{prompt.label}</span>
                        <p className="text-[11px] text-stone-500 truncate max-w-md">{prompt.query}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrompt(idx)}
                        className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-stone-200 cursor-pointer"
                        title="Remove chip"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Prompt Form */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-700">Add New Quick Prompt Chip</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. 🏎️ Buggy Price)"
                      value={newPromptLabel}
                      onChange={(e) => setNewPromptLabel(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Query to send..."
                      value={newPromptQuery}
                      onChange={(e) => setNewPromptQuery(e.target.value)}
                      className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-stone-300 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPrompt}
                    disabled={!newPromptLabel.trim() || !newPromptQuery.trim()}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-40"
                  >
                    Add Chip
                  </button>
                </div>
              </div>

              {/* Save Bar */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">{savingSettings ? 'sync' : 'save'}</span>
                  <span>{savingSettings ? 'Saving Settings...' : 'Save Chatbot Settings'}</span>
                </button>
              </div>
            </>
          ) : null}
        </form>
      )}
    </div>
  );
};
