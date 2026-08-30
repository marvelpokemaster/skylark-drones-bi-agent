'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { RefreshCw, TrendingUp, Briefcase, FileText, IndianRupee, AlertCircle, Info, Send, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard({ dealsMetrics, woMetrics, lastUpdated }: { dealsMetrics: any, woMetrics: any, lastUpdated: any }) {
  const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/refresh', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setIsRefreshing(false);
    }
  };

  const submitChat = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.content }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitChat(input);
  };

  const handleLeadershipUpdate = () => {
    submitChat('Give me a leadership update.');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const formatCurrencyAbbreviated = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return formatCurrency(val);
  };

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Top Controls & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Live Monday.com Data • Last Refreshed: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAbout(true)} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-md transition flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> About / Methodology
          </button>
          <button onClick={handleRefresh} disabled={isRefreshing} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-md transition flex items-center gap-2">
            <RefreshCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")} /> Refresh Data
          </button>
          <button onClick={handleLeadershipUpdate} className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition flex items-center gap-2 shadow-lg shadow-blue-900/20">
            <TrendingUp className="w-3.5 h-3.5" /> Leadership Update
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Total Deals" value={dealsMetrics.totalDeals} icon={<Briefcase />} />
        <KpiCard title="Pipeline Value" value={formatCurrencyAbbreviated(dealsMetrics.pipelineValue)} exactValue={formatCurrency(dealsMetrics.pipelineValue)} icon={<IndianRupee />} />
        <KpiCard title="Weighted Pipeline" value={formatCurrencyAbbreviated(dealsMetrics.weightedPipeline)} exactValue={formatCurrency(dealsMetrics.weightedPipeline)} icon={<TrendingUp />} />
        <KpiCard title="Total Work Orders" value={woMetrics.totalWorkOrders} icon={<FileText />} />
        <KpiCard title="Billed Value" value={formatCurrencyAbbreviated(woMetrics.billedValue)} exactValue={formatCurrency(woMetrics.billedValue)} icon={<IndianRupee />} />
        <KpiCard title="Receivables" value={formatCurrencyAbbreviated(woMetrics.receivables)} exactValue={formatCurrency(woMetrics.receivables)} icon={<AlertCircle />} alert={woMetrics.receivables > 0} />
      </div>

      {/* Data Quality Indicator */}
      <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-xs text-amber-200/70 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p>
          <strong>Data Quality Note:</strong> Analytics exclude {dealsMetrics.dataQuality.invalidValueCount} deals with missing/invalid values. 
          For Work Orders, {woMetrics.dataQuality.invalidBilledValueCount} missing billed values, and {woMetrics.dataQuality.invalidReceivablesCount} missing receivables were safely ignored during aggregation.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col bg-slate-900/30 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-sm min-h-[500px]">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-300">How can I help you analyze the business?</h3>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mt-4">
                {["What is our total pipeline?", "Show pipeline by stage.", "How much have we billed vs collected?", "Which sector has the strongest pipeline?"].map(q => (
                  <button key={q} onClick={() => submitChat(q)} className="px-4 py-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-sm border border-slate-700 transition">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={clsx("flex gap-4 max-w-[85%]", m.role === 'user' ? "ml-auto" : "mr-auto")}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                )}
                <div className={clsx("p-4 rounded-2xl", m.role === 'user' ? "bg-blue-600 text-white" : "bg-slate-800/80 text-slate-200 border border-slate-700/50 leading-relaxed whitespace-pre-wrap")}>
                  {m.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 mr-auto max-w-[85%]">
              <div className="w-8 h-8 shrink-0 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-800/50">
          <div className="relative">
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm placeholder:text-slate-500 transition"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your deals or work orders..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">About / Methodology</h2>
              <button onClick={() => setShowAbout(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
              <p><strong>Source of Truth:</strong> Live Monday.com API. Both boards (Deals & Work Orders) are read-only.</p>
              <p><strong>Deterministic Analytics:</strong> Financial totals, pipelines, and distributions are calculated using strict TypeScript logic (no LLM math hallucination).</p>
              <p><strong>Data Resilience:</strong> Invalid strings, unparseable currencies, and text units (e.g. "5360 HA") are aggressively cleaned via regex. Unparseable rows are omitted from specific aggregates and flagged in the data quality indicator.</p>
              <p><strong>Weighted Pipeline Assumption:</strong> Calculated as <code>Deal Value × Probability</code>. High = 80%, Medium = 50%, Low = 20%.</p>
              <p><strong>AI Role:</strong> The LLM handles intent routing, contextualization, insights extraction, and formatting executive summaries using the pre-calculated metrics.</p>
            </div>
            <button onClick={() => setShowAbout(false)} className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, exactValue, icon, alert }: { title: string, value: string | number, exactValue?: string, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className={clsx(
      "p-4 rounded-xl border bg-slate-900/50 flex flex-col gap-3 relative overflow-hidden backdrop-blur-sm",
      alert ? "border-amber-500/30" : "border-slate-800/50"
    )}>
      {alert && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full"></div>}
      <div className="flex items-center gap-2 text-slate-400">
        <div className={clsx("p-2 rounded-lg", alert ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-blue-400")}>
          <div className="w-4 h-4 flex items-center justify-center">{icon}</div>
        </div>
        <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider line-clamp-1" title={title}>{title}</span>
      </div>
      <div className="text-xl md:text-2xl font-bold tracking-tight truncate" title={exactValue || String(value)}>{value}</div>
    </div>
  );
}
