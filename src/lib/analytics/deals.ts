import { NormalizedDeal } from '../monday/types';

export function calculateDealsAnalytics(deals: NormalizedDeal[]) {
  const totalDeals = deals.length;
  let openDeals = 0;
  let closedWonDeals = 0;
  let closedLostDeals = 0;
  let pipelineValue = 0;
  let weightedPipeline = 0;
  let invalidValueCount = 0;

  const pipelineByStage: Record<string, number> = {};
  const pipelineBySector: Record<string, number> = {};
  
  deals.forEach(deal => {
    // Status counting
    const status = (deal.dealStatus || '').toLowerCase();
    if (status.includes('open')) openDeals++;
    else if (status.includes('won') || status.includes('completed')) closedWonDeals++;
    else if (status.includes('lost') || status.includes('cancelled')) closedLostDeals++;
    
    // Value counting
    const val = deal.dealValue;
    if (val !== null) {
      pipelineValue += val;
      weightedPipeline += (val * deal.probabilityValue);
      
      const stage = deal.dealStage || 'Unknown Stage';
      pipelineByStage[stage] = (pipelineByStage[stage] || 0) + val;
      
      const sector = deal.sector || 'Unknown Sector';
      pipelineBySector[sector] = (pipelineBySector[sector] || 0) + val;
    } else {
      invalidValueCount++;
    }
  });

  return {
    totalDeals,
    openDeals,
    closedWonDeals,
    closedLostDeals,
    pipelineValue,
    weightedPipeline,
    pipelineByStage,
    pipelineBySector,
    dataQuality: {
      invalidValueCount,
      validValueCount: totalDeals - invalidValueCount
    }
  };
}
