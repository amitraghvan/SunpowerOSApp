# SolarOS Product Compatibility Engine

## 1. Engine Objective

The Compatibility Engine (`apps/api/src/modules/engineering/compatibility/compatibility.service.ts`) prevents field design failures by validating that all proposed hardware components operate safely within their certified electrical, thermal and mechanical limits.

## 2. Evaluation Criteria

The engine runs six discrete evaluation checks:

| Check Name | Rule Definition | Failure Consequence |
|---|---|---|
| **Max Voltage** | $V_{\text{string,cold}} \le V_{\text{max,inverter}}$ | High Risk: Inverter input bridge destruction |
| **Min MPPT Voltage** | $V_{\text{string,hot}} \ge V_{\text{mppt,min}}$ | Inverter shutdown on high temperature |
| **Max Input Current** | $I_{sc,\text{array}} \le I_{\text{sc,max,inverter}}$ | Overheating of MPPT tracking bridge |
| **Phase Matching** | Grid Connection Phase matches Inverter Phase | Severe phase imbalance / utility grid trip |
| **Battery Inverter Compatibility** | Battery nominal voltage matches Hybrid Inverter DC bus | Storage charging failure |
| **Mounting Compatibility** | Structure design matches roof type (RCC/Metal/Ground) | Structural wind uplift risk |

## 3. Compatibility Status Outcomes

1. `COMPATIBLE`: All checks pass with 100% compliance. Unlocks design approval.
2. `CONDITIONAL`: System passes primary safety checks but operates outside optimal efficiency (e.g. DC/AC ratio > 1.35). Requires engineer acknowledgement.
3. `INCOMPATIBLE`: Hard electrical violation detected. Design approval is strictly blocked.
