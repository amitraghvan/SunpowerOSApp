/**
 * Storage / Battery Bank Sizing for Off-Grid and Hybrid Systems
 */

export interface BatterySizingInput {
  dailyLoadKwh?: number;
  backupHours: number;
  systemVoltage?: number; // e.g. 48V (standard low-voltage residential) or 400V
  depthOfDischargePercent?: number; // e.g. 85% for Lithium LiFePO4, 50% for Lead-Acid
  inverterEfficiencyPercent?: number; // e.g. 94%
}

export interface BatterySizingResult {
  requiredEnergyKwh: number;
  nominalCapacityKwh: number;
  ampereHours: number;
  batterySystemVoltage: number;
  recommendedBatteryUnits: number;
  notes: string;
}

export function calculateBatterySizing(input: BatterySizingInput): BatterySizingResult {
  const backupHours = Math.max(1, input.backupHours);
  // Default residential continuous critical load: 1.5 kW average
  const dailyLoad = input.dailyLoadKwh ?? (backupHours * 1.5);
  const dod = (input.depthOfDischargePercent ?? 85) / 100;
  const inverterEff = (input.inverterEfficiencyPercent ?? 94) / 100;
  const systemVoltage = input.systemVoltage ?? 48; // Standard 48V DC bus

  // Required nominal battery energy (kWh) = required kWh / (DoD * Inverter Efficiency)
  const nominalCapacityKwh = Number((dailyLoad / (dod * inverterEff)).toFixed(2));
  const ampereHours = Number(((nominalCapacityKwh * 1000) / systemVoltage).toFixed(1));

  // Assuming standard 5.12 kWh modular LiFePO4 rack battery (e.g. 48V 100Ah = 4.8 - 5.12 kWh)
  const standardModuleKwh = 5.12;
  const recommendedBatteryUnits = Math.max(1, Math.ceil(nominalCapacityKwh / standardModuleKwh));

  return {
    requiredEnergyKwh: Number(dailyLoad.toFixed(2)),
    nominalCapacityKwh,
    ampereHours,
    batterySystemVoltage: systemVoltage,
    recommendedBatteryUnits,
    notes: `Calculated for ${backupHours}h backup at ${input.depthOfDischargePercent ?? 85}% DoD with 48V bus.`,
  };
}
