import { NormalizedDeal, NormalizedWorkOrder } from './types';

// Utility for cleaning text fields
function cleanText(text: string | null | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'n/a' || trimmed === '-') return null;
  return trimmed;
}

// Resilient number parser (handles currency commas, unit strings like "5360 HA")
function parseResilientNumber(text: string | null | undefined): number | null {
  const cleaned = cleanText(text);
  if (!cleaned) return null;
  
  // Extract first sequence of numbers, commas, and decimals
  // E.g. "5360 HA" -> "5360", "$2,000.50" -> "2000.50"
  const match = cleaned.match(/[-+]?[\d,]*\.?\d+/);
  if (!match) return null;
  
  const numericString = match[0].replace(/,/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? null : parsed;
}

// Resilient date parser
function parseDate(text: string | null | undefined): Date | null {
  const cleaned = cleanText(text);
  if (!cleaned) return null;
  
  // Try normal Date parsing
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;
  
  // If Excel numerical date strings exist, we could handle them, 
  // but Monday seems to output GMT strings or ISO strings.
  const numericDate = Number(cleaned);
  if (!isNaN(numericDate) && numericDate > 10000) { // arbitrary threshold for excel date serials vs raw ms
    // Excel date (days since 1900-01-01)
    const excelEpoch = new Date(1899, 11, 30);
    excelEpoch.setDate(excelEpoch.getDate() + numericDate);
    if (!isNaN(excelEpoch.getTime())) return excelEpoch;
  }
  return null;
}

// Map Probability String to value
function getProbabilityValue(prob: string | null): number {
  if (!prob) return 0;
  const lower = prob.toLowerCase();
  if (lower.includes('high')) return 0.8;
  if (lower.includes('medium')) return 0.5;
  if (lower.includes('low')) return 0.2;
  const numeric = parseResilientNumber(prob);
  if (numeric !== null) {
    if (numeric > 1) return numeric / 100.0; // 80 -> 0.8
    return numeric;
  }
  return 0; // Unknown
}

export function normalizeDeal(item: any): NormalizedDeal {
  // Convert column_values array to dictionary for easy access
  const vals: Record<string, string> = {};
  for (const cv of (item.column_values || [])) {
    if (cv.text) vals[cv.id] = cv.text;
  }

  const probStr = cleanText(vals['text_mm6qzje9']);
  
  return {
    id: item.id,
    name: cleanText(item.name) || 'Unknown Deal',
    ownerCode: cleanText(vals['text_mm6q7d7a']),
    clientCode: cleanText(vals['text_mm6qw5fp']),
    dealStatus: cleanText(vals['text_mm6qd34m']),
    closureProbability: probStr,
    probabilityValue: getProbabilityValue(probStr),
    dealValue: parseResilientNumber(vals['text_mm6qxntj']),
    tentativeCloseDate: parseDate(vals['text_mm6qfpqd']),
    dealStage: cleanText(vals['text_mm6q5ch7']),
    productDeal: cleanText(vals['text_mm6qzxwe']),
    sector: cleanText(vals['text_mm6qs3gh']),
    createdDate: parseDate(vals['text_mm6qbxf5']),
  };
}

export function normalizeWorkOrder(item: any): NormalizedWorkOrder {
  const vals: Record<string, string> = {};
  for (const cv of (item.column_values || [])) {
    if (cv.text) vals[cv.id] = cv.text;
  }

  return {
    id: item.id,
    name: cleanText(item.name) || 'Unknown WO',
    customerNameCode: cleanText(vals['text_mm6qqbx0']),
    dealCode: cleanText(vals['text_mm6q6kqz']),
    natureOfWork: cleanText(vals['text_mm6qak6j']),
    executionStatus: cleanText(vals['text_mm6q9mk4']),
    dataDeliveryDate: parseDate(vals['text_mm6qrcry']),
    dateOfPoLoi: parseDate(vals['text_mm6qggb5']),
    documentType: cleanText(vals['text_mm6qemzh']),
    probableStartDate: parseDate(vals['text_mm6qe9vz']),
    probableEndDate: parseDate(vals['text_mm6q2n1b']),
    ownerCode: cleanText(vals['text_mm6q9z7n']),
    sector: cleanText(vals['text_mm6qqznj']),
    typeOfWork: cleanText(vals['text_mm6q49aj']),
    amountExclGst: parseResilientNumber(vals['text_mm6qkc7m']),
    amountInclGst: parseResilientNumber(vals['text_mm6qn081']),
    billedValueExclGst: parseResilientNumber(vals['text_mm6q8dhw']),
    billedValueInclGst: parseResilientNumber(vals['text_mm6qxnwd']),
    collectedAmount: parseResilientNumber(vals['text_mm6q5xzx']),
    amountToBeBilledExclGst: parseResilientNumber(vals['text_mm6qj4ya']),
    amountToBeBilledInclGst: parseResilientNumber(vals['text_mm6qh4sj']),
    amountReceivable: parseResilientNumber(vals['text_mm6qfmd5']),
    quantityByOps: parseResilientNumber(vals['text_mm6q27b5']),
    quantityAsPerPo: parseResilientNumber(vals['text_mm6qe2en']),
    quantityBilled: parseResilientNumber(vals['text_mm6qq20q']),
    balanceQuantity: parseResilientNumber(vals['text_mm6q65es']),
    invoiceStatus: cleanText(vals['text_mm6qwfy1']),
    expectedBillingMonth: cleanText(vals['text_mm6qdy1m']),
    actualBillingMonth: cleanText(vals['text_mm6qdaba']),
    actualCollectionMonth: cleanText(vals['text_mm6qawy4']),
    woStatusBilled: cleanText(vals['text_mm6qmc51']),
    collectionStatus: cleanText(vals['text_mm6qk4rh']),
    billingStatus: cleanText(vals['text_mm6q9ds2']),
  };
}
