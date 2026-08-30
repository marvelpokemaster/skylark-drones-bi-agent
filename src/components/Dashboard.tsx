'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { RefreshCw, TrendingUp, Briefcase, FileText, IndianRupee, AlertTriangle, Info, Send, Loader2, Sparkles, Database, Terminal, ChevronRight, BarChart3, Target, Crosshair, X } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineBySectorChart, ExecutionStatusChart, BillingCollectionChart } from './Charts';

export default function Dashboard({ dealsMetrics, woMetrics, sectorMatrix, signals, lastUpdated }: any) {
  const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
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
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return formatCurrency(val);
  };

  const formatText = (text: string) => {
    // Basic Markdown formatting for Evidence blocks and bold text
    return text.split('\n').map((line, i) => {
      // Bold handling
      let formattedLine = line;
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      const boldedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });

      if (line.startsWith('Evidence:')) {
        return <div key={i} className="mt-4 pt-3 border-t border-white/10 font-mono text-xs text-primary uppercase tracking-widest">EVIDENCE BUNDLE</div>;
      }
      
      return (
        <div key={i} className={clsx(
          "min-h-[1.2rem]",
          line.startsWith('•') || line.startsWith('-') ? "pl-4 text-zinc-300" : "text-zinc-200",
          line.startsWith('Data Quality:') && "text-warning text-xs mt-2"
        )}>
          {boldedLine}
        </div>
      );
    });
  };

  const hasDataIssues = dealsMetrics.dataQuality.invalidValueCount > 0 || woMetrics.dataQuality.invalidBilledValueCount > 0 || woMetrics.dataQuality.invalidReceivablesCount > 0;

  return (
    <div className="flex flex-col xl:flex-row gap-6 flex-1 w-full relative items-start">
      
      {/* Left Column: Analytics & Dashboards */}
      <div className="w-full xl:w-[60%] flex flex-col gap-6">

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs 2xl:text-sm font-mono text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Terminal className="w-3 h-3 text-primary" />
            SYNCED: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAbout(true)} className="px-4 py-2 text-xs 2xl:text-sm font-mono bg-panel-800 hover:bg-panel-900 border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 flex items-center gap-2 text-zinc-300 shadow-sm hover:shadow-md hover:-translate-y-px">
              <Info className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" /> METHODOLOGY
            </button>
            <button onClick={handleRefresh} disabled={isRefreshing} className="px-4 py-2 text-xs 2xl:text-sm font-mono bg-panel-800 hover:bg-panel-900 border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 flex items-center gap-2 text-zinc-300 group shadow-sm hover:shadow-md hover:-translate-y-px">
              <RefreshCw className={clsx("w-3.5 h-3.5 2xl:w-4 2xl:h-4 transition-transform duration-700", isRefreshing ? "animate-spin" : "group-hover:rotate-180")} /> REFRESH
            </button>
            <button onClick={() => submitChat('Give me a leadership update.')} className="px-5 py-2 text-xs 2xl:text-sm font-mono font-bold bg-gradient-primary hover:opacity-90 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:-translate-y-px group">
              <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 group-hover:scale-110 transition-transform" /> LEADERSHIP UPDATE
            </button>
          </div>
        </div>
          
          {/* Data Quality Warning */}
          {hasDataIssues && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass-panel bg-warning/5 border-warning/20 p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm 2xl:text-base text-zinc-300 leading-relaxed font-inter">
                <strong className="text-warning font-mono uppercase text-xs tracking-wider block mb-1">Data Quality Notice</strong>
                Analytics dynamically exclude <strong className="text-zinc-100">{dealsMetrics.dataQuality.invalidValueCount} deals</strong> with missing/invalid values. 
                For Work Orders, <strong className="text-zinc-100">{woMetrics.dataQuality.invalidBilledValueCount} missing billed values</strong>, and <strong className="text-zinc-100">{woMetrics.dataQuality.invalidReceivablesCount} missing receivables</strong> were safely bypassed.
              </div>
            </motion.div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 2xl:gap-6">
            <KpiCard title="Total Deals" value={dealsMetrics.totalDeals} icon={<Briefcase />} />
            <KpiCard title="Pipeline Value" value={formatCurrencyAbbreviated(dealsMetrics.pipelineValue)} exactValue={formatCurrency(dealsMetrics.pipelineValue)} icon={<IndianRupee />} highlight />
            <KpiCard title="Weighted Pipeline" value={formatCurrencyAbbreviated(dealsMetrics.weightedPipeline)} exactValue={formatCurrency(dealsMetrics.weightedPipeline)} icon={<TrendingUp />} highlight />
            <KpiCard title="Total Work Orders" value={woMetrics.totalWorkOrders} icon={<FileText />} />
            <KpiCard title="Billed Value" value={formatCurrencyAbbreviated(woMetrics.billedValue)} exactValue={formatCurrency(woMetrics.billedValue)} icon={<Database />} />
            <KpiCard title="Receivables" value={formatCurrencyAbbreviated(woMetrics.receivables)} exactValue={formatCurrency(woMetrics.receivables)} icon={<AlertTriangle />} alert={woMetrics.receivables > 0} />
          </div>

          {/* Risk & Opportunity Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 border-danger/20 hover:border-danger/40 transition-colors">
              <h3 className="frost-text-subtle font-mono text-xs 2xl:text-sm uppercase tracking-widest text-danger mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> Risk Signals
              </h3>
              <ul className="space-y-3">
                {signals.risks.map((r: string, i: number) => (
                  <li key={i} className="text-sm 2xl:text-base text-zinc-300 flex items-start gap-2">
                    <span className="text-danger shrink-0 mt-0.5">⚠</span> {r}
                  </li>
                ))}
                {signals.risks.length === 0 && <li className="text-sm text-zinc-500">No critical risks identified.</li>}
              </ul>
            </div>
            <div className="glass-panel p-5 border-success/20 hover:border-success/40 transition-colors">
              <h3 className="frost-text-subtle font-mono text-xs 2xl:text-sm uppercase tracking-widest text-success mb-4 flex items-center gap-2">
                <Crosshair className="w-4 h-4" /> Opportunity Signals
              </h3>
              <ul className="space-y-3">
                {signals.opportunities.map((o: string, i: number) => (
                  <li key={i} className="text-sm 2xl:text-base text-zinc-300 flex items-start gap-2">
                    <span className="text-success shrink-0 mt-0.5">✓</span> {o}
                  </li>
                ))}
                {signals.opportunities.length === 0 && <li className="text-sm text-zinc-500">No critical opportunities identified.</li>}
              </ul>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5">
              <h3 className="frost-text-subtle font-mono text-xs 2xl:text-sm uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Pipeline by Sector
              </h3>
              <PipelineBySectorChart data={dealsMetrics.pipelineBySector} />
            </div>
            <div className="glass-panel p-5">
              <h3 className="frost-text-subtle font-mono text-xs 2xl:text-sm uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-accent" /> Work Order Execution
              </h3>
              <ExecutionStatusChart data={woMetrics.executionStatusDist} />
            </div>
            <div className="glass-panel p-5 md:col-span-2">
              <h3 className="frost-text-subtle font-mono text-xs 2xl:text-sm uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-secondary" /> Financial Execution (Global)
              </h3>
              <BillingCollectionChart billed={woMetrics.billedValue} collected={woMetrics.collectedValue} receivable={woMetrics.receivables} />
            </div>
          </div>

          {/* Sector Matrix */}
          <div className="glass-panel p-5 overflow-hidden">
            <h3 className="frost-text-subtle font-mono text-xs 2xl:text-sm uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> Sector Performance Matrix
            </h3>
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs 2xl:text-sm font-mono text-zinc-500 tracking-wider">
                    <th className="py-3 pr-4 font-medium">SECTOR</th>
                    <th className="py-3 px-4 font-medium text-right">PIPELINE</th>
                    <th className="py-3 px-4 font-medium text-right">COMPLETION</th>
                    <th className="py-3 px-4 font-medium text-right">BILLED</th>
                    <th className="py-3 pl-4 font-medium text-right text-warning">RECEIVABLE</th>
                  </tr>
                </thead>
                <tbody>
                  {sectorMatrix.slice(0, 8).map((sector: any) => (
                    <tr 
                      key={sector.sectorName} 
                      onClick={() => setSelectedSector(sector)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 pr-4 text-sm font-medium text-zinc-200 group-hover:text-primary transition-colors">{sector.sectorName}</td>
                      <td className="py-3 px-4 text-sm 2xl:text-base text-right font-mono text-zinc-300">{formatCurrencyAbbreviated(sector.pipeline)}</td>
                      <td className="py-3 px-4 text-sm 2xl:text-base text-right font-mono text-zinc-300">
                        <span className={clsx(sector.completionRate > 70 ? "text-success" : (sector.completionRate < 30 ? "text-danger" : ""))}>
                          {Math.round(sector.completionRate)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm 2xl:text-base text-right font-mono text-zinc-300">{formatCurrencyAbbreviated(sector.billed)}</td>
                      <td className="py-3 pl-4 text-sm 2xl:text-base text-right font-mono text-warning/90">{formatCurrencyAbbreviated(sector.receivable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Assistant (Sticky on Desktop) */}
        <div className="w-full xl:w-[40%] xl:sticky xl:top-[106px] flex flex-col glass-panel overflow-hidden border-white/5 shadow-2xl h-[500px] xl:max-h-[calc(100vh-138px)] xl:h-full">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="bg-panel-900/60 p-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md shrink-0">
            <h3 className="frost-text-subtle font-space font-semibold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Intelligence Assistant
            </h3>
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-6 scroll-smooth">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-6 max-w-sm mx-auto w-full">
                  <div className="w-16 h-16 rounded-2xl glass-shell flex items-center justify-center text-primary shadow-[0_0_30px_rgba(139,92,246,0.15)] relative">
                    <div className="absolute inset-0 rounded-2xl border border-primary/20 animate-pulse"></div>
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="frost-text-subtle text-lg 2xl:text-xl font-space font-medium text-zinc-300 text-center">Executive AI Analyst</h3>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    {[
                      "What is our total pipeline?", 
                      "Which sectors have strong pipeline but weak execution?", 
                      "Compare Mining and Infrastructure.",
                      "What are our biggest risks?"
                    ].map(q => (
                      <button 
                        key={q} 
                        onClick={() => submitChat(q)} 
                        className="text-left px-4 py-3 rounded-xl glass-shell hover:bg-white/10 hover:border-primary/40 transition-all text-xs md:text-sm 2xl:text-base text-zinc-300 group flex justify-between items-center"
                      >
                        <span className="line-clamp-1">{q}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
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
                    className={clsx("flex gap-3 max-w-[95%] md:max-w-[85%]", m.role === 'user' ? "ml-auto" : "mr-auto")}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 shrink-0 rounded-full glass-shell border-primary/30 flex items-center justify-center text-primary mt-1">
                        <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                      </div>
                    )}
                    <div className={clsx(
                      "p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed", 
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mr-auto max-w-[80%]">
                  <div className="w-7 h-7 shrink-0 rounded-full glass-shell border-primary/30 flex items-center justify-center text-primary mt-1">
                    <Loader2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl glass-shell bg-panel-800/80 rounded-tl-sm flex items-center gap-2 h-[52px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse delay-75"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 bg-panel-900/90 border-t border-white/5 backdrop-blur-xl">
            <div className="relative flex items-center">
              <input
                className="w-full bg-panel-800/80 border border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-panel-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm 2xl:text-base placeholder:text-zinc-500 transition-all font-inter shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI Analyst..."
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 aspect-square h-[calc(100%-12px)] flex items-center justify-center bg-white/10 hover:bg-primary disabled:opacity-30 disabled:hover:bg-white/10 text-white rounded-lg transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>

      {/* Sector Deep Dive Modal */}
      <AnimatePresence>
        {selectedSector && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian-900/80 backdrop-blur-sm flex items-center justify-center p-4" 
            onClick={() => setSelectedSector(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-elevated max-w-lg w-full p-6 border-white/10 flex flex-col gap-6 relative overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
              
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-space font-bold text-zinc-100 flex items-center gap-2">
                    {selectedSector.sectorName}
                  </h2>
                  <p className="text-xs 2xl:text-sm font-mono text-zinc-500 uppercase tracking-widest mt-1">Sector Deep Dive</p>
                </div>
                <button onClick={() => setSelectedSector(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400 tracking-wider mb-1">PIPELINE</div>
                  <div className="text-lg font-space font-bold text-zinc-100">{formatCurrencyAbbreviated(selectedSector.pipeline)}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400 tracking-wider mb-1">WEIGHTED PIPELINE</div>
                  <div className="text-lg font-space font-bold text-primary">{formatCurrencyAbbreviated(selectedSector.weightedPipeline)}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400 tracking-wider mb-1">WORK ORDERS</div>
                  <div className="text-lg font-space font-bold text-zinc-100">{selectedSector.workOrderCount}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400 tracking-wider mb-1">COMPLETION RATE</div>
                  <div className="text-lg font-space font-bold text-accent">{Math.round(selectedSector.completionRate)}%</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400 tracking-wider mb-1">BILLED</div>
                  <div className="text-lg font-space font-bold text-zinc-100">{formatCurrencyAbbreviated(selectedSector.billed)}</div>
                </div>
                <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
                  <div className="text-[10px] font-mono text-warning tracking-wider mb-1">RECEIVABLE</div>
                  <div className="text-lg font-space font-bold text-warning">{formatCurrencyAbbreviated(selectedSector.receivable)}</div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-primary font-space font-semibold mb-2">
                  <Sparkles className="w-4 h-4" /> Analyst Assessment
                </div>
                <p className="text-sm 2xl:text-base text-zinc-300 leading-relaxed font-inter">
                  {selectedSector.pipeline > 50000000 ? "This sector shows exceptional pipeline momentum. " : "Moderate pipeline volume. "}
                  {selectedSector.completionRate < 40 ? "However, work order completion is lagging significantly. " : "Execution efficiency is stable. "}
                  {selectedSector.receivable > 5000000 ? "Warning: High receivable exposure requires immediate collection efforts." : "Receivable exposure is currently within manageable limits."}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Methodology Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-obsidian-900/80 backdrop-blur-sm flex items-center justify-center p-4" 
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
              
              <div className="space-y-6 text-sm 2xl:text-base text-zinc-300 leading-relaxed font-inter max-h-[60vh] overflow-y-auto pr-2">
                <section>
                  <h3 className="frost-text-subtle font-mono text-xs text-primary uppercase tracking-widest mb-2">Source of Truth</h3>
                  <p className="bg-white/5 p-3 rounded-lg border border-white/5">Live Monday.com API. Both boards (Deals & Work Orders) are read-only and queried symmetrically.</p>
                </section>
                <section>
                  <h3 className="frost-text-subtle font-mono text-xs text-primary uppercase tracking-widest mb-2">Deterministic Engine</h3>
                  <p>Financial totals, pipelines, and distributions are calculated using strict TypeScript logic. The LLM acts purely as a narrative interface and never performs independent math.</p>
                </section>
                <section>
                  <h3 className="frost-text-subtle font-mono text-xs text-primary uppercase tracking-widest mb-2">Data Resilience</h3>
                  <p>Invalid strings, unparseable currencies, and text units (e.g. <code>"5360 HA"</code>) are aggressively cleaned. Unparseable rows are explicitly omitted from specific aggregates and flagged.</p>
                </section>
                <section>
                  <h3 className="frost-text-subtle font-mono text-xs text-primary uppercase tracking-widest mb-2">Evidence & Signals</h3>
                  <p>The AI provides an exact <strong>Evidence Bundle</strong> with every numerical answer to prevent hallucination. Risk and opportunity signals are programmatically determined based on execution velocity and receivable ratios.</p>
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

function PieChartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  );
}

function KpiCard({ title, value, exactValue, icon, alert, highlight }: { title: string, value: string | number, exactValue?: string, icon: React.ReactNode, alert?: boolean, highlight?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={clsx(
        "glass-panel p-4 lg:p-5 2xl:p-6 flex flex-col gap-3 2xl:gap-4 relative group transition-colors",
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
          "p-1.5 rounded-md shrink-0", 
          alert ? "bg-warning/10 text-warning" : (highlight ? "bg-primary/10 text-primary" : "bg-white/5 text-zinc-300")
        )}>
          <div className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 flex items-center justify-center">{icon}</div>
        </div>
        <span className="text-[10px] md:text-xs 2xl:text-sm font-mono font-medium uppercase tracking-wider truncate" title={title}>{title}</span>
      </div>
      
      <div 
        className={clsx(
          "text-xl md:text-2xl 2xl:text-4xl font-space font-bold tracking-tight truncate",
          highlight ? "text-gradient-primary" : (alert ? "text-warning" : "text-zinc-100")
        )} 
        title={exactValue || String(value)}
      >
        {value}
      </div>
    </motion.div>
  );
}
