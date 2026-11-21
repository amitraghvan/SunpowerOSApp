# SolarOS Solar Technical Calculation Engine

## 1. Overview & Physics Principles

The SolarOS calculation engine runs real physical equations adhering to IEC 62548, IS 16221, and MNRE rooftop standards. It operates without external dependencies and produces deterministic sizing metrics.

## 2. Calculation Modules

### 2.1 DC System Sizing (`dc-sizing.ts`)
- **Formula:** 
  $$\text{Capacity}_{\text{DC}} = \frac{N_{\text{modules}} \times P_{\text{rated,W}}}{1000} \text{ (kW)}$$
- **Rooftop Area Shortfall Check:**
  $$\text{Area}_{\text{required}} = N_{\text{modules}} \times A_{\text{module}} \times 1.25 \text{ (sq.ft)}$$
  If $\text{Area}_{\text{required}} > \text{Area}_{\text{usable}}$, an explicit rooftop shortfall warning is issued.

### 2.2 Temperature-Corrected String Sizing (`string-sizing.ts`)
- **Cold Temperature Voc:**
  $$V_{oc,\text{cold}} = V_{oc,\text{STC}} \times \left[1 + \frac{\gamma_{Voc}}{100} \times (T_{\text{min}} - 25)\right]$$
- **Hot Temperature Vmp:**
  $$V_{mp,\text{hot}} = V_{mp,\text{STC}} \times \left[1 + \frac{\gamma_{Pmp}}{100} \times (T_{\text{max,cell}} - 25)\right]$$
  where $T_{\text{max,cell}} = T_{\text{ambient,max}} + 30^\circ\text{C}$ (NOCT cell rise).
- **String Range:**
  $$N_{\text{max}} = \left\lfloor \frac{V_{\text{max,inverter}}}{V_{oc,\text{cold}}} \right\rfloor, \quad N_{\text{min}} = \left\lceil \frac{V_{\text{mppt,min}}}{V_{mp,\text{hot}}} \right\rceil$$

### 2.3 DC/AC Ratio Optimization (`dc-ac-ratio.ts`)
- Evaluates inverter clipping and capacity factor:
  $$\text{Ratio} = \frac{\text{Total DC kW}}{\text{Total AC kW}}$$
- Categorized as:
  - $< 1.0$: Under-utilized inverter.
  - $1.15 - 1.30$: **Optimal engineering sweet-spot** for Indian solar irradiance profile.
  - $> 1.40$: Significant clipping losses risk.

### 2.4 Conductor Sizing & Voltage Drop (`cable-protection.ts`)
- **DC Conductor:**
  $$V_{\text{drop,DC}} = \frac{2 \times L \times I_{mp}}{\sigma \times A} \le 1.5\%$$
- **AC Conductor (3-Phase):**
  $$V_{\text{drop,AC}} = \frac{\sqrt{3} \times L \times I_{ac} \times \cos(\phi)}{\sigma \times A} \le 2.0\%$$

### 2.5 Energy Yield & Carbon Avoidance (`energy-estimation.ts`)
- **Daily Generation:**
  $$E_{\text{daily}} = P_{\text{DC}} \times \text{PSH} \times \text{PR}$$
- **Annual Generation:**
  $$E_{\text{annual}} = E_{\text{daily}} \times 365 \text{ (kWh)}$$
- **CO₂ Offset:**
  $$\text{CO}_2 \text{ Saved} = E_{\text{annual}} \times 0.82 \text{ kg CO}_2/\text{kWh}$$
