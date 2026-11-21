/**
 * Pure DC Array Sizing Logic
 */

export interface DcSizingInput {
  targetCapacityKw: number;
  moduleRatedPowerWatts: number;
  usableAreaSqFt?: number;
}

export interface DcSizingResult {
  moduleQuantity: number;
  totalDcCapacityKw: number;
  requiredAreaSqFt: number;
  areaUtilizationPercent?: number;
  hasAreaShortfall: boolean;
  shortfallSqFt: number;
}

export function calculateDcSizing(input: DcSizingInput): DcSizingResult {
  if (input.targetCapacityKw <= 0) {
    throw new Error('Target capacity must be greater than zero');
  }
  if (input.moduleRatedPowerWatts <= 0) {
    throw new Error('Module rated power must be greater than zero');
  }

  // Calculate required module count rounded up to nearest integer
  const targetWatts = input.targetCapacityKw * 1000;
  const moduleQuantity = Math.ceil(targetWatts / input.moduleRatedPowerWatts);
  const totalDcCapacityKw = Number(((moduleQuantity * input.moduleRatedPowerWatts) / 1000).toFixed(3));

  // High efficiency Mono PERC / TopCon module requires ~80 sq.ft per kW installed (including clearances)
  // Or ~28-30 sq.ft physical panel area per 550W module + 40% spacing = ~42 sq.ft/panel
  const requiredAreaSqFt = Number((moduleQuantity * 42.0).toFixed(1));

  let hasAreaShortfall = false;
  let shortfallSqFt = 0;
  let areaUtilizationPercent: number | undefined;

  if (input.usableAreaSqFt && input.usableAreaSqFt > 0) {
    areaUtilizationPercent = Number(((requiredAreaSqFt / input.usableAreaSqFt) * 100).toFixed(1));
    if (requiredAreaSqFt > input.usableAreaSqFt) {
      hasAreaShortfall = true;
      shortfallSqFt = Number((requiredAreaSqFt - input.usableAreaSqFt).toFixed(1));
    }
  }

  return {
    moduleQuantity,
    totalDcCapacityKw,
    requiredAreaSqFt,
    areaUtilizationPercent,
    hasAreaShortfall,
    shortfallSqFt,
  };
}
