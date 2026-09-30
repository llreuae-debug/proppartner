/**
 * Medical Frequencies with Abbreviations, Plain Language & Multipliers for Quantity Auto-Calculation
 */

export const FREQUENCIES = [
  {
    id: "od",
    code: "OD",
    label: "OD — Once daily",
    symbol: "1+0+0",
    timesPerDay: 1,
    description: "Take once daily (morning or night)"
  },
  {
    id: "bd",
    code: "BD / BID",
    label: "BD/BID — Twice daily",
    symbol: "1+0+1",
    timesPerDay: 2,
    description: "Take twice daily (every 12 hours)"
  },
  {
    id: "tds",
    code: "TDS / TID",
    label: "TDS/TID — Three times daily",
    symbol: "1+1+1",
    timesPerDay: 3,
    description: "Take three times daily (every 8 hours)"
  },
  {
    id: "qid",
    code: "QID",
    label: "QID — Four times daily",
    symbol: "1+1+1+1",
    timesPerDay: 4,
    description: "Take four times daily (every 6 hours)"
  },
  {
    id: "hs",
    code: "HS",
    label: "HS — At bedtime",
    symbol: "0+0+1",
    timesPerDay: 1,
    description: "Take at bedtime before sleep"
  },
  {
    id: "prn",
    code: "PRN / SOS",
    label: "PRN — As required / SOS",
    symbol: "When needed",
    timesPerDay: 1,
    description: "Take only when required for symptoms"
  },
  {
    id: "stat",
    code: "STAT",
    label: "STAT — Immediately (Single dose)",
    symbol: "Single Dose",
    timesPerDay: 1,
    description: "Take immediately as a single dose"
  },
  {
    id: "q4h",
    code: "Q4H",
    label: "Q4H — Every 4 hours",
    symbol: "Every 4h",
    timesPerDay: 6,
    description: "Take every 4 hours round the clock"
  },
  {
    id: "q6h",
    code: "Q6H",
    label: "Q6H — Every 6 hours",
    symbol: "Every 6h",
    timesPerDay: 4,
    description: "Take every 6 hours"
  },
  {
    id: "q8h",
    code: "Q8H",
    label: "Q8H — Every 8 hours",
    symbol: "Every 8h",
    timesPerDay: 3,
    description: "Take every 8 hours"
  },
  {
    id: "q12h",
    code: "Q12H",
    label: "Q12H — Every 12 hours",
    symbol: "Every 12h",
    timesPerDay: 2,
    description: "Take every 12 hours"
  },
  {
    id: "ac",
    code: "AC",
    label: "AC — Before meals",
    symbol: "Before Meals",
    timesPerDay: 3,
    description: "Take 30 minutes before meals"
  },
  {
    id: "pc",
    code: "PC",
    label: "PC — After meals",
    symbol: "After Meals",
    timesPerDay: 3,
    description: "Take after meals"
  },
  {
    id: "alt_days",
    code: "QOD",
    label: "Alternate Days — Every other day",
    symbol: "Alternate Days",
    timesPerDay: 0.5,
    description: "Take every alternate day"
  },
  {
    id: "weekly",
    code: "QW",
    label: "Weekly — Once a week",
    symbol: "Once Weekly",
    timesPerDay: 1/7,
    description: "Take once a week on the same day"
  }
];

export const DURATION_UNITS = [
  { id: "days", label: "Days", multiplier: 1 },
  { id: "weeks", label: "Weeks", multiplier: 7 },
  { id: "months", label: "Months", multiplier: 30 },
  { id: "single", label: "Single dose", multiplier: 1 },
  { id: "ongoing", label: "Ongoing", multiplier: 30 },
  { id: "until_review", label: "Until Follow-up", multiplier: 14 }
];

export const DOSE_UNITS = [
  "Tablet",
  "Capsule",
  "mL",
  "Teaspoon (5mL)",
  "Tablespoon (15mL)",
  "Drops",
  "Puffs",
  "Application",
  "Sachet",
  "Vial / Ampoule",
  "Suppository",
  "Pessary",
  "Patch",
  "Units (IU)"
];

/**
 * Calculates estimated quantity based on dose, frequency, and duration
 */
export function calculateEstimatedQuantity({ doseAmount, doseUnit, frequencyCode, durationAmount, durationUnit }) {
  const numDose = parseFloat(doseAmount) || 1;
  const numDuration = parseFloat(durationAmount) || 5;

  const freqObj = FREQUENCIES.find(f => 
    f.code.toLowerCase() === (frequencyCode || '').toLowerCase() || 
    f.label.toLowerCase() === (frequencyCode || '').toLowerCase() ||
    (frequencyCode || '').toLowerCase().includes(f.code.toLowerCase())
  );
  const timesPerDay = freqObj ? freqObj.timesPerDay : 2;

  const durObj = DURATION_UNITS.find(d => d.id === (durationUnit || '').toLowerCase() || d.label.toLowerCase() === (durationUnit || '').toLowerCase());
  const dayMultiplier = durObj ? durObj.multiplier : 1;

  const totalDays = numDuration * dayMultiplier;
  const totalUnits = Math.ceil(numDose * timesPerDay * totalDays);

  return {
    quantity: totalUnits > 0 ? totalUnits : 1,
    unit: doseUnit || 'Unit'
  };
}
