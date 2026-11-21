-- Seeding Engineering Standards into database
INSERT INTO "engineering_standards" (
  "id", "code", "name", "issuingBody", "category", "version",
  "minDcAcRatio", "maxDcAcRatio", "maxDcVoltageSinglePhase", "maxDcVoltageThreePhase",
  "voltageDropLimitPercent", "specifications", "isActive", "createdAt", "updatedAt"
) VALUES
(
  gen_random_uuid(),
  'MNRE_ROOFTOP_2024',
  'MNRE Grid-Connected Solar Rooftop Technical Specifications',
  'MNRE',
  'GRID',
  '2024.1',
  1.05,
  1.40,
  600.00,
  1000.00,
  2.00,
  '{"minEarthingPits": 2, "guidelines": ["Modules must comply with ALMM", "Inverters must comply with IS 16221 and IS 16169", "Minimum 25 years warranty on modules", "Mounting structures withstand 150 km/h wind speed"]}',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'CEA_TECHNICAL_STANDARDS_2026',
  'CEA Technical Standards for Connectivity to Distributed Generation',
  'CEA',
  'ELECTRICAL',
  '2026',
  1.10,
  1.35,
  600.00,
  1000.00,
  1.50,
  '{"minEarthingPits": 2, "guidelines": ["DC voltage drop <= 1.5%", "AC voltage drop <= 1.5%", "Independent earthing for AC, DC, and LA", "Type II SPDs mandatory"]}',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'IS_16221_SAFETY',
  'IS 16221 / IEC 62109 Safety of Power Converters for PV Systems',
  'BIS',
  'SAFETY',
  '2016',
  1.00,
  1.50,
  600.00,
  1500.00,
  3.00,
  '{"minEarthingPits": 2, "guidelines": ["Anti-islanding disconnection", "Residual current monitoring mandatory"]}',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "issuingBody" = EXCLUDED."issuingBody",
  "category" = EXCLUDED."category",
  "version" = EXCLUDED."version",
  "minDcAcRatio" = EXCLUDED."minDcAcRatio",
  "maxDcAcRatio" = EXCLUDED."maxDcAcRatio",
  "maxDcVoltageSinglePhase" = EXCLUDED."maxDcVoltageSinglePhase",
  "maxDcVoltageThreePhase" = EXCLUDED."maxDcVoltageThreePhase",
  "voltageDropLimitPercent" = EXCLUDED."voltageDropLimitPercent",
  "specifications" = EXCLUDED."specifications",
  "updatedAt" = NOW();
