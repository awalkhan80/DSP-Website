import React, { useState, useEffect } from 'react';

export const KnowledgeBaseTab: React.FC = () => {
  const [kbData, setKbData] = useState<any>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'structured' | 'json' | 'markdown'>('structured');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Simulator
  const [testQuery, setTestQuery] = useState<string>('We 6 pax for premium desert safari');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/knowledge_base');
      const json = await res.json();
      if (json.ok && json.data) {
        setKbData(json.data);
        setJsonText(JSON.stringify(json.data, null, 2));
      }
    } catch (e: any) {
      console.error('Failed to load KB:', e);
      setStatusMessage({ text: 'Failed to fetch knowledge base from server', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJson = async () => {
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
        setKbData(parsed);
        setStatusMessage({ text: 'Knowledge base saved and live on AI Concierge!', type: 'success' });
      } else {
        setStatusMessage({ text: data.error || 'Failed to save knowledge base', type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Invalid JSON format: ${e.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
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

  const downloadJsonFile = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tours_knowledge_base.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-amber-400 text-[22px]">psychology</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Live Knowledge File</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Sync
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">AI Concierge Tour Knowledge Base</h2>
          <p className="text-xs text-stone-300 max-w-2xl mt-1 leading-relaxed">
            The AI Booking Concierge automatically consults <code>tours_knowledge_base.json</code> and deterministic pricing logic. You can edit tour prices, vehicle capacities, and policies directly here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadJsonFile}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download JSON</span>
          </button>
          <button
            type="button"
            onClick={handleSaveJson}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:brightness-110 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">{isSaving ? 'sync' : 'save'}</span>
            <span>{isSaving ? 'Saving...' : 'Save & Reload AI'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Interactive Simulator Card */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#EA580C] text-[20px]">smart_toy</span>
            <h3 className="text-sm font-bold text-stone-900">Live AI Arithmetic &amp; Concierge Simulator</h3>
          </div>
          <span className="text-[11px] text-stone-500">Test how the agent responds to guest queries</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. We 6 pax for premium desert safari, 4 people for burj khalifa, etc."
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
            'We 6 pax for premium desert safari',
            '4 people for evening desert safari',
            'Check burj khalifa availability for today 8pm',
            'Can 2 people drive Can-Am buggy',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setTestQuery(chip);
              }}
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
              {simResult.actionCard && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Quote Card Generated (AED {simResult.actionCard.data.total_aed})
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-stone-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-200">
              {simResult.reply}
            </p>
            {simResult.actionCard && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950">
                <strong>Structured Quote Card:</strong> {simResult.actionCard.data.tour} —{' '}
                <span className="font-bold text-[#EA580C]">AED {simResult.actionCard.data.total_aed}</span> (
                {simResult.actionCard.data.breakdown})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('structured')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              viewMode === 'structured'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Structured Tour Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
              viewMode === 'json'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Raw JSON Editor
          </button>
        </div>

        <span className="text-xs text-stone-500">File: <code>tours_knowledge_base.json</code></span>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500">Loading knowledge base file...</div>
      ) : viewMode === 'structured' && kbData?.tours ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kbData.tours.map((t: any) => (
            <div key={t.id} className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{t.category}</span>
                  <h4 className="font-bold text-sm text-stone-900">{t.title}</h4>
                </div>
                <span className="text-xs font-bold text-[#EA580C] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {t.flat_rate_aed
                    ? `AED ${t.flat_rate_aed} Flat Rate`
                    : t.rate_adult_aed
                    ? `AED ${t.rate_adult_aed} / Adult`
                    : t.rate_per_person_aed
                    ? `AED ${t.rate_per_person_aed} / Person`
                    : 'Custom Rates'}
                </span>
              </div>

              {t.vehicle_capacity && (
                <div className="text-[11px] text-stone-600">
                  <strong>Vehicle Capacity:</strong> Up to {t.vehicle_capacity} guests per 4x4
                </div>
              )}

              {t.payment_policy && (
                <div className="text-[11px]">
                  <strong>Payment Policy:</strong>{' '}
                  <span
                    className={`font-semibold ${
                      t.payment_policy.includes('Advance') ? 'text-amber-800' : 'text-emerald-800'
                    }`}
                  >
                    {t.payment_policy}
                  </span>
                </div>
              )}

              {t.inclusions && (
                <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside">
                  {t.inclusions.slice(0, 3).map((inc: string, i: number) => (
                    <li key={i} className="truncate">
                      {inc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={22}
            className="w-full p-4 rounded-xl font-mono text-xs bg-stone-900 text-amber-200 border border-stone-800 focus:outline-none focus:border-amber-500 leading-relaxed"
            spellCheck={false}
          />
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Edit pricing and rules in JSON. Changes take effect as soon as you click "Save &amp; Reload AI".</span>
            <button
              type="button"
              onClick={() => {
                try {
                  const obj = JSON.parse(jsonText);
                  setJsonText(JSON.stringify(obj, null, 2));
                  setStatusMessage({ text: 'JSON formatted & syntax valid!', type: 'success' });
                } catch (e: any) {
                  setStatusMessage({ text: `Invalid JSON: ${e.message}`, type: 'error' });
                }
              }}
              className="text-[#EA580C] hover:underline cursor-pointer font-bold"
            >
              Format &amp; Validate JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
