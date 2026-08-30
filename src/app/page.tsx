import { getMondayData } from '@/lib/monday/client';
import { calculateDealsAnalytics } from '@/lib/analytics/deals';
import { calculateWorkOrdersAnalytics } from '@/lib/analytics/workOrders';
import Dashboard from '@/components/Dashboard';

export const revalidate = 300; // revalidate every 5 mins

export default async function Page() {
  let initialData = null;
  let dealsMetrics = null;
  let woMetrics = null;
  let error = null;

  try {
    initialData = await getMondayData();
    dealsMetrics = calculateDealsAnalytics(initialData.deals);
    woMetrics = calculateWorkOrdersAnalytics(initialData.workOrders);
  } catch (err: any) {
    console.error("Failed to load initial data:", err);
    error = err.message;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-blue-900/50">
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Skylark Intelligence
            </h1>
            <p className="text-sm text-slate-400 font-medium">CONVERSATIONAL BI · DEALS & WORK ORDERS</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3 text-sm">
            {/* We will handle refresh on client side */}
          </div>
        </header>

        {error ? (
          <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-xl">
            <h2 className="text-red-400 font-semibold mb-2">Error Loading Data</h2>
            <p className="text-red-200/70">{error}</p>
          </div>
        ) : (
          <Dashboard 
            dealsMetrics={dealsMetrics} 
            woMetrics={woMetrics} 
            lastUpdated={initialData?.lastUpdated}
          />
        )}
      </div>
    </main>
  );
}
