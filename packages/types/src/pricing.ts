export interface CostEstimateDto {
  materialCost: number;
  laborCost: number;
  transportCost: number;
  engineeringServicesCost: number;
  statutoryFees: number;
  subtotalCost: number;
  overheadMarginPercent: number;
  profitMarginPercent: number;
  baseSellingPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalSellingPrice: number;
  isSubsidyEligible: boolean;
  estSubsidyAmount: number;
  netPayableByCustomer: number;
}

export interface TaxBreakdownDto {
  taxableAmount: number;
  equipmentGstPercent: number;
  equipmentGstAmount: number;
  servicesGstPercent: number;
  servicesGstAmount: number;
  totalTaxAmount: number;
  effectiveTaxRatePercent: number;
}
