/**
 * Indian & International Solar Engineering Standards Registry
 * MNRE, CEA, BIS, IEC Compliance Specifications
 */

export interface EngineeringStandardSpec {
  code: string;
  name: string;
  issuingBody: string;
  category: 'ELECTRICAL' | 'MECHANICAL' | 'SAFETY' | 'GRID';
  version: string;
  minDcAcRatio: number;
  maxDcAcRatio: number;
  maxDcVoltageSinglePhase: number;
  maxDcVoltageThreePhase: number;
  voltageDropLimitPercent: number;
  minEarthingPits: number;
  guidelines: string[];
}

export const ENGINEERING_STANDARDS: Record<string, EngineeringStandardSpec> = {
  MNRE_ROOFTOP_2024: {
    code: 'MNRE_ROOFTOP_2024',
    name: 'MNRE Grid-Connected Solar Rooftop Technical Specifications',
    issuingBody: 'MNRE',
    category: 'GRID',
    version: '2024.1',
    minDcAcRatio: 1.05,
    maxDcAcRatio: 1.40,
    maxDcVoltageSinglePhase: 600,
    maxDcVoltageThreePhase: 1000,
    voltageDropLimitPercent: 2.0,
    minEarthingPits: 2,
    guidelines: [
      'Modules must comply with ALMM (Approved List of Models and Manufacturers)',
      'Inverters must comply with IS 16221 and IS 16169 (anti-islanding protection)',
      'Minimum warranty: 25 years for modules (80% power at year 25), 5 years for inverters',
      'Mounting structures must withstand 150 km/h wind speed',
    ],
  },
  CEA_TECHNICAL_STANDARDS_2026: {
    code: 'CEA_TECHNICAL_STANDARDS_2026',
    name: 'CEA Technical Standards for Connectivity to Distributed Generation',
    issuingBody: 'CEA',
    category: 'ELECTRICAL',
    version: '2026',
    minDcAcRatio: 1.10,
    maxDcAcRatio: 1.35,
    maxDcVoltageSinglePhase: 600,
    maxDcVoltageThreePhase: 1000,
    voltageDropLimitPercent: 1.5,
    minEarthingPits: 2,
    guidelines: [
      'Total DC voltage drop shall not exceed 1.5% at nominal rating',
      'AC voltage drop between inverter and connection point shall not exceed 1.5%',
      'Independent earthing for AC, DC, and Lightning Protection (IS 3043)',
      'Type II Surge Protection Devices mandatory on both DC and AC sides',
    ],
  },
  IS_16221_SAFETY: {
    code: 'IS_16221_SAFETY',
    name: 'IS 16221 / IEC 62109 Safety of Power Converters for use in PV Power Systems',
    issuingBody: 'BIS',
    category: 'SAFETY',
    version: '2016',
    minDcAcRatio: 1.0,
    maxDcAcRatio: 1.5,
    maxDcVoltageSinglePhase: 600,
    maxDcVoltageThreePhase: 1500,
    voltageDropLimitPercent: 3.0,
    minEarthingPits: 2,
    guidelines: [
      'Inverter must disconnect under grid under/over voltage or under/over frequency within specified clearing time',
      'Galvanic isolation or residual current monitoring mandatory for transformerless inverters',
    ],
  },
};
