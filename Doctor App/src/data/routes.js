/**
 * Dedicated Route Options & Auto-Suggestion Mapping
 */

export const ROUTE_OPTIONS = [
  { id: "oral", label: "Oral", desc: "By mouth / Per os (PO)" },
  { id: "topical", label: "Topical", desc: "Applied directly to skin or local surface" },
  { id: "sublingual", label: "Sublingual", desc: "Dissolved under tongue (SL)" },
  { id: "buccal", label: "Buccal", desc: "Placed between cheek and gum" },
  { id: "ophthalmic", label: "Ophthalmic", desc: "Instilled into eye / conjunctiva" },
  { id: "otic", label: "Otic", desc: "Instilled into ear canal" },
  { id: "intranasal", label: "Intranasal", desc: "Administered into nostrils (spray/drops)" },
  { id: "inhaled", label: "Inhaled", desc: "Inhaled into lungs via MDI or nebulizer" },
  { id: "im", label: "IM", desc: "Intramuscular injection" },
  { id: "iv", label: "IV", desc: "Intravenous injection or infusion" },
  { id: "sc", label: "SC", desc: "Subcutaneous injection under skin" },
  { id: "rectal", label: "Rectal", desc: "Administered via rectum (PR)" },
  { id: "vaginal", label: "Vaginal", desc: "Administered vaginally (PV)" },
  { id: "transdermal", label: "Transdermal", desc: "Absorbed through skin via patch" },
  { id: "other", label: "Other", desc: "Special administration route" }
];

export function suggestRouteByForm(formName) {
  if (!formName) return "Oral";
  const lower = formName.toLowerCase();

  if (lower.includes('cream') || lower.includes('ointment') || lower.includes('gel') || lower.includes('lotion') || lower.includes('shampoo') || lower.includes('liniment')) {
    if (lower.includes('eye')) return "Ophthalmic";
    if (lower.includes('ear')) return "Otic";
    if (lower.includes('oral gel')) return "Oral";
    if (lower.includes('rectal')) return "Rectal";
    if (lower.includes('vaginal')) return "Vaginal";
    return "Topical";
  }

  if (lower.includes('eye') || lower.includes('ophthalmic')) return "Ophthalmic";
  if (lower.includes('ear') || lower.includes('otic')) return "Otic";
  if (lower.includes('nasal') || lower.includes('nose')) return "Intranasal";
  if (lower.includes('inhal') || lower.includes('respule') || lower.includes('nebul')) return "Inhaled";
  if (lower.includes('im injection') || lower.includes('im')) return "IM";
  if (lower.includes('iv infusion') || lower.includes('iv injection') || lower.includes('iv')) return "IV";
  if (lower.includes('sc injection') || lower.includes('subcut')) return "SC";
  if (lower.includes('suppository') || lower.includes('enema')) return "Rectal";
  if (lower.includes('pessary') || lower.includes('vaginal')) return "Vaginal";
  if (lower.includes('patch')) return "Transdermal";
  if (lower.includes('sublingual')) return "Sublingual";

  return "Oral";
}
