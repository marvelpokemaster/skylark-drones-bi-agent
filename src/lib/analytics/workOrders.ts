import { NormalizedWorkOrder } from '../monday/types';

export function calculateWorkOrdersAnalytics(workOrders: NormalizedWorkOrder[]) {
  const totalWorkOrders = workOrders.length;
  let completedWorkOrders = 0;
  let activeWorkOrders = 0;
  
  let billedValue = 0;
  let invalidBilledValueCount = 0;
  
  let collectedValue = 0;
  let invalidCollectedValueCount = 0;
  
  let receivables = 0;
  let invalidReceivablesCount = 0;

  const executionStatusDist: Record<string, number> = {};
  const sectorDist: Record<string, number> = {};

  workOrders.forEach(wo => {
    // Status
    const status = wo.executionStatus || 'Unknown';
    executionStatusDist[status] = (executionStatusDist[status] || 0) + 1;
    
    if (status.toLowerCase().includes('completed') || status.toLowerCase().includes('executed until current')) {
      completedWorkOrders++;
    } else if (status.toLowerCase().includes('open') || status.toLowerCase().includes('in progress')) {
      activeWorkOrders++;
    }
    
    // Sector
    const sector = wo.sector || 'Unknown Sector';
    sectorDist[sector] = (sectorDist[sector] || 0) + 1;
    
    // Financials
    if (wo.billedValueInclGst !== null) {
      billedValue += wo.billedValueInclGst;
    } else {
      invalidBilledValueCount++;
    }
    
    if (wo.collectedAmount !== null) {
      collectedValue += wo.collectedAmount;
    } else {
      invalidCollectedValueCount++;
    }
    
    if (wo.amountReceivable !== null) {
      receivables += wo.amountReceivable;
    } else {
      invalidReceivablesCount++;
    }
  });

  return {
    totalWorkOrders,
    completedWorkOrders,
    activeWorkOrders,
    billedValue,
    collectedValue,
    receivables,
    executionStatusDist,
    sectorDist,
    dataQuality: {
      invalidBilledValueCount,
      invalidCollectedValueCount,
      invalidReceivablesCount
    }
  };
}
