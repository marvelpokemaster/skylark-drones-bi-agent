export interface NormalizedDeal {
  id: string;
  name: string;
  ownerCode: string | null;
  clientCode: string | null;
  dealStatus: string | null;
  closureProbability: string | null;
  probabilityValue: number; // 0.0 to 1.0 (High=0.8, Medium=0.5, Low=0.2)
  dealValue: number | null;
  tentativeCloseDate: Date | null;
  dealStage: string | null;
  productDeal: string | null;
  sector: string | null;
  createdDate: Date | null;
}

export interface NormalizedWorkOrder {
  id: string;
  name: string;
  customerNameCode: string | null;
  dealCode: string | null;
  natureOfWork: string | null;
  executionStatus: string | null;
  dataDeliveryDate: Date | null;
  dateOfPoLoi: Date | null;
  documentType: string | null;
  probableStartDate: Date | null;
  probableEndDate: Date | null;
  ownerCode: string | null;
  sector: string | null;
  typeOfWork: string | null;
  amountExclGst: number | null;
  amountInclGst: number | null;
  billedValueExclGst: number | null;
  billedValueInclGst: number | null;
  collectedAmount: number | null;
  amountToBeBilledExclGst: number | null;
  amountToBeBilledInclGst: number | null;
  amountReceivable: number | null;
  quantityByOps: number | null;
  quantityAsPerPo: number | null;
  quantityBilled: number | null;
  balanceQuantity: number | null;
  invoiceStatus: string | null;
  expectedBillingMonth: string | null;
  actualBillingMonth: string | null;
  actualCollectionMonth: string | null;
  woStatusBilled: string | null;
  collectionStatus: string | null;
  billingStatus: string | null;
}

export interface MondayCache {
  deals: NormalizedDeal[];
  workOrders: NormalizedWorkOrder[];
  lastUpdated: Date;
}
