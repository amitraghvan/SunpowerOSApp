import { PricingService } from '../../apps/api/src/modules/quotations/pricing.service';

describe('Phase 2 — Cost Estimation, Margins, Subsidy & Tax Pricing Engine', () => {
  let pricingService: PricingService;

  beforeEach(() => {
    pricingService = new PricingService();
  });

  it('should calculate direct costs, overhead margin, and profit margin accurately', () => {
    const result = pricingService.calculatePricing({
      systemCapacityKw: 5.0,
      totalMaterialCost: 180000.0,
      overheadMarginPercent: 5.0,
      profitMarginPercent: 15.0,
    });

    // Material: 180,000
    // Labor: 5 * 2500 = 12,500
    // Transport: min(5000, max(1500, 5 * 600 = 3000)) = 3,000
    // Engineering: 5 * 2000 = 10,000
    // Statutory: 4,500
    // Subtotal: 180,000 + 12,500 + 3,000 + 10,000 + 4,500 = 210,000
    expect(result.estimate.subtotalCost).toBe(210000.0);

    // Margins: 1 + (0.05 + 0.15) = 1.20
    // Base Selling Price: 210,000 * 1.20 = 252,000
    expect(result.estimate.baseSellingPrice).toBe(252000.0);
    expect(result.estimate.finalSellingPrice).toBe(252000.0);
  });

  it('should calculate composite Indian GST correctly (70% Goods @ 12% + 30% Services @ 18% = 13.8%)', () => {
    const result = pricingService.calculatePricing({
      systemCapacityKw: 5.0,
      totalMaterialCost: 180000.0,
    });

    const finalPrice = result.estimate.finalSellingPrice;
    // Goods taxable = 70% of 252,000 = 176,400 -> GST @ 12% = 21,168
    // Services taxable = 30% of 252,000 = 75,600 -> GST @ 18% = 13,608
    // Total GST = 21,168 + 13,608 = 34,776 (Exact 13.8% of 252,000)
    expect(result.taxBreakdown.equipmentGstAmount).toBe(21168.0);
    expect(result.taxBreakdown.servicesGstAmount).toBe(13608.0);
    expect(result.taxBreakdown.totalTaxAmount).toBe(34776.0);
    expect(result.taxBreakdown.effectiveTaxRatePercent).toBe(13.8);
    expect(result.grandTotal).toBe(286776.0);
  });

  it('should apply Central Government PM Surya Ghar subsidy tiers accurately', () => {
    // 1 kW system -> 30,000 INR subsidy
    const res1kw = pricingService.calculatePricing({
      systemCapacityKw: 1.0,
      totalMaterialCost: 40000.0,
      isSubsidyEligible: true,
    });
    expect(res1kw.estimate.estSubsidyAmount).toBe(30000);

    // 2 kW system -> 60,000 INR subsidy
    const res2kw = pricingService.calculatePricing({
      systemCapacityKw: 2.0,
      totalMaterialCost: 80000.0,
      isSubsidyEligible: true,
    });
    expect(res2kw.estimate.estSubsidyAmount).toBe(60000);

    // 3 kW to 5 kW system -> Capped at 78,000 INR subsidy
    const res5kw = pricingService.calculatePricing({
      systemCapacityKw: 5.0,
      totalMaterialCost: 180000.0,
      isSubsidyEligible: true,
    });
    expect(res5kw.estimate.estSubsidyAmount).toBe(78000);

    // Net customer payable = grand total - subsidy
    expect(res5kw.netCustomerPayable).toBe(res5kw.grandTotal - 78000);
  });

  it('should apply custom discounts and adjust margins and tax correctly', () => {
    const result = pricingService.calculatePricing({
      systemCapacityKw: 5.0,
      totalMaterialCost: 180000.0,
      discountPercent: 5.0, // 5% discount
    });

    const basePrice = result.estimate.baseSellingPrice; // 252,000
    const expectedDiscount = 252000 * 0.05; // 12,600
    expect(result.estimate.discountAmount).toBe(expectedDiscount);
    expect(result.estimate.finalSellingPrice).toBe(252000 - expectedDiscount); // 239,400
  });
});
