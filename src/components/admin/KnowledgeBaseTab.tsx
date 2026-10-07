import React, { useState, useEffect } from 'react';
import { Experience, OffRoadPricingConfig } from '../../types';
import { CMSConfig } from './AdminDashboard';

interface KnowledgeBaseTabProps {
  experiences?: Experience[];
  offRoadPricing?: OffRoadPricingConfig;
  cmsConfig?: CMSConfig;
  showToast?: (msg: string) => void;
}

interface CustomFaq {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({
  experiences = [],
  offRoadPricing,
  cmsConfig,
  showToast,
}) => {
  const [kbData, setKbData] = useState<any>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'training-studio' | 'chat-simulator' | 'json-file'>('training-studio');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Training Studio State
  const [selectedPersona, setSelectedPersona] = useState<string>('luxury_vip_concierge');
  const [customTone, setCustomTone] = useState<string>('Warm, prestigious, highly courteous, hospitable, direct and helpful');
  const [salesRules, setSalesRules] = useState<string[]>([]);
  const [newRuleText, setNewRuleText] = useState<string>('');
  const [faqsList, setFaqsList] = useState<CustomFaq[]>([]);
  const [faqSearch, setFaqSearch] = useState<string>('');

  // Add/Edit FAQ Modal State
  const [faqModalOpen, setFaqModalOpen] = useState<boolean>(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState<string>('');
  const [faqAnswer, setFaqAnswer] = useState<string>('');

  // Chat Simulator State
  const [testQuery, setTestQuery] = useState<string>('We are 6 pax for premium desert safari, how much in AED?');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; timestamp: string; actionCard?: any }>>([
    {
      role: 'assistant',
      text: 'Marhaban! I am your VIP Concierge from The Phoenix Desert Safari Dubai. How may I assist you with safari bookings, private convoys, or dune buggy adventures today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/knowledge_base');
      const json = await res.json();
      if (json.ok && json.data) {
        populateKbState(json.data);
      }
    } catch (e: any) {
      console.error('Failed to load KB:', e);
      setStatusMessage({ text: 'Failed to fetch knowledge base from server', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const populateKbState = (data: any) => {
    setKbData(data);
    setJsonText(JSON.stringify(data, null, 2));

    if (data.ai_settings) {
      setSelectedPersona(data.ai_settings.persona || 'luxury_vip_concierge');
      setCustomTone(data.ai_settings.tone || 'Warm, prestigious, highly courteous, hospitable, direct and helpful');
      setSalesRules(data.ai_settings.custom_sales_rules || []);
      setFaqsList(data.ai_settings.custom_faqs || []);
    }
  };

  // 1. One-Click Auto-Sync from Live Admin Tour Catalog
  const handleSyncWithTourCatalog = async () => {
    setIsSyncingCatalog(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/ai/sync-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiences,
          offRoadPricing,
          cmsConfig,
          aiSettings: {
            persona: selectedPersona,
            tone: customTone,
            custom_sales_rules: salesRules,
            custom_faqs: faqsList,
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        populateKbState(data.data);
        const successMsg = `AI Chatbot trained successfully with ${data.data?.tours?.length || experiences.length} live tours from Admin Dashboard!`;
        setStatusMessage({ text: successMsg, type: 'success' });
        if (showToast) showToast(successMsg);
      } else {
        setStatusMessage({ text: data.error || 'Failed to sync catalog with AI', type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Sync error: ${e.message}`, type: 'error' });
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  // 2. Save Custom Training Rules & FAQs
  const handleSaveTrainingStudio = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updatedKb = {
        ...(kbData || {}),
        ai_settings: {
          ...(kbData?.ai_settings || {}),
          persona: selectedPersona,
          tone: customTone,
          custom_sales_rules: salesRules,
          custom_faqs: faqsList,
        },
        lastTrainedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/admin/knowledge_base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedKb }),
      });
      const data = await res.json();
      if (data.ok) {
        populateKbState(updatedKb);
        setStatusMessage({ text: 'AI Training Rules & Knowledge Base saved and live on chatbot!', type: 'success' });
        if (showToast) showToast('AI Chatbot retrained with new sales rules & FAQs!');
      } else {
        setStatusMessage({ text: data.error || 'Failed to save training configuration', type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Save error: ${e.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Save Raw JSON
  const handleSaveRawJson = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const parsed = JSON.parse(jsonText);
      const res = await fetch('/api/admin/knowledge_base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed }),
      });
      const data = await res.json();
      if (data.ok) {
        populateKbState(parsed);
        setStatusMessage({ text: 'Knowledge Base JSON deployed live to AI Concierge!', type: 'success' });
      } else {
        setStatusMessage({ text: data.error || 'Failed to save JSON', type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Invalid JSON format: ${e.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Rule Helpers
  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    setSalesRules([...salesRules, newRuleText.trim()]);
    setNewRuleText('');
  };

  const handleRemoveRule = (index: number) => {
    setSalesRules(salesRules.filter((_, idx) => idx !== index));
  };

  // FAQ Helpers
  const handleOpenAddFaq = () => {
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: CustomFaq) => {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqModalOpen(true);
  };

  const handleSaveFaqModal = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    if (editingFaqId) {
      setFaqsList(
        faqsList.map((f) =>
          f.id === editingFaqId ? { ...f, question: faqQuestion.trim(), answer: faqAnswer.trim() } : f
        )
      );
    } else {
      const newFaq: CustomFaq = {
        id: 'faq-' + Date.now(),
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
      };
      setFaqsList([newFaq, ...faqsList]);
    }
    setFaqModalOpen(false);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqsList(faqsList.filter((f) => f.id !== id));
  };

  const downloadJsonFile = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tours_knowledge_base.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chat Simulator
  const handleSendSimulatorMessage = async (queryText?: string) => {
    const textToSend = queryText || testQuery;
    if (!textToSend.trim() || simulating) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setTestQuery('');
    setSimulating(true);

    try {
      const historyPayload = chatMessages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: historyPayload }),
      });
      const data = await res.json();
      if (data.ok && data.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            actionCard: data.actionCard,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.error || 'I encountered an error retrieving the details. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Simulator Error: ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSimulating(false);
    }
  };

  const filteredFaqs = faqsList.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner with Live Sync & Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-white">AI Chatbot Training &amp; Knowledge Base Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Grounding
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Train your AI Concierge with your live tour inventory, sales rules, custom FAQs, and tone of voice.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncWithTourCatalog}
            disabled={isSyncingCatalog}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncingCatalog ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncingCatalog ? 'Syncing & Training...' : 'Sync with Tour Catalog'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTrainingStudio}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-400 font-bold text-xs uppercase tracking-wider border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>{isSaving ? 'Deploying...' : 'Save & Retrain'}</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {statusMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E9E1DF] gap-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('training-studio')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'training-studio'
              ? 'border-[#8D4B00] text-[#8D4B00]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Visual Training Studio
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('chat-simulator')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'chat-simulator'
              ? 'border-[#8D4B00] text-[#8D4B00]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          Live Chatbot Sandbox &amp; Tester
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('json-file')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'json-file'
              ? 'border-[#8D4B00] text-[#8D4B00]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">data_object</span>
          Raw Knowledge Base JSON File
        </button>
      </div>

      {/* SUB-TAB 1: VISUAL TRAINING STUDIO */}
      {activeSubTab === 'training-studio' && (
        <div className="space-y-6">
          {/* Quick Sync & Training Stats Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E9E1DF] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Trained Tour Products
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-serif text-[#1E1B1A]">
                  {kbData?.tours?.length || experiences.length} Tours
                </span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                ✓ 100% Live In Sync
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E9E1DF] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Custom FAQs &amp; Facts
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-serif text-[#1E1B1A]">{faqsList.length} Q&amp;As</span>
                <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <span className="material-symbols-outlined text-[20px]">quiz</span>
                </span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Verified responses</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E9E1DF] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Business &amp; Sales Directives
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-serif text-[#1E1B1A]">{salesRules.length} Rules</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <span className="material-symbols-outlined text-[20px]">rule</span>
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Active sales focus</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E9E1DF] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Last Retrained
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1E1B1A] line-clamp-1">
                  {kbData?.lastTrainedAt ? new Date(kbData.lastTrainedAt).toLocaleTimeString() : 'Active'}
                </span>
                <span className="p-2 rounded-lg bg-purple-50 text-purple-700">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </span>
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {kbData?.lastTrainedAt ? new Date(kbData.lastTrainedAt).toLocaleDateString() : 'Auto-grounded'}
              </span>
            </div>
          </div>

          {/* Persona & Personality Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E1DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1E1B1A]">1. AI Concierge Persona &amp; Tone of Voice</h3>
                <p className="text-xs text-stone-500">Configure how the AI introduces itself and speaks with travelers on WhatsApp and web chat.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                Persona Settings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPersona('luxury_vip_concierge');
                  setCustomTone('Warm, prestigious, highly courteous, hospitable, direct and helpful');
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPersona === 'luxury_vip_concierge'
                    ? 'border-[#8D4B00] bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">diamond</span>
                  <span className="font-bold text-xs text-stone-900">Luxury VIP Concierge</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Refined, white-glove hospitality tone. Focuses on premium comfort, private Land Cruisers, and royal treatment.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPersona('sales_closer');
                  setCustomTone('Fast-paced, high energy, transparent pricing, highlights 100% pay on arrival and instant booking');
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPersona === 'sales_closer'
                    ? 'border-[#8D4B00] bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">rocket_launch</span>
                  <span className="font-bold text-xs text-stone-900">High-Converting Closer</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Action-oriented. Quotes exact totals in seconds and emphasizes Zero Advance Deposit guarantee.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPersona('safari_marshal');
                  setCustomTone('Adventurous, authoritative on desert safety, dune dynamics, and machine horsepower');
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPersona === 'safari_marshal'
                    ? 'border-[#8D4B00] bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">explore</span>
                  <span className="font-bold text-xs text-stone-900">Senior Desert Marshal</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Expert on terrain, 1000cc Can-Am buggies, sunset photography, safety guidelines, and family suitability.
                </p>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">Custom Tone Directive</label>
              <input
                type="text"
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                placeholder="e.g. Warm, prestigious, highly courteous, hospitable, direct and helpful"
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:border-[#8D4B00] outline-none"
              />
            </div>
          </div>

          {/* Business & Sales Directives (The Rules the AI MUST follow) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E1DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1E1B1A]">2. Business &amp; Sales Directives</h3>
                <p className="text-xs text-stone-500">
                  Strict operating policies the AI must enforce during every conversation (e.g. payment guarantees, pickup coverage).
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {salesRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                    title="Remove rule"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Rule */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
                placeholder="Add a new sales rule (e.g. 'Always offer VIP table upgrade for celebrations')..."
                className="flex-1 text-xs p-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:border-[#8D4B00] outline-none"
              />
              <button
                type="button"
                onClick={handleAddRule}
                disabled={!newRuleText.trim()}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
              >
                + Add Rule
              </button>
            </div>
          </div>

          {/* Custom Q&A Training Library */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E1DF] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1E1B1A]">3. Custom Q&amp;A Training Library</h3>
                <p className="text-xs text-stone-500">
                  Teach the AI specific answers to tricky questions (payment methods, clothing, safety, dietary, timings).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search questions &amp; answers..."
                  className="text-xs p-2 rounded-lg border border-stone-200 bg-stone-50 outline-none w-48 sm:w-60"
                />
                <button
                  type="button"
                  onClick={handleOpenAddFaq}
                  className="px-3.5 py-2 rounded-lg bg-[#8D4B00] hover:bg-[#703b00] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Q&amp;A Pair</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-stone-900 leading-snug flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">Q:</span>
                        <span>{faq.question}</span>
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditFaq(faq)}
                          className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed bg-white p-2.5 rounded-lg border border-stone-100">
                      <strong className="text-emerald-700">A: </strong>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200 text-xs text-stone-500">
                No matching Q&amp;As found. Click &quot;Add Q&amp;A Pair&quot; to train a new answer.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LIVE CHAT SIMULATOR & SANDBOX */}
      {activeSubTab === 'chat-simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E9E1DF] shadow-xs flex flex-col h-[600px] overflow-hidden">
            {/* Simulator Header */}
            <div className="p-4 bg-stone-900 text-white border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-stone-950 text-xs">
                  AI
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Live AI Concierge Sandbox</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Grounded with Current Knowledge Base
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setChatMessages([
                    {
                      role: 'assistant',
                      text: 'Marhaban! How can I assist you with your Dubai Desert Safari today?',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="text-xs text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Chat</span>
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#8D4B00] text-white rounded-tr-none'
                        : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Action Card Preview if Generated */}
                    {msg.actionCard && msg.actionCard.type === 'price_quote' && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-stone-900 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                          ⚡ Instant Direct Operator Allotment
                        </span>
                        <div className="flex justify-between items-center font-bold text-xs text-[#8D4B00]">
                          <span>{msg.actionCard.data?.tour}</span>
                          <span className="text-sm">AED {msg.actionCard.data?.total_aed}</span>
                        </div>
                        <span className="text-[10px] text-stone-600 block">
                          100% Pay on Arrival &bull; Zero Deposit
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 px-1 mt-1">{msg.timestamp}</span>
                </div>
              ))}

              {simulating && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 w-fit text-xs text-stone-500">
                  <span className="material-symbols-outlined text-[16px] animate-spin text-amber-600">
                    progress_activity
                  </span>
                  <span>AI Concierge is calculating quote and retrieving knowledge base...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-stone-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendSimulatorMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Type a test scenario (e.g. 'Can we pay in USD for 4 people on VIP Safari?')..."
                  className="flex-1 text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-[#8D4B00] outline-none"
                />
                <button
                  type="submit"
                  disabled={!testQuery.trim() || simulating}
                  className="px-5 py-3 rounded-xl bg-[#8D4B00] hover:bg-[#703b00] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Quick Scenario Testing Chips */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E9E1DF] shadow-xs space-y-3">
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                ⚡ Quick Test Prompts
              </h4>
              <p className="text-xs text-stone-500">
                Click any scenario below to immediately test the AI&apos;s arithmetic and trained policies:
              </p>

              <div className="space-y-2">
                {[
                  'We are 6 pax for premium desert safari, how much in AED?',
                  'Can I pay in USD or EUR cash when the driver arrives?',
                  'How much for 2 people on Can-Am Buggy 1000cc for 1 hour?',
                  'Is desert safari dune bashing safe for pregnant women?',
                  'Do you pick up from Sharjah or only Dubai hotels?',
                  'Do I need a driving license to drive the quad bikes?',
                  'How much for 4 adults on Burj Khalifa At The Top tickets?',
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendSimulatorMessage(promptText)}
                    className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 text-xs text-stone-700 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{promptText}</span>
                    <span className="material-symbols-outlined text-[16px] text-stone-400 group-hover:text-amber-700">
                      play_arrow
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grounding Verification Card */}
            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-amber-600">verified</span>
                Verified Grounding Status
              </span>
              <p className="text-[11px] text-amber-950 leading-relaxed">
                The AI Concierge is strictly anchored in your <code>tours_knowledge_base.json</code> file.
                Whenever you change prices or policies, click <strong>&quot;Sync with Tour Catalog&quot;</strong> to retrain the bot instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RAW JSON FILE EDITOR */}
      {activeSubTab === 'json-file' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E9E1DF] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1E1B1A]">
                Raw Knowledge Base File (<code>tours_knowledge_base.json</code>)
              </h3>
              <p className="text-xs text-stone-500">
                Direct raw JSON configuration used by the AI Concierge backend and mathematical pricing model.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadJsonFile}
                className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRawJson}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-[#8D4B00] hover:bg-[#703b00] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{isSaving ? 'Saving...' : 'Deploy JSON'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={20}
            className="w-full font-mono text-xs p-4 rounded-xl border border-stone-200 bg-stone-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 leading-relaxed"
            spellCheck={false}
          />
        </div>
      )}

      {/* Add / Edit FAQ Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-serif font-bold text-base text-[#1E1B1A]">
                {editingFaqId ? 'Edit Trained Q&A Pair' : 'Add New Trained Q&A Pair'}
              </h4>
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Question / Traveler Query <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. Can we pay in Euros upon arrival?"
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-[#8D4B00] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Verified Concierge Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  rows={4}
                  placeholder="e.g. Yes! We accept cash in AED, USD, EUR, and GBP, as well as Visa/Mastercard on arrival with zero advance deposit."
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-[#8D4B00] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFaqModal}
                disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                className="px-5 py-2 rounded-xl bg-[#8D4B00] hover:bg-[#703b00] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Save Q&amp;A
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
