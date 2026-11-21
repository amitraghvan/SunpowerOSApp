import { SolarSystemType, ElectricalPhase, EngineeringDesignStatus, DesignRevisionStatus, CompatibilityStatus, ComplianceStatus } from './domain-enums';

export interface MPPTAllocation {
  mpptIndex: number;
  stringsCount: number;
  modulesPerString: number;
  totalVocCold: number;
  totalVmpHot: number;
  totalImp: number;
  totalIsc: number;
}

export interface CompatibilityEvaluationResult {
  status: CompatibilityStatus;
  ruleCode: string;
  category: 'VOLTAGE' | 'CURRENT' | 'POWER' | 'PHASE' | 'BATTERY' | 'MECHANICAL';
  title: string;
  passed: boolean;
  actualValue: number | string;
  limitValue: number | string;
  unit?: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface EngineeringCalculationInput {
  systemType: SolarSystemType;
  connectionType: ElectricalPhase;
  targetCapacityKw: number;
  sanctionedLoadKw?: number;
  roofPitchDegrees?: number;
  roofAzimuthDegrees?: number;
  usableAreaSqFt?: number;
  distanceToMainPanelMeters?: number;

  panel: {
    variantId: string;
    sku: string;
    ratedPowerWatts: number;
    voc: number;
    vmp: number;
    isc: number;
    imp: number;
    tempCoeffVocPercent?: number; // e.g. -0.28 %/°C
    tempCoeffVmpPercent?: number; // e.g. -0.35 %/°C
    lengthMm?: number;
    widthMm?: number;
  };

  inverter: {
    variantId: string;
    sku: string;
    ratedPowerKw: number;
    mpptCount: number;
    maxDcVoltage: number;
    minMpptVoltage: number;
    maxMpptVoltage: number;
    maxInputCurrentPerMppt: number;
    maxShortCircuitCurrentPerMppt: number;
    isHybrid: boolean;
    phase: ElectricalPhase;
  };

  battery?: {
    variantId?: string;
    sku?: string;
    capacityKwh?: number;
    nominalVoltage?: number;
    backupHours?: number;
  };

  siteConditions?: {
    minDesignTempCelsius?: number; // Default 5°C (Indian winter cold morning)
    maxCellTempCelsius?: number;   // Default 70°C (Indian summer rooftop)
    dailyPeakSunHours?: number;    // Default 4.8 kWh/m²/day
  };
}

export interface EngineeringCalculationOutput {
  moduleQuantity: number;
  totalDcCapacityKw: number;
  totalAcCapacityKw: number;
  dcAcRatio: number;
  stringCount: number;
  modulesPerString: number;
  mpptAllocations: MPPTAllocation[];

  // Electrical sizing
  vocCold: number;
  vmpHot: number;
  dcCableSizeSqMm: number;
  acCableSizeSqMm: number;
  dcVoltageDropPercent: number;
  acVoltageDropPercent: number;
  mainMcbRatingAmps: number;
  spdRating: string;
  fuseRatingAmps: number;
  earthingRodCount: number;

  // Energy & yield
  estDailyGenerationKwh: number;
  estAnnualGenerationKwh: number;
  specificYieldKwhPerKwp: number;
  performanceRatioPercent: number;
  co2SavedTonsAnnual: number;

  // Compatibility & compliance
  compatibilityStatus: CompatibilityStatus;
  complianceStatus: ComplianceStatus;
  evaluations: CompatibilityEvaluationResult[];
  warnings: string[];
  violations: string[];
}
