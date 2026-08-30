'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { RefreshCw, TrendingUp, Briefcase, FileText, IndianRupee, AlertTriangle, Info, Send, Loader2, Sparkles, Database, Terminal, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

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
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `**System Error:**\n${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitChat(input);
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

  const formatText = (text: string) => {
    // Simple markdown bold parsing for the chat
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-zinc-100 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const hasDataIssues = dealsMetrics.dataQuality.invalidValueCount > 0 || woMetrics.dataQuality.invalidBilledValueCount > 0 || woMetrics.dataQuality.invalidReceivablesCount > 0;

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <Terminal className="w-3.5 h-3.5" />
          SYNCED: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAbout(true)} className="px-4 py-2 text-xs font-mono bg-panel-800 hover:bg-panel-900 border border-white/10 hover:border-white/20 rounded-lg transition-all flex items-center gap-2 text-zinc-300">
            <Info className="w-3.5 h-3.5" /> METHODOLOGY
          </button>
          <button onClick={handleRefresh} disabled={isRefreshing} className="px-4 py-2 text-xs font-mono bg-panel-800 hover:bg-panel-900 border border-white/10 hover:border-white/20 rounded-lg transition-all flex items-center gap-2 text-zinc-300">
            <RefreshCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")} /> REFRESH
          </button>
          <button onClick={() => submitChat('Give me a leadership update.')} className="px-5 py-2 text-xs font-mono font-bold bg-gradient-primary hover:opacity-90 text-white rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Sparkles className="w-3.5 h-3.5" /> LEADERSHIP UPDATE
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
        <KpiCard title="Total Deals" value={dealsMetrics.totalDeals} icon={<Briefcase />} />
        <KpiCard title="Pipeline Value" value={formatCurrencyAbbreviated(dealsMetrics.pipelineValue)} exactValue={formatCurrency(dealsMetrics.pipelineValue)} icon={<IndianRupee />} highlight />
        <KpiCard title="Weighted Pipeline" value={formatCurrencyAbbreviated(dealsMetrics.weightedPipeline)} exactValue={formatCurrency(dealsMetrics.weightedPipeline)} icon={<TrendingUp />} highlight />
        <KpiCard title="Total Work Orders" value={woMetrics.totalWorkOrders} icon={<FileText />} />
        <KpiCard title="Billed Value" value={formatCurrencyAbbreviated(woMetrics.billedValue)} exactValue={formatCurrency(woMetrics.billedValue)} icon={<Database />} />
        <KpiCard title="Receivables" value={formatCurrencyAbbreviated(woMetrics.receivables)} exactValue={formatCurrency(woMetrics.receivables)} icon={<AlertTriangle />} alert={woMetrics.receivables > 0} />
      </div>

      {/* Data Quality Warning */}
      {hasDataIssues && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass-panel bg-warning/5 border-warning/20 p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-300 leading-relaxed font-inter">
            <strong className="text-warning font-mono uppercase text-xs tracking-wider block mb-1">Data Quality Notice</strong>
            Analytics dynamically exclude <strong className="text-zinc-100">{dealsMetrics.dataQuality.invalidValueCount} deals</strong> with missing/invalid values. 
            For Work Orders, <strong className="text-zinc-100">{woMetrics.dataQuality.invalidBilledValueCount} missing billed values</strong>, and <strong className="text-zinc-100">{woMetrics.dataQuality.invalidReceivablesCount} missing receivables</strong> were safely bypassed.
          </div>
        </motion.div>
      )}

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col glass-panel overflow-hidden min-h-[500px] border-white/5 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-6 scroll-smooth">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-6 max-w-2xl mx-auto w-full">
                <div className="w-16 h-16 rounded-2xl glass-shell flex items-center justify-center text-primary shadow-[0_0_30px_rgba(139,92,246,0.15)] relative">
                  <div className="absolute inset-0 rounded-2xl border border-primary/20 animate-pulse"></div>
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-space font-medium text-zinc-200">System Awaiting Query</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {[
                    "What is our total pipeline?", 
                    "Show pipeline by stage.", 
                    "How much have we billed vs collected?", 
                    "Compare Mining vs Infrastructure."
                  ].map(q => (
                    <button 
                      key={q} 
                      onClick={() => submitChat(q)} 
                      className="text-left px-4 py-3 rounded-xl glass-shell hover:bg-white/5 hover:border-primary/30 transition-all text-sm text-zinc-300 group flex justify-between items-center"
                    >
                      <span>{q}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map(m => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={m.id} 
                  className={clsx("flex gap-4 max-w-[90%] md:max-w-[80%]", m.role === 'user' ? "ml-auto" : "mr-auto")}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 shrink-0 rounded-full glass-shell border-primary/30 flex items-center justify-center text-primary mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className={clsx(
                    "p-4 rounded-2xl shadow-sm text-sm md:text-base whitespace-pre-wrap leading-relaxed", 
                    m.role === 'user' 
                      ? "bg-primary text-white rounded-tr-sm shadow-[0_4px_20px_rgba(139,92,246,0.25)]" 
                      : "glass-shell bg-panel-800/80 text-zinc-300 rounded-tl-sm border-white/5"
                  )}>
                    {m.role === 'assistant' ? formatText(m.content) : m.content}
                  </div>
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 mr-auto max-w-[80%]">
                <div className="w-8 h-8 shrink-0 rounded-full glass-shell border-primary/30 flex items-center justify-center text-primary mt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl glass-shell bg-panel-800/80 rounded-tl-sm flex items-center gap-2 h-[52px]">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 bg-panel-900/80 border-t border-white/5 backdrop-blur-xl">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-primary">
              <Terminal className="w-4 h-4" />
            </div>
            <input
              className="w-full bg-panel-800/50 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-panel-800 rounded-xl pl-12 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm placeholder:text-zinc-500 transition-all font-inter shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query the system..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 aspect-square h-[calc(100%-16px)] flex items-center justify-center bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary text-white rounded-lg transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Methodology Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian-900/80 backdrop-blur-sm flex items-center justify-center p-4" 
            onClick={() => setShowAbout(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-elevated max-w-2xl w-full p-8 border-white/10 flex flex-col gap-6" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-space font-bold text-zinc-100 flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" /> System Architecture & Methodology
                </h2>
                <button onClick={() => setShowAbout(false)} className="text-zinc-500 hover:text-white transition-colors">✕</button>
              </div>
              
              <div className="space-y-6 text-sm text-zinc-300 leading-relaxed font-inter max-h-[60vh] overflow-y-auto pr-2">
                <section>
                  <h3 className="font-mono text-xs text-primary uppercase tracking-widest mb-2">Source of Truth</h3>
                  <p className="bg-white/5 p-3 rounded-lg border border-white/5">Live Monday.com API. Both boards (Deals & Work Orders) are read-only and queried symmetrically.</p>
                </section>
                <section>
                  <h3 className="font-mono text-xs text-primary uppercase tracking-widest mb-2">Deterministic Engine</h3>
                  <p>Financial totals, pipelines, and distributions are calculated using strict TypeScript logic. The LLM acts purely as a narrative interface and never performs independent math.</p>
                </section>
                <section>
                  <h3 className="font-mono text-xs text-primary uppercase tracking-widest mb-2">Data Resilience</h3>
                  <p>Invalid strings, unparseable currencies, and text units (e.g. <code>"5360 HA"</code>) are aggressively cleaned. Unparseable rows are explicitly omitted from specific aggregates and flagged.</p>
                </section>
                <section>
                  <h3 className="font-mono text-xs text-primary uppercase tracking-widest mb-2">Weighted Pipeline Assumptions</h3>
                  <p>Calculated as <code>Deal Value × Probability</code>. High = 80%, Medium = 50%, Low = 20%.</p>
                </section>
              </div>
              
              <button onClick={() => setShowAbout(false)} className="w-full mt-2 py-3 glass-shell hover:bg-white/10 border-white/10 rounded-xl font-medium transition-all text-white">
                ACKNOWLEDGE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KpiCard({ title, value, exactValue, icon, alert, highlight }: { title: string, value: string | number, exactValue?: string, icon: React.ReactNode, alert?: boolean, highlight?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={clsx(
        "glass-panel p-4 lg:p-5 flex flex-col gap-3 relative group transition-colors",
        alert ? "border-warning/30 hover:border-warning/50" : (highlight ? "border-primary/20 hover:border-primary/40" : "hover:border-white/20")
      )}
    >
      {/* Background glow on hover */}
      <div className={clsx(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none mix-blend-screen",
        alert ? "bg-warning/5" : (highlight ? "bg-primary/5" : "bg-white/5")
      )}></div>
      
      <div className="flex items-center gap-2 text-zinc-400">
        <div className={clsx(
          "p-1.5 rounded-md", 
          alert ? "bg-warning/10 text-warning" : (highlight ? "bg-primary/10 text-primary" : "bg-white/5 text-zinc-300")
        )}>
          <div className="w-3.5 h-3.5 flex items-center justify-center">{icon}</div>
        </div>
        <span className="text-[10px] md:text-xs font-mono font-medium uppercase tracking-wider truncate" title={title}>{title}</span>
      </div>
      
      <div 
        className={clsx(
          "text-xl md:text-2xl font-space font-bold tracking-tight truncate",
          highlight ? "text-gradient-primary" : (alert ? "text-warning" : "text-zinc-100")
        )} 
        title={exactValue || String(value)}
      >
        {value}
      </div>
    </motion.div>
  );
}
