import { getMondayData } from '@/lib/monday/client';
import { calculateDealsAnalytics } from '@/lib/analytics/deals';
import { calculateWorkOrdersAnalytics } from '@/lib/analytics/workOrders';
import { buildSectorMatrix, calculateRiskOpportunitySignals } from '@/lib/analytics/sectorMatrix';
import Dashboard from '@/components/Dashboard';
import { Database, Activity } from 'lucide-react';

export const revalidate = 300; // revalidate every 5 mins

export default async function Page() {
  let initialData = null;
  let dealsMetrics = null;
  let woMetrics = null;
  let sectorMatrix = null;
  let signals = null;
  let error = null;

  try {
    initialData = await getMondayData();
    dealsMetrics = calculateDealsAnalytics(initialData.deals);
    woMetrics = calculateWorkOrdersAnalytics(initialData.workOrders);
    sectorMatrix = buildSectorMatrix(initialData.deals, initialData.workOrders);
    signals = calculateRiskOpportunitySignals(sectorMatrix);
  } catch (err: any) {
    console.error("Failed to load initial data:", err);
    error = err.message;
  }

  return (
    <main className="min-h-screen flex flex-col font-inter">
      {/* HUD Header */}
      <header className="glass-shell sticky top-0 z-40 px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-space font-bold tracking-tight text-gradient-primary relative group cursor-default">
              Skylark Intelligence
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none mix-blend-overlay"></div>
            </h1>
            <p className="text-[10px] md:text-xs font-mono text-zinc-400 font-medium tracking-widest uppercase">
              Conversational BI · Deals & Work Orders
            </p>
          </div>
        </div>

        {/* Status HUD */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </div>
            <span className="text-zinc-300">LIVE DATA</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 opacity-80" title="System Status: Optimal">
              <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_5px_theme(colors.success)]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_theme(colors.primary)] animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_5px_theme(colors.accent)]"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {error ? (
          <div className="glass-panel border-danger/30 p-6">
            <h2 className="text-danger font-space font-semibold mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Critical Error
            </h2>
            <p className="text-zinc-400 font-mono text-sm">{error}</p>
          </div>
        ) : (
          <Dashboard 
            dealsMetrics={dealsMetrics} 
            woMetrics={woMetrics}
            sectorMatrix={sectorMatrix}
            signals={signals}
            lastUpdated={initialData?.lastUpdated}
          />
        )}
      </div>
    </main>
  );
}
