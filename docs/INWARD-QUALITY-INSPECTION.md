# Technical Quality Inspection (QIR) Checklist

## Overview
Solar EPC equipment requires rigorous inward quality control to prevent degraded cells, microcracks, or defective inverters from being dispatched to customer rooftops.

## Inspection Workflows
Upon physical receipt, the Quality Inspector performs a comprehensive Quality Inspection (`performQualityInspection`):
1. **Document Sequence**: `QIR-YYYY-NNNNNN`.
2. **Quantities Evaluated**: `totalInspectedQuantity`, `passedQuantity`, `rejectedQuantity`.
3. **Product-Specific Technical Checklist**:
   - **Solar PV Modules**:
     - Visual frame anodization & 35mm thickness check.
     - Glass integrity & microcrack screening.
     - Junction box IP68 rating & bypass diode continuity.
     - STC Flash Test verification: $V_{\text{oc}}$ (open circuit voltage), $I_{\text{sc}}$ (short circuit current), and $P_{\text{max}}$ (rated peak power).
   - **Inverters**:
     - Enclosure ingress protection & grounding terminal inspection.
     - DC switch & internal terminal block wiring check.
     - Firmware version and communication protocol test (RS485/Modbus/WiFi).
   - **Batteries**:
     - Cell balance BMS communication check.
     - Terminal voltage & nominal state-of-charge (SoC) verification.
4. **Outcomes**:
   - `PASS`: All units accepted; line inspection status updated to `PASSED`.
   - `CONDITIONAL_PASS`: Accepted with documented non-critical observation.
   - `FAIL`: Rejected units flagged for vendor return and debit note processing.
