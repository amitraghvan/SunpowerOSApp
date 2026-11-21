# SolarOS Electrical Protection & Earthing Engineering Guide

## 1. DC Protection Architecture

- **DC String Fuses:**
  - Sized at $1.56 \times I_{sc,\text{module}}$ adhering to IEC 62548.
  - Standard rating: 15A or 20A 1000V DC gPV ceramic cartridge fuses.
- **DC Surge Protective Device (SPD):**
  - Type II SPD rated for 1000V DC with optical fault indicator.
  - Placed in dedicated IP65 DC Distribution Box (DCDB).

## 2. AC Protection Architecture

- **AC Miniature Circuit Breaker (MCB):**
  - Sized at $1.25 \times I_{ac,\text{rated}}$.
  - Curve: Type C (handling inverter inrush current during grid synchronization).
- **AC Surge Protective Device (SPD):**
  - Type II SPD rated for 415V AC (three phase) or 230V AC (single phase).

## 3. Earthing System Standards (IS 3043)

SolarOS sizing mandates two distinct, electrically segregated chemical earthing pits:
1. **Equipment & Structure Grounding:** Modules, aluminum rails, inverter chassis, DCDB/ACDB enclosures.
2. **Lightning Protection Grounding:** Dedicated Franklin rod / early streamer lightning arrester earth pit.
- **Target Ground Resistance:** $< 5.0\text{ }\Omega$ measured in wet soil conditions.
