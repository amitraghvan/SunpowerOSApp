import { Injectable, Logger } from '@nestjs/common';
import {
  CompatibilityStatus,
  CompatibilityEvaluationResult,
  EngineeringCalculationInput,
  SolarSystemType,
  ElectricalPhase,
} from '@solaros/types';

@Injectable()
export class CompatibilityService {
  private readonly logger = new Logger(CompatibilityService.name);

  /**
   * Evaluates electrical, physical, and topological compatibility
   * between selected PV modules, inverters, batteries, and roof structures.
   */
  evaluateCompatibility(
    input: EngineeringCalculationInput,
    stringVocCold: number,
    stringVmpHot: number,
    stringImp: number,
    roofType?: string,
  ): {
    overallStatus: CompatibilityStatus;
    evaluations: CompatibilityEvaluationResult[];
    warnings: string[];
    violations: string[];
  } {
    const evaluations: CompatibilityEvaluationResult[] = [];
    const warnings: string[] = [];
    const violations: string[] = [];

    // 1. Max DC Voltage Check
    const maxDcLimit = input.inverter.maxDcVoltage;
    const isDcVoltageSafe = stringVocCold <= maxDcLimit;
    evaluations.push({
      status: isDcVoltageSafe ? CompatibilityStatus.COMPATIBLE : CompatibilityStatus.INCOMPATIBLE,
      ruleCode: 'RULE_MAX_DC_VOLTAGE',
      category: 'VOLTAGE',
      title: 'String Maximum Open Circuit Voltage (Cold)',
      passed: isDcVoltageSafe,
      actualValue: stringVocCold,
      limitValue: maxDcLimit,
      unit: 'V',
      message: isDcVoltageSafe
        ? `String Voc cold (${stringVocCold}V) is safely below inverter limit (${maxDcLimit}V).`
        : `String Voc cold (${stringVocCold}V) EXCEEDS inverter max DC limit (${maxDcLimit}V). Risk of catastrophic inverter damage.`,
      severity: isDcVoltageSafe ? 'INFO' : 'ERROR',
    });
    if (!isDcVoltageSafe) {
      violations.push(`String Voc cold (${stringVocCold}V) exceeds inverter limit (${maxDcLimit}V).`);
    }

    // 2. Minimum MPPT Operating Voltage Check
    const minMpptLimit = input.inverter.minMpptVoltage;
    const isMpptMinSafe = stringVmpHot >= minMpptLimit;
    evaluations.push({
      status: isMpptMinSafe ? CompatibilityStatus.COMPATIBLE : CompatibilityStatus.CONDITIONAL,
      ruleCode: 'RULE_MIN_MPPT_VOLTAGE',
      category: 'VOLTAGE',
      title: 'String Minimum Operating Voltage (Hot)',
      passed: isMpptMinSafe,
      actualValue: stringVmpHot,
      limitValue: minMpptLimit,
      unit: 'V',
      message: isMpptMinSafe
        ? `String Vmp hot (${stringVmpHot}V) is within inverter MPPT tracking range (${minMpptLimit}V - ${input.inverter.maxMpptVoltage}V).`
        : `String Vmp hot (${stringVmpHot}V) falls below inverter min MPPT voltage (${minMpptLimit}V). System may drop out on hot summer afternoons.`,
      severity: isMpptMinSafe ? 'INFO' : 'WARNING',
    });
    if (!isMpptMinSafe) {
      warnings.push(`String Vmp hot (${stringVmpHot}V) is below min MPPT voltage (${minMpptLimit}V).`);
    }

    // 3. Maximum MPPT Operating Voltage Check
    const maxMpptLimit = input.inverter.maxMpptVoltage;
    const isMpptMaxSafe = stringVocCold <= maxMpptLimit;
    evaluations.push({
      status: isMpptMaxSafe ? CompatibilityStatus.COMPATIBLE : CompatibilityStatus.CONDITIONAL,
      ruleCode: 'RULE_MAX_MPPT_VOLTAGE',
      category: 'VOLTAGE',
      title: 'String Maximum Operating Voltage vs MPPT Window',
      passed: isMpptMaxSafe,
      actualValue: stringVocCold,
      limitValue: maxMpptLimit,
      unit: 'V',
      message: isMpptMaxSafe
        ? `String operating voltage fits comfortably inside the MPPT operating window.`
        : `String voltage (${stringVocCold}V) exceeds optimal MPPT window (${maxMpptLimit}V), though within max breakdown limit.`,
      severity: isMpptMaxSafe ? 'INFO' : 'WARNING',
    });

    // 4. MPPT Current Rating Check
    const maxCurrentLimit = input.inverter.maxInputCurrentPerMppt;
    const isCurrentSafe = stringImp <= maxCurrentLimit;
    evaluations.push({
      status: isCurrentSafe ? CompatibilityStatus.COMPATIBLE : CompatibilityStatus.CONDITIONAL,
      ruleCode: 'RULE_MPPT_CURRENT_CAPACITY',
      category: 'CURRENT',
      title: 'Module Current vs Inverter MPPT Current Limit',
      passed: isCurrentSafe,
      actualValue: stringImp,
      limitValue: maxCurrentLimit,
      unit: 'A',
      message: isCurrentSafe
        ? `Module current (${stringImp}A) is within MPPT channel rating (${maxCurrentLimit}A).`
        : `Module current (${stringImp}A) exceeds MPPT rated current (${maxCurrentLimit}A). Inverter will clip peak current.`,
      severity: isCurrentSafe ? 'INFO' : 'WARNING',
    });
    if (!isCurrentSafe) {
      warnings.push(`Module current (${stringImp}A) exceeds MPPT rating (${maxCurrentLimit}A).`);
    }

    // 5. Electrical Phase Compatibility
    const isPhaseMatched =
      input.connectionType === input.inverter.phase ||
      (input.connectionType === ElectricalPhase.THREE_PHASE && input.inverter.phase === ElectricalPhase.SINGLE_PHASE);
    evaluations.push({
      status: isPhaseMatched ? CompatibilityStatus.COMPATIBLE : CompatibilityStatus.INCOMPATIBLE,
      ruleCode: 'RULE_PHASE_MATCH',
      category: 'PHASE',
      title: 'Grid Connection Phase vs Inverter AC Output Phase',
      passed: isPhaseMatched,
      actualValue: input.inverter.phase,
      limitValue: input.connectionType,
      message: isPhaseMatched
        ? `Inverter AC phase (${input.inverter.phase}) is compatible with site connection (${input.connectionType}).`
        : `Mismatch: cannot connect a three-phase inverter to a single-phase grid connection.`,
      severity: isPhaseMatched ? 'INFO' : 'ERROR',
    });
    if (!isPhaseMatched) {
      violations.push(`Inverter phase (${input.inverter.phase}) cannot connect to ${input.connectionType} grid.`);
    }

    // 6. Battery & Inverter Compatibility (For Off-Grid / Hybrid)
    if (input.systemType !== SolarSystemType.ON_GRID) {
      const hasBattery = !!input.battery && (input.battery.capacityKwh ?? 0) > 0;
      const isHybridInverter = input.inverter.isHybrid;

      if (!isHybridInverter) {
        evaluations.push({
          status: CompatibilityStatus.INCOMPATIBLE,
          ruleCode: 'RULE_STORAGE_INVERTER_TYPE',
          category: 'BATTERY',
          title: 'Storage Compatibility with Inverter Type',
          passed: false,
          actualValue: 'Standard String Inverter',
          limitValue: 'Hybrid / Bidirectional Inverter',
          message: 'An Off-Grid or Hybrid system requires a Hybrid or Battery-integrated Inverter.',
          severity: 'ERROR',
        });
        violations.push('Standard string inverter cannot operate in an Off-Grid/Hybrid battery system.');
      }

      if (hasBattery && input.battery?.nominalVoltage && input.battery.nominalVoltage < 48) {
        warnings.push(`Battery nominal voltage (${input.battery.nominalVoltage}V) is low for rooftop solar. Minimum recommended is 48V.`);
      }
    }

    // Determine overall status
    let overallStatus: CompatibilityStatus = CompatibilityStatus.COMPATIBLE;
    if (violations.length > 0) {
      overallStatus = CompatibilityStatus.INCOMPATIBLE;
    } else if (warnings.length > 0) {
      overallStatus = CompatibilityStatus.CONDITIONAL;
    }

    return {
      overallStatus,
      evaluations,
      warnings,
      violations,
    };
  }
}
