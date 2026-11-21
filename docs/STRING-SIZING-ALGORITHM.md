# SolarOS String Sizing Algorithm & MPPT Window Allocation

## 1. Introduction

String sizing is the foundational electrical safety step in solar PV engineering. Improper string length causes either catastrophic inverter over-voltage breakdown during winter mornings or inverter dropout due to under-voltage on peak summer afternoons.

## 2. Temperature Boundaries (Indian Standards)

- **Extreme Cold Ambient ($T_{\text{min}}$):** $-10^\circ\text{C}$ (Standard Northern / Plateau Design Basis).
- **Extreme Hot Ambient ($T_{\text{max}}$):** $+45^\circ\text{C}$ (Standard Indian Summer Design Basis).
- **Cell Thermal Rise ($\Delta T$):** $+30^\circ\text{C}$ on roof structures under $1000\text{ W/m}^2$ irradiance.
- **Max Operating Cell Temperature ($T_{\text{cell,max}}$):** $+75^\circ\text{C}$.

## 3. Algorithm Step-by-Step

1. **Extract STC Module Parameters:**
   - $V_{oc,\text{STC}}$: Open Circuit Voltage at 25°C.
   - $V_{mp,\text{STC}}$: Maximum Power Voltage at 25°C.
   - $\gamma_{Voc}$: Temperature coefficient of open-circuit voltage (%/°C, negative).
   - $\gamma_{Pmp}$: Temperature coefficient of power / Vmp (%/°C, negative).

2. **Compute Worst-Case Voltages:**
   $$V_{oc,\text{cold}} = V_{oc,\text{STC}} \times \left(1 + \frac{\gamma_{Voc}}{100} \times (-10 - 25)\right)$$
   $$V_{mp,\text{hot}} = V_{mp,\text{STC}} \times \left(1 + \frac{\gamma_{Pmp}}{100} \times (75 - 25)\right)$$

3. **Inverter Window Boundary Conditions:**
   - **Maximum modules per series string:**
     $$N_{\text{max}} = \left\lfloor \frac{V_{\text{max,inverter}}}{V_{oc,\text{cold}}} \right\rfloor$$
   - **Minimum modules per series string:**
     $$N_{\text{min}} = \left\lceil \frac{V_{\text{mppt,min}}}{V_{mp,\text{hot}}} \right\rceil$$

4. **Safety Check:**
   If $N_{\text{min}} > N_{\text{max}}$, the selected module and inverter models are physically incompatible and cannot be matched together on this site.
