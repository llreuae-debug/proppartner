import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, Info } from 'lucide-react';

/**
 * Non-intrusive Safety & Clinical Checks Banner
 */
export default function PrescriptionSafetyAlerts({
  medicines = [],
  patientAllergies = '',
  patientChronic = ''
}) {
  const alerts = [];

  // 1. Check patient allergies
  if (patientAllergies && patientAllergies.toLowerCase() !== 'none' && patientAllergies.toLowerCase() !== 'none documented') {
    const patAllergyLower = patientAllergies.toLowerCase();

    medicines.forEach(med => {
      const genLower = (med.generic_name || med.generic || '').toLowerCase();
      const brandLower = (med.medicine_name || med.name || '').toLowerCase();

      if (patAllergyLower.includes('penicillin') && (genLower.includes('amox') || genLower.includes('penicillin') || brandLower.includes('augmentin') || brandLower.includes('amoxil'))) {
        alerts.push({
          type: 'allergy',
          severity: 'high',
          text: `Allergy Warning: Patient has documented "${patientAllergies}" allergy. Prescribed "${med.medicine_name || med.name}" is a penicillin-class antibiotic.`
        });
      }

      if (patAllergyLower.includes('sulfa') && (genLower.includes('sulfa') || brandLower.includes('septran') || brandLower.includes('bactrim'))) {
        alerts.push({
          type: 'allergy',
          severity: 'high',
          text: `Allergy Warning: Patient has documented sulfonamide allergy. "${med.medicine_name || med.name}" contains sulfonamides.`
        });
      }

      if (patAllergyLower.includes('nsaid') && (genLower.includes('ibuprofen') || genLower.includes('diclofenac') || genLower.includes('naproxen') || brandLower.includes('brufen') || brandLower.includes('voltral') || brandLower.includes('synflex'))) {
        alerts.push({
          type: 'allergy',
          severity: 'high',
          text: `Allergy Warning: Patient has documented NSAID allergy. "${med.medicine_name || med.name}" is an NSAID.`
        });
      }

      if (patAllergyLower.includes('metronidazole') && (genLower.includes('metronidazole') || brandLower.includes('flagyl'))) {
        alerts.push({
          type: 'allergy',
          severity: 'high',
          text: `Allergy Warning: Patient has documented Metronidazole allergy. "${med.medicine_name || med.name}" contains Metronidazole.`
        });
      }
    });
  }

  // 2. Check for duplicate active ingredients
  const genericCount = {};
  medicines.forEach(m => {
    const gen = (m.generic_name || m.generic || '').trim().toLowerCase();
    if (gen && gen.length > 2) {
      genericCount[gen] = (genericCount[gen] || 0) + 1;
    }
  });

  Object.entries(genericCount).forEach(([gen, count]) => {
    if (count > 1) {
      alerts.push({
        type: 'duplicate',
        severity: 'medium',
        text: `Duplicate Active Ingredient: "${gen.toUpperCase()}" appears ${count} times in this prescription.`
      });
    }
  });

  // 3. Incomplete dosage fields
  const incompleteCount = medicines.filter(m => !(m.medicine_name || m.name) || !m.dose || !m.frequency || !m.duration).length;
  if (incompleteCount > 0) {
    alerts.push({
      type: 'incomplete',
      severity: 'low',
      text: `${incompleteCount} medication item(s) have incomplete dose, frequency, or duration fields.`
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4 animate-fade-in">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs ${
            alert.severity === 'high'
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : alert.severity === 'medium'
              ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
            alert.severity === 'high' ? 'text-rose-600' : alert.severity === 'medium' ? 'text-amber-600' : 'text-teal-600'
          }`} />
          <div className="flex-1">
            <span className="font-bold">{alert.text}</span>
            <span className="text-[10px] block opacity-75 mt-0.5">
              Doctor clinical discretion advised. The system does not automatically block prescribing.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
