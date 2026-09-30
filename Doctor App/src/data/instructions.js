/**
 * Special Instructions Presets and Intelligent Form-Specific Instruction Engine
 */

export const GENERAL_INSTRUCTION_PRESETS = [
  "After meals",
  "Before meals",
  "With food / milk",
  "On an empty stomach (30 min before food)",
  "At bedtime",
  "In the morning",
  "In the evening",
  "Take with a full glass of water",
  "Shake well before use",
  "Apply thin layer to affected area",
  "Use as directed",
  "As required for severe symptoms",
  "Complete full prescribed course"
];

export const FORM_SPECIFIC_PRESETS = {
  TABLET_CAPSULE: [
    "Swallow whole; do not chew or crush",
    "Take with a full glass of water",
    "Take immediately after meals",
    "Take 30-60 min before breakfast (Empty stomach)",
    "Take with milk or meal to prevent stomach upset",
    "Do not lie down for 30 minutes after taking"
  ],
  SYRUP_SUSPENSION: [
    "Shake well before measuring",
    "Measure precisely with provided measuring cup or syringe",
    "Take after meals with water",
    "Store in refrigerator after opening",
    "Discard after 7-14 days"
  ],
  CREAM_OINTMENT_GEL: [
    "Apply thin layer to affected area only",
    "Wash and dry skin thoroughly before application",
    "External use only; avoid eyes and mouth",
    "Wash hands immediately after applying",
    "Do not cover with tight bandage unless instructed"
  ],
  EYE_DROPS: [
    "Instill 1-2 drops into conjunctival sac of affected eye",
    "Do not touch dropper tip to eye surface",
    "Remove contact lenses before use; wait 15 min before reinserting",
    "Close eye gently for 1-2 minutes after instillation",
    "Discard bottle 28 days after first opening"
  ],
  EAR_DROPS: [
    "Instill 2-3 drops into affected ear canal",
    "Warm bottle in hands before instillation to prevent dizziness",
    "Keep head tilted for 2-3 minutes after instilling",
    "Do not plug ear tightly with dry cotton"
  ],
  NASAL_SPRAY_DROPS: [
    "Blow nose gently before administering",
    "Shake bottle vigorously before each use",
    "Point spray nozzle away from nasal septum (towards ear)",
    "Breathe in gently through nose as you press the spray",
    "Do not use for more than 5 consecutive days (rebound risk)"
  ],
  INHALER_RESPULES: [
    "Shake inhaler well before each puff",
    "Breathe out completely, inhale deeply and slowly, hold breath 10 seconds",
    "Wait 1 minute between puffs if taking 2 puffs",
    "Rinse mouth and gargle with water after inhalation",
    "Use spacer device for optimal lung delivery"
  ],
  INJECTION: [
    "For deep intramuscular (IM) administration",
    "For slow intravenous (IV) infusion / injection",
    "Inject subcutaneously (SC) into abdominal wall",
    "Skin test mandatory before first antibiotic dose",
    "Administer strictly by registered nurse or doctor"
  ],
  SUPPOSITORY_RECTAL: [
    "Insert 1 suppository rectally at bedtime or after bowel movement",
    "Moisten tip with water or water-soluble lubricant before inserting",
    "Retain in rectum for at least 20 minutes"
  ],
  VAGINAL: [
    "Insert 1 vaginal tablet/pessary deeply at bedtime using applicator",
    "Lie down after insertion",
    "Do not use during active menstrual bleeding",
    "Avoid sexual intercourse during treatment"
  ]
};

/**
 * Returns tailored preset instructions according to dosage form
 */
export function getFormPresets(formName) {
  if (!formName) return FORM_SPECIFIC_PRESETS.TABLET_CAPSULE;
  const lower = formName.toLowerCase();

  if (lower.includes('eye') || lower.includes('ophthalmic')) return FORM_SPECIFIC_PRESETS.EYE_DROPS;
  if (lower.includes('ear') || lower.includes('otic')) return FORM_SPECIFIC_PRESETS.EAR_DROPS;
  if (lower.includes('nasal') || lower.includes('nose')) return FORM_SPECIFIC_PRESETS.NASAL_SPRAY_DROPS;
  if (lower.includes('inhal') || lower.includes('respule') || lower.includes('nebul')) return FORM_SPECIFIC_PRESETS.INHALER_RESPULES;
  if (lower.includes('inj') || lower.includes('infusion')) return FORM_SPECIFIC_PRESETS.INJECTION;
  if (lower.includes('suppos') || lower.includes('rectal')) return FORM_SPECIFIC_PRESETS.SUPPOSITORY_RECTAL;
  if (lower.includes('vagin') || lower.includes('pessary')) return FORM_SPECIFIC_PRESETS.VAGINAL;
  if (lower.includes('syrup') || lower.includes('suspension') || lower.includes('drops') || lower.includes('liquid')) return FORM_SPECIFIC_PRESETS.SYRUP_SUSPENSION;
  if (lower.includes('cream') || lower.includes('ointment') || lower.includes('gel') || lower.includes('lotion') || lower.includes('paste') || lower.includes('powder')) return FORM_SPECIFIC_PRESETS.CREAM_OINTMENT_GEL;

  return FORM_SPECIFIC_PRESETS.TABLET_CAPSULE;
}
