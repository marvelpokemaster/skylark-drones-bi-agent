import { NormalizedDeal, NormalizedWorkOrder } from '../monday/types';

export function calculateCrossBoardAnalytics(deals: NormalizedDeal[], workOrders: NormalizedWorkOrder[]) {
  const sectors = new Set([
    ...deals.map(d => d.sector).filter(Boolean),
    ...workOrders.map(w => w.sector).filter(Boolean)
  ]);
  
  const sectorComparison: Record<string, any> = {};
  
  for (const s of Array.from(sectors)) {
    const sectorStr = s as string;
    const sDeals = deals.filter(d => d.sector === sectorStr);
    const sWO = workOrders.filter(w => w.sector === sectorStr);
    
    let pipeline = 0;
    sDeals.forEach(d => { if (d.dealValue) pipeline += d.dealValue; });
    
    let billed = 0;
    let collected = 0;
    let receivables = 0;
    
    sWO.forEach(w => {
      if (w.billedValueInclGst) billed += w.billedValueInclGst;
      if (w.collectedAmount) collected += w.collectedAmount;
      if (w.amountReceivable) receivables += w.amountReceivable;
    });
    
    sectorComparison[sectorStr] = {
      pipeline,
      billed,
      collected,
      receivables,
      dealsCount: sDeals.length,
      workOrdersCount: sWO.length
    };
  }
  
  return {
    sectorComparison
  };
}
