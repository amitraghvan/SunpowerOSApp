/**
 * Solar Energy Generation Estimation
 * Indian Geographic Irradiance & Performance Ratio Model
 */

export interface EnergyEstimationInput {
  totalDcCapacityKw: number;
  tiltDegrees?: number;
  azimuthDegrees?: number;
  dailyPeakSunHours?: number; // Default 4.8 kWh/m²/day (Indian average)
  performanceRatioPercent?: number; // Default 78% (0.78)
}

export interface EnergyEstimationResult {
  estDailyGenerationKwh: number;
  estMonthlyGenerationKwh: number;
  estAnnualGenerationKwh: number;
  specificYieldKwhPerKwp: number;
  performanceRatioPercent: number;
  co2SavedTonsAnnual: number;
}

export function calculateEnergyEstimation(input: EnergyEstimationInput): EnergyEstimationResult {
  if (input.totalDcCapacityKw <= 0) {
    throw new Error('Total DC capacity must be greater than zero');
  }

  const psh = input.dailyPeakSunHours ?? 4.8;
  const pr = (input.performanceRatioPercent ?? 78.0) / 100.0;

  // Daily kWh = P_dc (kW) * PSH (h) * PR
  const dailyKwh = input.totalDcCapacityKw * psh * pr;
  const monthlyKwh = dailyKwh * 30.4;
  const annualKwh = dailyKwh * 365;

  // Specific Yield (kWh/kWp/year)
  const specificYield = annualKwh / input.totalDcCapacityKw;

  // CO2 avoided: 0.82 kg CO2 / kWh (India CEA Grid Emission Factor)
  const co2Tons = (annualKwh * 0.82) / 1000;

  return {
    estDailyGenerationKwh: Number(dailyKwh.toFixed(2)),
    estMonthlyGenerationKwh: Number(monthlyKwh.toFixed(2)),
    estAnnualGenerationKwh: Number(annualKwh.toFixed(2)),
    specificYieldKwhPerKwp: Number(specificYield.toFixed(2)),
    performanceRatioPercent: Number((pr * 100).toFixed(1)),
    co2SavedTonsAnnual: Number(co2Tons.toFixed(2)),
  };
}
