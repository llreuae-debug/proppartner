/**
 * Comprehensive Dosage Forms Taxonomy for Pakistan Prescription OS
 * Categorized and searchable with automatic Route and Instruction presets.
 */

export const DOSAGE_FORM_CATEGORIES = [
  {
    category: "ORAL",
    description: "Oral tablets, capsules, liquids, and dissolvables",
    defaultRoute: "Oral",
    forms: [
      "Tablet",
      "Film-coated tablet",
      "Chewable tablet",
      "Dispersible tablet",
      "Effervescent tablet",
      "Capsule",
      "Softgel capsule",
      "Hard capsule",
      "Oral solution",
      "Oral suspension",
      "Oral drops",
      "Syrup",
      "Oral emulsion",
      "Oral powder",
      "Oral granules",
      "Sachet",
      "Oral gel",
      "Oral paste",
      "Lozenge",
      "Mouthwash",
      "Gargle"
    ]
  },
  {
    category: "TOPICAL",
    description: "External dermatological skin applications",
    defaultRoute: "Topical",
    forms: [
      "Cream",
      "Ointment",
      "Gel",
      "Lotion",
      "Solution",
      "Spray",
      "Foam",
      "Paste",
      "Powder",
      "Shampoo",
      "Wash",
      "Liniment"
    ]
  },
  {
    category: "OPHTHALMIC",
    description: "Eye drops and ophthalmic formulations",
    defaultRoute: "Ophthalmic",
    forms: [
      "Eye drops",
      "Eye ointment",
      "Eye gel",
      "Eye suspension"
    ]
  },
  {
    category: "OTIC",
    description: "Ear drops and otic sprays",
    defaultRoute: "Otic",
    forms: [
      "Ear drops",
      "Ear spray"
    ]
  },
  {
    category: "NASAL",
    description: "Intranasal drops, sprays, and gels",
    defaultRoute: "Intranasal",
    forms: [
      "Nasal drops",
      "Nasal spray",
      "Nasal gel"
    ]
  },
  {
    category: "INHALATION",
    description: "Respiratory inhalers and nebulizers",
    defaultRoute: "Inhaled",
    forms: [
      "Inhaler",
      "Metered-dose inhaler",
      "Dry powder inhaler",
      "Nebulizer solution",
      "Respules"
    ]
  },
  {
    category: "INJECTION",
    description: "Parenteral injectable formulations",
    defaultRoute: "IM",
    forms: [
      "Injection",
      "IV infusion",
      "IM injection",
      "IV injection",
      "SC injection"
    ]
  },
  {
    category: "RECTAL",
    description: "Rectal suppositories and enemas",
    defaultRoute: "Rectal",
    forms: [
      "Suppository",
      "Rectal cream",
      "Rectal ointment",
      "Rectal gel",
      "Enema"
    ]
  },
  {
    category: "VAGINAL",
    description: "Gynecological vaginal formulations",
    defaultRoute: "Vaginal",
    forms: [
      "Vaginal tablet",
      "Vaginal cream",
      "Vaginal gel",
      "Vaginal pessary",
      "Vaginal capsule"
    ]
  },
  {
    category: "OTHER",
    description: "Transdermal patches, implants, and specialty preparations",
    defaultRoute: "Transdermal",
    forms: [
      "Transdermal patch",
      "Implant",
      "Mouth spray",
      "Dental preparation"
    ]
  }
];

// Flat list of all forms for quick lookups
export const ALL_DOSAGE_FORMS = DOSAGE_FORM_CATEGORIES.flatMap(c => 
  c.forms.map(form => ({
    form,
    category: c.category,
    defaultRoute: c.defaultRoute
  }))
);

/**
 * Get category and default route for a dosage form
 */
export function getFormDetails(formName) {
  if (!formName) return { category: 'ORAL', defaultRoute: 'Oral' };
  const match = ALL_DOSAGE_FORMS.find(f => f.form.toLowerCase() === formName.toLowerCase());
  if (match) return match;

  const lower = formName.toLowerCase();
  if (lower.includes('drop') && lower.includes('eye')) return { category: 'OPHTHALMIC', defaultRoute: 'Ophthalmic' };
  if (lower.includes('drop') && lower.includes('ear')) return { category: 'OTIC', defaultRoute: 'Otic' };
  if (lower.includes('nasal') || lower.includes('nose')) return { category: 'NASAL', defaultRoute: 'Intranasal' };
  if (lower.includes('inhal') || lower.includes('respule')) return { category: 'INHALATION', defaultRoute: 'Inhaled' };
  if (lower.includes('inj') || lower.includes('infusion')) return { category: 'INJECTION', defaultRoute: 'IM' };
  if (lower.includes('suppos')) return { category: 'RECTAL', defaultRoute: 'Rectal' };
  if (lower.includes('vagin') || lower.includes('pessary')) return { category: 'VAGINAL', defaultRoute: 'Vaginal' };
  if (lower.includes('cream') || lower.includes('ointment') || lower.includes('gel') || lower.includes('lotion')) return { category: 'TOPICAL', defaultRoute: 'Topical' };
  
  return { category: 'ORAL', defaultRoute: 'Oral' };
}
