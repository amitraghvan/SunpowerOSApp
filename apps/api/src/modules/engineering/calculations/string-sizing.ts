import { MPPTAllocation } from '@solaros/types';

export interface StringSizingInput {
  moduleQuantity: number;
  moduleVoc: number;
  moduleVmp: number;
  moduleIsc: number;
  moduleImp: number;
  tempCoeffVocPercent?: number; // e.g. -0.28 (%/°C)
  tempCoeffVmpPercent?: number; // e.g. -0.35 (%/°C)

  inverterMaxDcVoltage: number;
  inverterMinMpptVoltage: number;
  inverterMaxMpptVoltage: number;
  inverterMpptCount: number;
  inverterMaxCurrentPerMppt: number;

  minDesignTempCelsius?: number; // Default 5°C
  maxCellTempCelsius?: number;   // Default 70°C
}

export interface StringSizingResult {
  vocCold: number;
  vmpHot: number;
  maxModulesPerString: number;
  minModulesPerString: number;
  stringCount: number;
  modulesPerString: number;
  unassignedModules: number;
  mpptAllocations: MPPTAllocation[];
  isValidStringConfiguration: boolean;
  warnings: string[];
}

export function calculateStringSizing(input: StringSizingInput): StringSizingResult {
  const minTemp = input.minDesignTempCelsius ?? 5;
  const maxTemp = input.maxCellTempCelsius ?? 70;
  const betaVoc = input.tempCoeffVocPercent ?? -0.28; // % / °C
  const gammaVmp = input.tempCoeffVmpPercent ?? -0.35; // % / °C

  // 1. Temperature-adjusted voltages
  // Voc cold: Voc * (1 + (betaVoc / 100) * (minTemp - 25))
  const vocCold = Number(
    (input.moduleVoc * (1 + (betaVoc / 100) * (minTemp - 25))).toFixed(2),
  );

  // Vmp hot: Vmp * (1 + (gammaVmp / 100) * (maxTemp - 25))
  const vmpHot = Number(
    (input.moduleVmp * (1 + (gammaVmp / 100) * (maxTemp - 25))).toFixed(2),
  );

  // 2. String limits per inverter specs
  const maxModulesPerString = Math.floor(input.inverterMaxDcVoltage / vocCold);
  const minModulesPerString = Math.ceil(input.inverterMinMpptVoltage / vmpHot);

  const warnings: string[] = [];

  if (minModulesPerString > maxModulesPerString) {
    warnings.push(
      `Inverter MPPT voltage range is incompatible with selected module (min: ${minModulesPerString} > max: ${maxModulesPerString})`,
    );
  }

  // 3. Determine optimal string count & module distribution
  // Try single string first if within limits, otherwise split across MPPT channels
  let stringCount = 1;
  let modulesPerString = input.moduleQuantity;

  if (input.moduleQuantity > maxModulesPerString) {
    // Need at least ceil(qty / maxModules) strings
    stringCount = Math.ceil(input.moduleQuantity / maxModulesPerString);
    modulesPerString = Math.floor(input.moduleQuantity / stringCount);
  }

  // Check if string voltage is below max MPPT voltage under STC
  const stcStringVmp = modulesPerString * input.moduleVmp;
  if (stcStringVmp > input.inverterMaxMpptVoltage) {
    stringCount += 1;
    modulesPerString = Math.floor(input.moduleQuantity / stringCount);
  }

  const unassignedModules = input.moduleQuantity - stringCount * modulesPerString;

  // 4. Distribute strings across available MPPT channels
  const mpptCount = Math.max(1, input.inverterMpptCount);
  const mpptAllocations: MPPTAllocation[] = [];

  for (let i = 0; i < mpptCount; i++) {
    // Round robin assignment of strings
    const stringsOnThisMppt = Math.floor(stringCount / mpptCount) + (i < (stringCount % mpptCount) ? 1 : 0);
    const totalImp = Number((stringsOnThisMppt * input.moduleImp).toFixed(2));
    const totalIsc = Number((stringsOnThisMppt * input.moduleIsc).toFixed(2));
    const totalVocCold = Number((modulesPerString * vocCold).toFixed(2));
    const totalVmpHot = Number((modulesPerString * vmpHot).toFixed(2));

    mpptAllocations.push({
      mpptIndex: i + 1,
      stringsCount: stringsOnThisMppt,
      modulesPerString: stringsOnThisMppt > 0 ? modulesPerString : 0,
      totalVocCold,
      totalVmpHot,
      totalImp,
      totalIsc,
    });

    if (totalImp > input.inverterMaxCurrentPerMppt) {
      warnings.push(
        `MPPT ${i + 1} current (${totalImp}A) exceeds inverter max input current (${input.inverterMaxCurrentPerMppt}A)`,
      );
    }
  }

  const isValidStringConfiguration =
    modulesPerString >= minModulesPerString &&
    modulesPerString <= maxModulesPerString &&
    warnings.length === 0;

  return {
    vocCold,
    vmpHot,
    maxModulesPerString,
    minModulesPerString,
    stringCount,
    modulesPerString,
    unassignedModules,
    mpptAllocations,
    isValidStringConfiguration,
    warnings,
  };
}
