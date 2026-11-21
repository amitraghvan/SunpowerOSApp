import { CompatibilityService } from '../../apps/api/src/modules/engineering/compatibility/compatibility.service';
import {
  CompatibilityStatus,
  SolarSystemType,
  ElectricalPhase,
} from '@solaros/types';

describe('Phase 2 — Product Compatibility & Standards Engine', () => {
  let compatibilityService: CompatibilityService;

  beforeEach(() => {
    compatibilityService = new CompatibilityService();
  });

  it('should flag INCOMPATIBLE when string open-circuit voltage exceeds inverter maximum DC breakdown rating', () => {
    const input = {
      systemType: SolarSystemType.ON_GRID,
      connectionType: ElectricalPhase.THREE_PHASE,
      targetCapacityKw: 10.0,
      panel: {
        variantId: 'p1',
        sku: 'PANEL-550',
        ratedPowerWatts: 550,
        voc: 50.0,
        vmp: 42.0,
        isc: 14.0,
        imp: 13.0,
      },
      inverter: {
        variantId: 'inv1',
        sku: 'INV-10K',
        ratedPowerKw: 10.0,
        mpptCount: 2,
        maxDcVoltage: 800, // Inverter limit: 800V
        minMpptVoltage: 200,
        maxMpptVoltage: 750,
        maxInputCurrentPerMppt: 26,
        maxShortCircuitCurrentPerMppt: 35,
        isHybrid: false,
        phase: ElectricalPhase.THREE_PHASE,
      },
    };

    // String cold Voc = 900V (Exceeds 800V limit!)
    const result = compatibilityService.evaluateCompatibility(
      input,
      900, // stringVocCold
      750, // stringVmpHot
      13.0, // stringImp
      'RCC_FLAT',
    );

    expect(result.overallStatus).toBe(CompatibilityStatus.INCOMPATIBLE);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0]).toContain('exceeds inverter limit');
  });

  it('should flag CONDITIONAL with warnings when string Vmp falls below min MPPT voltage on hot days', () => {
    const input = {
      systemType: SolarSystemType.ON_GRID,
      connectionType: ElectricalPhase.THREE_PHASE,
      targetCapacityKw: 3.0,
      panel: {
        variantId: 'p1',
        sku: 'PANEL-550',
        ratedPowerWatts: 550,
        voc: 50.0,
        vmp: 42.0,
        isc: 14.0,
        imp: 13.0,
      },
      inverter: {
        variantId: 'inv1',
        sku: 'INV-3K',
        ratedPowerKw: 3.0,
        mpptCount: 1,
        maxDcVoltage: 600,
        minMpptVoltage: 180, // Requires at least 180V for MPPT tracking
        maxMpptVoltage: 500,
        maxInputCurrentPerMppt: 16,
        maxShortCircuitCurrentPerMppt: 20,
        isHybrid: false,
        phase: ElectricalPhase.THREE_PHASE,
      },
    };

    // Hot Vmp = 150V (Below 180V min MPPT limit)
    const result = compatibilityService.evaluateCompatibility(
      input,
      250, // stringVocCold
      150, // stringVmpHot (Too low!)
      13.0,
      'RCC_FLAT',
    );

    expect(result.overallStatus).toBe(CompatibilityStatus.CONDITIONAL);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('below min MPPT voltage');
  });

  it('should flag INCOMPATIBLE when an Off-Grid/Hybrid system uses a non-hybrid string inverter', () => {
    const input = {
      systemType: SolarSystemType.HYBRID,
      connectionType: ElectricalPhase.SINGLE_PHASE,
      targetCapacityKw: 5.0,
      panel: {
        variantId: 'p1',
        sku: 'PANEL-550',
        ratedPowerWatts: 550,
        voc: 50.0,
        vmp: 42.0,
        isc: 14.0,
        imp: 13.0,
      },
      inverter: {
        variantId: 'inv1',
        sku: 'INV-GRID-5K',
        ratedPowerKw: 5.0,
        mpptCount: 2,
        maxDcVoltage: 600,
        minMpptVoltage: 120,
        maxMpptVoltage: 550,
        maxInputCurrentPerMppt: 16,
        maxShortCircuitCurrentPerMppt: 20,
        isHybrid: false, // NOT HYBRID!
        phase: ElectricalPhase.SINGLE_PHASE,
      },
      battery: {
        capacityKwh: 5.12,
        nominalVoltage: 48,
      },
    };

    const result = compatibilityService.evaluateCompatibility(
      input,
      350,
      280,
      13.0,
      'RCC_FLAT',
    );

    expect(result.overallStatus).toBe(CompatibilityStatus.INCOMPATIBLE);
    expect(result.violations.some((v) => v.includes('Hybrid'))).toBe(true);
  });

  it('should return COMPATIBLE with zero violations when all electrical and safety criteria pass', () => {
    const input = {
      systemType: SolarSystemType.ON_GRID,
      connectionType: ElectricalPhase.THREE_PHASE,
      targetCapacityKw: 5.0,
      panel: {
        variantId: 'p1',
        sku: 'PANEL-550',
        ratedPowerWatts: 550,
        voc: 50.0,
        vmp: 42.0,
        isc: 14.0,
        imp: 13.0,
      },
      inverter: {
        variantId: 'inv1',
        sku: 'INV-5K',
        ratedPowerKw: 5.0,
        mpptCount: 2,
        maxDcVoltage: 1000,
        minMpptVoltage: 160,
        maxMpptVoltage: 850,
        maxInputCurrentPerMppt: 26,
        maxShortCircuitCurrentPerMppt: 35,
        isHybrid: false,
        phase: ElectricalPhase.THREE_PHASE,
      },
    };

    const result = compatibilityService.evaluateCompatibility(
      input,
      530, // stringVocCold < 1000V
      420, // stringVmpHot >= 160V & <= 850V
      13.0, // stringImp <= 26A
      'RCC_FLAT',
    );

    expect(result.overallStatus).toBe(CompatibilityStatus.COMPATIBLE);
    expect(result.violations.length).toBe(0);
    expect(result.warnings.length).toBe(0);
  });
});
