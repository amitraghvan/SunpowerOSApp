import { Injectable, Logger } from '@nestjs/common';
import { CostEstimateDto, TaxBreakdownDto } from '@solaros/types';

export interface PricingCalculationInput {
  systemCapacityKw: number;
  totalMaterialCost: number;
  isSubsidyEligible?: boolean;
  overheadMarginPercent?: number; // Default 5%
  profitMarginPercent?: number;   // Default 15%
  discountPercent?: number;       // Default 0%
  customDiscountAmount?: number;
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  /**
   * Calculates comprehensive cost estimate, margins, commercial pricing,
   * PM Surya Ghar subsidy, and Indian GST split
   */
  calculatePricing(input: PricingCalculationInput): {
    estimate: CostEstimateDto;
    taxBreakdown: TaxBreakdownDto;
    grandTotal: number;
    netCustomerPayable: number;
  } {
    const capacityKw = Math.max(1, input.systemCapacityKw);
    const materialCost = Number(input.totalMaterialCost.toFixed(2));

    // Direct installation & operational costs
    const laborCost = Number((capacityKw * 2500).toFixed(2));
    const transportCost = Number(Math.min(5000, Math.max(1500, capacityKw * 600)).toFixed(2));
    const engineeringServicesCost = Number((capacityKw * 2000).toFixed(2));
    const statutoryFees = 4500.0; // DISCOM & CEIG application fees

    const subtotalCost = Number(
      (materialCost + laborCost + transportCost + engineeringServicesCost + statutoryFees).toFixed(2),
    );

    const overheadPct = input.overheadMarginPercent ?? 5.0;
    const profitPct = input.profitMarginPercent ?? 15.0;

    // Base selling price before discount
    const totalMarginMultiplier = 1 + (overheadPct + profitPct) / 100.0;
    const baseSellingPrice = Number((subtotalCost * totalMarginMultiplier).toFixed(2));

    // Discount handling
    let discountPercent = input.discountPercent ?? 0;
    let discountAmount = 0;
    if (input.customDiscountAmount && input.customDiscountAmount > 0) {
      discountAmount = Number(input.customDiscountAmount.toFixed(2));
      discountPercent = Number(((discountAmount / baseSellingPrice) * 100).toFixed(2));
    } else if (discountPercent > 0) {
      discountAmount = Number(((baseSellingPrice * discountPercent) / 100.0).toFixed(2));
    }

    const finalSellingPrice = Number((baseSellingPrice - discountAmount).toFixed(2));

    // Indian GST Calculation (70% Goods @ 12% + 30% Services @ 18% = 13.8% composite)
    const goodsTaxable = Number((finalSellingPrice * 0.70).toFixed(2));
    const servicesTaxable = Number((finalSellingPrice * 0.30).toFixed(2));

    const equipmentGstAmount = Number(((goodsTaxable * 12.0) / 100.0).toFixed(2));
    const servicesGstAmount = Number(((servicesTaxable * 18.0) / 100.0).toFixed(2));
    const totalTaxAmount = Number((equipmentGstAmount + servicesGstAmount).toFixed(2));
    const effectiveTaxRatePercent = Number(((totalTaxAmount / finalSellingPrice) * 100).toFixed(2));

    const grandTotal = Number((finalSellingPrice + totalTaxAmount).toFixed(2));

    // PM Surya Ghar: Muft Bijli Yojana Central Government Subsidy Scheme (Residential)
    // 1 kW = 30,000 INR
    // 2 kW = 60,000 INR
    // >= 3 kW = 78,000 INR (capped at 78,000)
    let estSubsidyAmount = 0;
    const isSubsidyEligible = input.isSubsidyEligible ?? true;
    if (isSubsidyEligible) {
      if (capacityKw <= 1.2) {
        estSubsidyAmount = 30000;
      } else if (capacityKw <= 2.2) {
        estSubsidyAmount = 60000;
      } else {
        estSubsidyAmount = 78000;
      }
    }

    const netCustomerPayable = Number(Math.max(0, grandTotal - estSubsidyAmount).toFixed(2));

    const estimate: CostEstimateDto = {
      materialCost,
      laborCost,
      transportCost,
      engineeringServicesCost,
      statutoryFees,
      subtotalCost,
      overheadMarginPercent: overheadPct,
      profitMarginPercent: profitPct,
      baseSellingPrice,
      discountPercent,
      discountAmount,
      finalSellingPrice,
      isSubsidyEligible,
      estSubsidyAmount,
      netPayableByCustomer: netCustomerPayable,
    };

    const taxBreakdown: TaxBreakdownDto = {
      taxableAmount: finalSellingPrice,
      equipmentGstPercent: 12.0,
      equipmentGstAmount,
      servicesGstPercent: 18.0,
      servicesGstAmount,
      totalTaxAmount,
      effectiveTaxRatePercent,
    };

    return {
      estimate,
      taxBreakdown,
      grandTotal,
      netCustomerPayable,
    };
  }
}
