# SolarOS Pricing, Costing & Margin Architecture

## 1. Cost Build-Up Model

The Pricing Service (`apps/api/src/modules/quotations/pricing.service.ts`) establishes transparent, defensible costing for every solar installation:

```
Direct Material Cost (BOM Snapshot)
+ Direct Labor & Installation Cost
+ Transport & Site Freight
+ Technical Engineering & SLD Fee
+ Statutory Discom Net Metering Fees
====================================
= Direct EPC Base Cost
+ Operating Overheads (5.0%)
+ Enterprise Margin (15.0%)
- Commercial Discount (%)
====================================
= Final Base Selling Price
+ Composite Indian GST (13.8%)
- PM Surya Ghar Central Subsidy
====================================
= Net Customer Payable Amount
```

## 2. Multi-Tiered Subsidy Calculation

The engine natively encodes Central Government subsidy slabs under the **PM Surya Ghar: Muft Bijli Yojana**:

- **$\le 1\text{ kW}$:** ₹30,000 flat subsidy.
- **$> 1\text{ kW}$ and $\le 2\text{ kW}$:** ₹60,000 flat subsidy.
- **$\ge 3\text{ kW}$:** ₹78,000 maximum capped subsidy.
- **Commercial / Industrial:** ₹0 (not eligible for residential DBT subsidy).
