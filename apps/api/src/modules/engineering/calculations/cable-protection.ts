import { ElectricalPhase } from '@solaros/types';

/**
 * Conductor Sizing and Electrical Protection
 * In accordance with CEA 2026 and IS 732 / IS 3043
 */

export interface CableProtectionInput {
  totalDcCapacityKw: number;
  totalAcCapacityKw: number;
  connectionType: ElectricalPhase;
  distanceToMainPanelMeters?: number; // One-way AC cable run
  maxDcStringCurrentAmps: number;
  stringVocCold: number;
}

export interface CableProtectionResult {
  dcCableSizeSqMm: number;
  dcVoltageDropPercent: number;
  acCableSizeSqMm: number;
  acVoltageDropPercent: number;
  dcFuseRatingAmps: number;
  acMcbRatingAmps: number;
  dcSpdRating: string;
  acSpdRating: string;
  earthingPitsCount: number;
}

export function calculateCableAndProtection(input: CableProtectionInput): CableProtectionResult {
  const dcLengthMeters = 25; // Standard rooftop array to inverter DC run
  const acLengthMeters = input.distanceToMainPanelMeters ?? 20;

  // 1. DC Cable Selection (Standard Solar DC Cable, Cu, sigma = 56)
  // Vdrop = (2 * L * I) / (sigma * A)
  const dcCurrent = input.maxDcStringCurrentAmps;
  const dcVoltage = Math.max(100, input.stringVocCold);

  let dcCableSize = 4.0; // 4 sq.mm standard
  let dcVdrop = (2 * dcLengthMeters * dcCurrent) / (56 * dcCableSize);
  let dcDropPercent = (dcVdrop / dcVoltage) * 100;

  if (dcDropPercent > 1.5) {
    dcCableSize = 6.0;
    dcVdrop = (2 * dcLengthMeters * dcCurrent) / (56 * dcCableSize);
    dcDropPercent = (dcVdrop / dcVoltage) * 100;
  }

  // 2. AC Cable Selection
  // For Single Phase: I_ac = P_ac / (230 * PF=0.98)
  // For Three Phase: I_ac = P_ac / (sqrt(3) * 415 * PF=0.98)
  const isThreePhase = input.connectionType === ElectricalPhase.THREE_PHASE;
  const acNominalVoltage = isThreePhase ? 415 : 230;
  const acPowerWatts = input.totalAcCapacityKw * 1000;
  const pf = 0.98;

  const acCurrent = isThreePhase
    ? acPowerWatts / (Math.sqrt(3) * acNominalVoltage * pf)
    : acPowerWatts / (acNominalVoltage * pf);

  // Copper AC cable conductivity: 56; Aluminum: 35
  // For small residential (<= 10 kW), copper multi-strand is standard
  const standardAcSizes = [2.5, 4.0, 6.0, 10.0, 16.0, 25.0];
  let selectedAcCableSize = 4.0;
  let acDropPercent = 2.0;

  for (const size of standardAcSizes) {
    const vDrop = isThreePhase
      ? (Math.sqrt(3) * acLengthMeters * acCurrent) / (56 * size)
      : (2 * acLengthMeters * acCurrent) / (56 * size);
    const dropPct = (vDrop / acNominalVoltage) * 100;
    if (dropPct <= 1.5) {
      selectedAcCableSize = size;
      acDropPercent = dropPct;
      break;
    }
  }

  // 3. Protection Device Ratings
  // DC Fuse = 1.56 * Isc (standard IS/NEC recommendation)
  const dcFuseRating = Math.ceil(dcCurrent * 1.56);
  // AC MCB = 1.25 * I_ac continuous current
  const acMcbRating = Math.ceil(acCurrent * 1.25);

  // Standard MCB commercial ratings: 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100
  const standardMcbRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
  const finalMcbRating = standardMcbRatings.find((r) => r >= acMcbRating) ?? 63;

  return {
    dcCableSizeSqMm: dcCableSize,
    dcVoltageDropPercent: Number(dcDropPercent.toFixed(2)),
    acCableSizeSqMm: selectedAcCableSize,
    acVoltageDropPercent: Number(acDropPercent.toFixed(2)),
    dcFuseRatingAmps: dcFuseRating,
    acMcbRatingAmps: finalMcbRating,
    dcSpdRating: 'Type II (1000V DC, In 20kA, Imax 40kA)',
    acSpdRating: isThreePhase
      ? 'Type II (415V AC, 4-Pole, In 20kA, Imax 40kA)'
      : 'Type II (230V AC, 2-Pole, In 20kA, Imax 40kA)',
    earthingPitsCount: 2, // IS 3043: 1 for Inverter/Array body, 1 for Lightning Arrester
  };
}
