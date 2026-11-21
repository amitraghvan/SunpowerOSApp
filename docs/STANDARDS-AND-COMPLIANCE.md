# SolarOS Standards & Regulatory Compliance Engine

## 1. Statutory Standards Registry

SolarOS seeds and audits against the three authoritative standards for Indian Solar EPC:

### 1. MNRE Rooftop Solar Technical Guidelines (2024)
- **Code:** `MNRE_ROOFTOP_2024`
- **Scope:** Grid-connected solar rooftop PV power plants up to 500 kW.
- **Key Parameters:**
  - Mandatory ALMM (Approved List of Models and Manufacturers) compliance.
  - Inverter efficiency $\ge 97\%$.
  - Minimum 5-year comprehensive system maintenance guarantee.

### 2. CEA Technical Standards for Grid Connectivity (2026)
- **Code:** `CEA_TECHNICAL_STANDARDS_2026`
- **Scope:** Distributed generation grid interconnections.
- **Key Parameters:**
  - Total Harmonic Distortion (THD) $< 3\%$.
  - Anti-islanding disconnection time $< 2.0\text{ seconds}$.
  - Voltage operating range: $0.85\text{ p.u.}$ to $1.10\text{ p.u.}$.

### 3. IS 16221 / IEC 62109 PV Safety Standard
- **Code:** `IS_16221_SAFETY`
- **Scope:** Electrical and fire safety of power conversion equipment.
- **Key Parameters:**
  - Galvanic insulation resistance monitoring.
  - IP65 outdoor ingress protection.
  - Integrated DC isolation disconnect switch.
