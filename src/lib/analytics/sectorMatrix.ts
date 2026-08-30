import { NormalizedDeal, NormalizedWorkOrder } from '../monday/types';
import { calculateDealsAnalytics } from './deals';
import { calculateWorkOrdersAnalytics } from './workOrders';

export interface SectorPerformance {
  sectorName: string;
  pipeline: number;
  weightedPipeline: number;
  dealCount: number;
  workOrderCount: number;
  completedWorkOrders: number;
  completionRate: number;
  billed: number;
  collected: number;
  receivable: number;
}

export function buildSectorMatrix(deals: NormalizedDeal[], workOrders: NormalizedWorkOrder[]): SectorPerformance[] {
  const map: Record<string, SectorPerformance> = {};

  const getOrCreate = (sector: string) => {
    if (!map[sector]) {
      map[sector] = {
        sectorName: sector,
        pipeline: 0,
        weightedPipeline: 0,
        dealCount: 0,
        workOrderCount: 0,
        completedWorkOrders: 0,
        completionRate: 0,
        billed: 0,
        collected: 0,
        receivable: 0
      };
    }
    return map[sector];
  };

  deals.forEach(deal => {
    const s = getOrCreate(deal.sector || 'Unknown');
    s.dealCount++;
    if (deal.dealValue !== null) {
      s.pipeline += deal.dealValue;
      s.weightedPipeline += (deal.dealValue * deal.probabilityValue);
    }
  });

  workOrders.forEach(wo => {
    const s = getOrCreate(wo.sector || 'Unknown');
    s.workOrderCount++;
    
    const status = wo.executionStatus || '';
    if (status.toLowerCase().includes('completed') || status.toLowerCase().includes('executed until current')) {
      s.completedWorkOrders++;
    }

    if (wo.billedValueInclGst !== null) s.billed += wo.billedValueInclGst;
    if (wo.collectedAmount !== null) s.collected += wo.collectedAmount;
    if (wo.amountReceivable !== null) s.receivable += wo.amountReceivable;
  });

  // Calculate completion rates
  return Object.values(map)
    .filter(s => s.sectorName !== 'Unknown' && s.sectorName !== '')
    .map(s => ({
      ...s,
      completionRate: s.workOrderCount > 0 ? (s.completedWorkOrders / s.workOrderCount) * 100 : 0
    }))
    .sort((a, b) => b.pipeline - a.pipeline);
}

export function calculateRiskOpportunitySignals(sectorMatrix: SectorPerformance[]) {
  const risks: string[] = [];
  const opportunities: string[] = [];

  // Sort sectors by pipeline
  const topPipeline = [...sectorMatrix].sort((a, b) => b.pipeline - a.pipeline);
  const topReceivables = [...sectorMatrix].sort((a, b) => b.receivable - a.receivable);
  
  if (topReceivables[0] && topReceivables[0].receivable > 0) {
    risks.push(`High receivables concentration in ${topReceivables[0].sectorName} sector.`);
  }

  topPipeline.slice(0, 2).forEach(sector => {
    if (sector.completionRate < 30 && sector.workOrderCount > 5) {
      risks.push(`${sector.sectorName} has strong pipeline but low work order completion rate (${Math.round(sector.completionRate)}%).`);
    } else if (sector.completionRate > 75) {
      opportunities.push(`${sector.sectorName} shows strong execution efficiency alongside healthy pipeline.`);
    }
  });

  const highCollectionGap = sectorMatrix.find(s => s.billed > 0 && (s.collected / s.billed) < 0.3 && s.receivable > 10000000);
  if (highCollectionGap) {
    risks.push(`${highCollectionGap.sectorName} has a significant gap between billed value and actual collections.`);
  }

  if (topPipeline[0] && topPipeline[0].weightedPipeline > 50000000) {
    opportunities.push(`Massive weighted pipeline opportunity in ${topPipeline[0].sectorName}.`);
  }

  return { risks, opportunities };
}
