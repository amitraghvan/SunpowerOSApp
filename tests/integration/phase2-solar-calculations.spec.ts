import {
  wattsToKw,
  kwToWatts,
  whToKwh,
  kwhToWh,
  sqFtToSqMeters,
  sqMetersToSqFt,
  calculateDcSizing,
  calculateStringSizing,
  evaluateDcAcRatio,
  calculateBatterySizing,
  calculateCableAndProtection,
  calculateEnergyEstimation,
} from '../../apps/api/src/modules/engineering/calculations';
import { ElectricalPhase } from '@solaros/types';

describe('Phase 2 — Solar Technical Calculation Engine', () => {
  describe('Unit Conversions', () => {
    it('should accurately convert power units between Watts and kW', () => {
      expect(wattsToKw(550)).toBe(0.55);
      expect(wattsToKw(3300)).toBe(3.3);
      expect(kwToWatts(5.5)).toBe(5500);
    });

    it('should accurately convert energy units between Wh and kWh', () => {
      expect(whToKwh(5120)).toBe(5.12);
      expect(kwhToWh(10.24)).toBe(10240);
    });

    it('should accurately convert area between sq ft and sq meters', () => {
      expect(sqFtToSqMeters(100)).toBe(9.29);
      expect(sqMetersToSqFt(9.29)).toBe(100);
    });
  });

  describe('DC Array Sizing', () => {
    it('should calculate module count and total DC capacity from target capacity', () => {
      const result = calculateDcSizing({
        targetCapacityKw: 5.0,
        moduleRatedPowerWatts: 550,
        usableAreaSqFt: 500,
      });

      expect(result.moduleQuantity).toBe(10); // 5000 / 550 = 9.09 -> 10 modules
      expect(result.totalDcCapacityKw).toBe(5.5); // 10 * 550W = 5.5 kW
      expect(result.requiredAreaSqFt).toBe(420); // 10 * 42 sq ft = 420 sq ft
      expect(result.hasAreaShortfall).toBe(false);
      expect(result.areaUtilizationPercent).toBe(84.0);
    });

    it('should detect area shortfall when usable rooftop space is insufficient', () => {
      const result = calculateDcSizing({
        targetCapacityKw: 5.0,
        moduleRatedPowerWatts: 550,
        usableAreaSqFt: 300,
      });

      expect(result.moduleQuantity).toBe(10);
      expect(result.hasAreaShortfall).toBe(true);
      expect(result.shortfallSqFt).toBe(120); // 420 - 300 = 120 sq ft
    });
  });

  describe('String Sizing & Temperature Coefficient Calculations', () => {
    it('should calculate cold Voc and hot Vmp and allocate strings safely to MPPT channels', () => {
      const result = calculateStringSizing({
        moduleQuantity: 10,
        moduleVoc: 50.2,
        moduleVmp: 42.1,
        moduleIsc: 13.9,
        moduleImp: 13.1,
        tempCoeffVocPercent: -0.28,
        tempCoeffVmpPercent: -0.35,
        inverterMaxDcVoltage: 1000,
        inverterMinMpptVoltage: 160,
        inverterMaxMpptVoltage: 850,
        inverterMpptCount: 2,
        inverterMaxCurrentPerMppt: 26,
        minDesignTempCelsius: 5,
        maxCellTempCelsius: 70,
      });

      // Cold Voc at 5°C: 50.2 * (1 + (-0.28 / 100) * (5 - 25)) = 50.2 * (1 + 0.056) = 53.01V
      expect(result.vocCold).toBe(53.01);
      // Hot Vmp at 70°C: 42.1 * (1 + (-0.35 / 100) * (70 - 25)) = 42.1 * (1 - 0.1575) = 35.47V
      expect(result.vmpHot).toBe(35.47);

      expect(result.maxModulesPerString).toBe(Math.floor(1000 / 53.01)); // 18 modules
      expect(result.minModulesPerString).toBe(Math.ceil(160 / 35.47)); // 5 modules
      expect(result.isValidStringConfiguration).toBe(true);
      expect(result.mpptAllocations.length).toBe(2);
    });
  });

  describe('DC/AC Ratio Evaluation', () => {
    it('should classify DC/AC sizing accurately against engineering standards', () => {
      const undersized = evaluateDcAcRatio(4.0, 5.0);
      expect(undersized.status).toBe('UNDERSIZED');
      expect(undersized.isCompliant).toBe(false);

      const optimal = evaluateDcAcRatio(5.5, 4.5);
      expect(optimal.status).toBe('OPTIMAL');
      expect(optimal.isCompliant).toBe(true);
      expect(optimal.ratio).toBe(1.222);

      const oversized = evaluateDcAcRatio(8.0, 5.0);
      expect(oversized.status).toBe('OVERSIZED');
      expect(oversized.isCompliant).toBe(false);
    });
  });

  describe('Storage / Battery Sizing', () => {
    it('should size battery bank based on backup hours, DoD, and nominal bus voltage', () => {
      const result = calculateBatterySizing({
        dailyLoadKwh: 6.0,
        backupHours: 4,
        systemVoltage: 48,
        depthOfDischargePercent: 85,
        inverterEfficiencyPercent: 94,
      });

      // 6.0 / (0.85 * 0.94) = 7.509 -> 7.51 kWh
      expect(result.nominalCapacityKwh).toBe(7.51);
      expect(result.ampereHours).toBe(156.5); // (7510 / 48)
      expect(result.recommendedBatteryUnits).toBe(2); // 2 units of 5.12 kWh
    });
  });

  describe('Cables & Protection Sizing', () => {
    it('should size DC and AC conductors and select compliant breakers & SPDs', () => {
      const result = calculateCableAndProtection({
        totalDcCapacityKw: 5.5,
        totalAcCapacityKw: 5.0,
        connectionType: ElectricalPhase.THREE_PHASE,
        distanceToMainPanelMeters: 25,
        maxDcStringCurrentAmps: 13.1,
        stringVocCold: 530.1,
      });

      expect(result.dcCableSizeSqMm).toBeGreaterThanOrEqual(4.0);
      expect(result.dcVoltageDropPercent).toBeLessThanOrEqual(1.5);
      expect(result.acCableSizeSqMm).toBeGreaterThanOrEqual(2.5);
      expect(result.acVoltageDropPercent).toBeLessThanOrEqual(1.5);
      expect(result.acMcbRatingAmps).toBeGreaterThanOrEqual(10);
      expect(result.earthingPitsCount).toBe(2);
    });
  });

  describe('Energy Estimation & Carbon Avoidance', () => {
    it('should compute daily, monthly, and annual generation and CO2 reduction', () => {
      const result = calculateEnergyEstimation({
        totalDcCapacityKw: 5.0,
        dailyPeakSunHours: 4.8,
        performanceRatioPercent: 78.0,
      });

      // 5 kW * 4.8 * 0.78 = 18.72 kWh/day
      expect(result.estDailyGenerationKwh).toBe(18.72);
      expect(result.estAnnualGenerationKwh).toBe(6832.8);
      expect(result.specificYieldKwhPerKwp).toBe(1366.56);
      expect(result.co2SavedTonsAnnual).toBe(5.6); // 6832.8 * 0.82 / 1000 = 5.60 tons
    });
  });
});
