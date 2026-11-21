# SolarOS Battery Storage Sizing Methodology

## 1. Principles of Storage Engineering

In Off-Grid and Hybrid configurations, the battery bank must store sufficient energy to support designated critical loads through nighttime hours and periods of solar autonomy.

## 2. Mathematical Formulation

1. **Daily Backup Consumption:**
   $$E_{\text{backup}} = P_{\text{load,avg}} \times t_{\text{hours}} \text{ (kWh)}$$

2. **Total Storage Capacity ($E_{\text{storage}}$):**
   $$E_{\text{storage}} = \frac{E_{\text{backup}} \times N_{\text{autonomy}}}{\text{DoD} \times \eta_{\text{battery}} \times \eta_{\text{inverter}}}$$
   - **DoD (Depth of Discharge):** 80% for Lithium Ferro Phosphate (LiFePO₄); 50% for Tubular Lead-Acid.
   - **$\eta_{\text{battery}}$ (Round-Trip Efficiency):** 95% (LiFePO₄) or 85% (Lead-Acid).
   - **$\eta_{\text{inverter}}$:** 95%.

3. **Ampere-Hour (Ah) Sizing at 48V DC Bus:**
   $$\text{Capacity}_{\text{Ah}} = \frac{E_{\text{storage}} \times 1000}{V_{\text{system,DC}}}$$
   Example: For a 5 kWh backup bank at 48V nominal:
   $$\text{Capacity}_{\text{Ah}} = \frac{5000}{48} \approx 104\text{ Ah}$$
