// Smart Clinical AI Assistant Engine for DocCare
// Provides clinical decision support, drug recommendations, allergy detection, and safety warnings

const CLINICAL_PROTOCOLS = [
  {
    keywords: ["fever", "pyrexia", "flu", "cold", "urti", "viral", "bodyache", "chills", "rhinitis"],
    diagnosisMatch: "Acute Viral Upper Respiratory Infection (URTI) / Seasonal Influenza",
    suggestedMedicines: [
      {
        brandName: "Panadol",
        genericName: "Paracetamol (Acetaminophen)",
        strength: "500 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1-2 tablets",
        frequency: "TDS (Every 8 hours)",
        duration: "5 Days",
        instructions: "Take after meals if fever > 99.5 F or body ache persists. Do not exceed 8 tablets in 24 hours.",
        category: "Analgesic / Antipyretic",
        allergyTags: ["Paracetamol allergy"]
      },
      {
        brandName: "Softin",
        genericName: "Loratadine",
        strength: "10 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "OD (Night)",
        duration: "5 Days",
        instructions: "Take once daily at bedtime with water for rhinorrhea and sneezing.",
        category: "Antihistamine",
        allergyTags: ["Loratadine allergy"]
      },
      {
        brandName: "Surbex-Z",
        genericName: "Vitamin B-Complex + Zinc + Vitamin C",
        strength: "Standard",
        form: "Tablet",
        dose: "1 tablet",
        frequency: "OD (Morning)",
        duration: "10 Days",
        instructions: "Take once daily after breakfast for immune support.",
        category: "Multivitamin",
        allergyTags: []
      }
    ],
    labTests: ["Complete Blood Count (CBC) with ESR (if fever > 3 days)", "Dengue NS1 Antigen (if high-grade continuous fever)"],
    advice: "Drink 2.5 - 3 liters of warm water & soups daily. Steam inhalation twice daily with menthol. Complete physical rest. Avoid cold beverages and air conditioner blast.",
    followUpDays: 5
  },
  {
    keywords: ["diarrhea", "vomiting", "gastroenteritis", "loose stool", "stomach bug", "food poisoning", "dehydration", "cramps"],
    diagnosisMatch: "Acute Infectious Gastroenteritis with Mild to Moderate Dehydration",
    suggestedMedicines: [
      {
        brandName: "Novidat",
        genericName: "Ciprofloxacin",
        strength: "500 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "BD (Every 12 hours)",
        duration: "5 Days",
        instructions: "Take after meals every 12 hours. Complete the full 5-day course.",
        category: "Fluoroquinolone Antibiotic",
        allergyTags: ["Fluoroquinolone allergy", "Ciprofloxacin allergy"]
      },
      {
        brandName: "Flagyl",
        genericName: "Metronidazole",
        strength: "400 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "TDS (Every 8 hours)",
        duration: "5 Days",
        instructions: "Take strictly after meals with water. Do not consume alcohol or sour liquids.",
        category: "Antiprotozoal",
        allergyTags: ["Metronidazole allergy"]
      },
      {
        brandName: "Motilium",
        genericName: "Domperidone",
        strength: "10 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "TDS",
        duration: "3 Days",
        instructions: "Take 15 to 20 minutes before meals for nausea control.",
        category: "Antiemetic",
        allergyTags: ["Domperidone allergy"]
      },
      {
        brandName: "ORS Sachet (Nimkol)",
        genericName: "Oral Rehydration Salts (WHO Formula)",
        strength: "1 Sachet / Liter",
        form: "Sachet",
        route: "Oral",
        dose: "1 glass after each stool",
        frequency: "SOS",
        duration: "Until hydration normalizes",
        instructions: "Dissolve 1 sachet in 1 liter boiled & cooled water. Sip continuously throughout the day.",
        category: "Electrolyte Replenisher",
        allergyTags: []
      }
    ],
    labTests: ["Stool Routine Examination (R/E) & Culture", "Serum Electrolytes (Na+, K+, Cl-)"],
    advice: "Strict light diet: Khichdi, plain boiled white rice with curd, bananas, clear soups, and apple juice. Avoid milk, spices, oily snacks, and raw salads.",
    followUpDays: 3
  },
  {
    keywords: ["gerd", "gastritis", "acidity", "heartburn", "acid reflux", "stomach burn", "dyspepsia", "epigastric"],
    diagnosisMatch: "Acid Peptic Disease / Gastroesophageal Reflux Disease (GERD)",
    suggestedMedicines: [
      {
        brandName: "Nexum",
        genericName: "Esomeprazole",
        strength: "40 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "OD (Morning)",
        duration: "14 Days",
        instructions: "Take 30 minutes before breakfast on an empty stomach with a full glass of water.",
        category: "Proton Pump Inhibitor (PPI)",
        allergyTags: ["PPI allergy", "Esomeprazole allergy"]
      },
      {
        brandName: "Gaviscon Syrup",
        genericName: "Sodium Alginate + Sodium Bicarbonate",
        strength: "250 mg / 10ml",
        form: "Suspension",
        route: "Oral",
        dose: "2 teaspoons (10ml)",
        frequency: "TDS (Post-meal & Bedtime)",
        duration: "10 Days",
        instructions: "Take 10-15 minutes after meals and right before sleeping.",
        category: "Antacid Raft",
        allergyTags: []
      },
      {
        brandName: "Motilium",
        genericName: "Domperidone",
        strength: "10 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "BD (Pre-meal)",
        duration: "7 Days",
        instructions: "Take 15 minutes before lunch and dinner.",
        category: "Prokinetic",
        allergyTags: ["Domperidone allergy"]
      }
    ],
    labTests: ["H. Pylori Stool Antigen Test", "Endoscopy (if persistent alarm symptoms like weight loss or dysphagia)"],
    advice: "Eat small, frequent meals (5 times a day). Never lie down flat within 2 hours after eating. Avoid chili, tea, black coffee, oily samosas/pakoras, tomatoes, and smoking. Elevate bed head by 6 inches.",
    followUpDays: 14
  },
  {
    keywords: ["diabetes", "sugar", "hyperglycemia", "polyuria", "polydipsia", "hba1c", "blood glucose"],
    diagnosisMatch: "Type 2 Diabetes Mellitus with Metabolic Syndrome",
    suggestedMedicines: [
      {
        brandName: "Glucophage",
        genericName: "Metformin HCl",
        strength: "500 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "BD (With meals)",
        duration: "30 Days",
        instructions: "Take in the middle of breakfast and dinner to minimize GI upset.",
        category: "Antidiabetic",
        allergyTags: ["Metformin allergy", "Renal impairment eGFR <30"]
      },
      {
        brandName: "Lipiget",
        genericName: "Atorvastatin",
        strength: "20 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "HS (Bedtime)",
        duration: "30 Days",
        instructions: "Take once daily at bedtime for cardiovascular risk reduction.",
        category: "Statin",
        allergyTags: ["Statin allergy", "Active liver disease"]
      },
      {
        brandName: "Neurobion",
        genericName: "Vitamin B1 + B6 + B12",
        strength: "Standard",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "OD",
        duration: "30 Days",
        instructions: "Take once daily after lunch for diabetic neuropathy prophylaxis.",
        category: "Neurotropic Vitamin",
        allergyTags: []
      }
    ],
    labTests: ["HbA1c (Every 3 months)", "Fasting Blood Glucose & 2-Hour Postprandial", "Serum Creatinine & eGFR", "Urine for Microalbuminuria", "Lipid Profile"],
    advice: "Strict low glycemic index diet. Zero refined sugar, sweets, soft drinks, and bakery products. 30-45 minutes daily brisk walking. Regular foot inspection. Maintain home glucose log (Fasting target < 110 mg/dL, Post-prandial < 160 mg/dL).",
    followUpDays: 30
  },
  {
    keywords: ["hypertension", "high blood pressure", "bp", "headache", "palpitation", "dizziness"],
    diagnosisMatch: "Essential Primary Hypertension (Stage 1 / 2)",
    suggestedMedicines: [
      {
        brandName: "Norvasc",
        genericName: "Amlodipine Besylate",
        strength: "5 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "OD (Morning)",
        duration: "30 Days",
        instructions: "Take once daily in the morning at the same time with water.",
        category: "Calcium Channel Blocker",
        allergyTags: ["Amlodipine allergy"]
      },
      {
        brandName: "Concor",
        genericName: "Bisoprolol Fumarate",
        strength: "5 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "OD (Morning)",
        duration: "30 Days",
        instructions: "Take once daily in the morning. Check pulse regularly.",
        category: "Beta Blocker",
        allergyTags: ["Severe asthma", "Bradycardia < 50 bpm"]
      }
    ],
    labTests: ["12-Lead ECG", "Serum Electrolytes (Sodium, Potassium)", "Serum Creatinine & Urea", "Echocardiogram (if long-standing)"],
    advice: "DASH diet: Restrict dietary salt to < 3 grams per day (avoid table salt, pickles, papad, processed snacks). Exercise 30 minutes daily. Stress management. Record morning & evening BP readings in logbook.",
    followUpDays: 30
  },
  {
    keywords: ["tonsillitis", "pharyngitis", "sore throat", "throat pain", "strep", "difficulty swallowing", "hoarseness"],
    diagnosisMatch: "Acute Bacterial Tonsillopharyngitis",
    suggestedMedicines: [
      {
        brandName: "Augmentin",
        genericName: "Amoxicillin + Clavulanic Acid",
        strength: "625 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "BD (Every 12 hours)",
        duration: "7 Days",
        instructions: "Take at start of meals every 12 hours. Do not discontinue early.",
        category: "Penicillin Antibiotic",
        allergyTags: ["Penicillin allergy", "Amoxicillin allergy", "Beta-lactam allergy"]
      },
      {
        brandName: "Brufen",
        genericName: "Ibuprofen",
        strength: "400 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "BD (Post-meal)",
        duration: "5 Days",
        instructions: "Take strictly after meals for throat pain and inflammation.",
        category: "NSAID",
        allergyTags: ["NSAID allergy", "Ibuprofen allergy", "Peptic ulcer"]
      },
      {
        brandName: "Softin",
        genericName: "Loratadine",
        strength: "10 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "OD (Night)",
        duration: "5 Days",
        instructions: "Take at night before sleep.",
        category: "Antihistamine",
        allergyTags: []
      }
    ],
    labTests: ["Throat Swab Culture (if recurrent)", "Complete Blood Picture (CBC)"],
    advice: "Warm salt water gargles 3-4 times daily. Honey with warm water. Avoid cold drinks, ice cream, sour items, and spicy food. Drink warm soups.",
    followUpDays: 7
  },
  {
    keywords: ["asthma", "wheezing", "shortness of breath", "breathlessness", "bronchospasm", "chest tightness"],
    diagnosisMatch: "Acute Bronchial Asthma Exacerbation",
    suggestedMedicines: [
      {
        brandName: "Ventolin Inhaler",
        genericName: "Salbutamol (Albuterol)",
        strength: "100 mcg / puff",
        form: "Inhaler (MDI)",
        route: "Inhalation",
        dose: "2 puffs",
        frequency: "SOS (As needed)",
        duration: "As needed",
        instructions: "Inhale 2 puffs using spacer whenever wheezing or shortness of breath occurs (Max 8 puffs/day).",
        category: "Short Acting Bronchodilator",
        allergyTags: []
      },
      {
        brandName: "Seretide Evohaler",
        genericName: "Fluticasone + Salmeterol",
        strength: "125 / 25 mcg",
        form: "Inhaler (MDI)",
        route: "Inhalation",
        dose: "2 puffs",
        frequency: "BD (Morning & Night)",
        duration: "30 Days",
        instructions: "Inhale 2 puffs twice daily. Always rinse mouth thoroughly with water and spit out after inhalation to prevent oral thrush.",
        category: "Inhaled Corticosteroid + LABA",
        allergyTags: []
      },
      {
        brandName: "Montiget",
        genericName: "Montelukast Sodium",
        strength: "10 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "OD (Bedtime)",
        duration: "30 Days",
        instructions: "Take once daily at bedtime.",
        category: "Leukotriene Receptor Antagonist",
        allergyTags: []
      }
    ],
    labTests: ["Spirometry / Peak Expiratory Flow Rate (PEFR)", "Chest X-Ray PA View"],
    advice: "Avoid triggers: dust mites, carpet dust, pet dander, sudden temperature shifts, strong perfumes, and smoke. Always carry rescue Ventolin inhaler. Seek immediate ER help if cyanosis or severe retraction occurs.",
    followUpDays: 14
  },
  {
    keywords: ["uti", "urinary", "dysuria", "burning urination", "urine frequency", "bladder"],
    diagnosisMatch: "Acute Uncomplicated Urinary Tract Infection (Cystitis)",
    suggestedMedicines: [
      {
        brandName: "Cefspan",
        genericName: "Cefixime",
        strength: "400 mg",
        form: "Capsule",
        route: "Oral",
        dose: "1 capsule",
        frequency: "OD",
        duration: "7 Days",
        instructions: "Take once daily after food for 7 days. Complete full course.",
        category: "Cephalosporin Antibiotic",
        allergyTags: ["Cephalosporin allergy", "Cefixime allergy"]
      },
      {
        brandName: "Panadol Extra",
        genericName: "Paracetamol + Caffeine",
        strength: "500 mg + 65 mg",
        form: "Tablet",
        route: "Oral",
        dose: "1 tablet",
        frequency: "TDS",
        duration: "3 Days",
        instructions: "Take after meals for lower abdominal spasm and discomfort.",
        category: "Analgesic",
        allergyTags: ["Paracetamol allergy"]
      }
    ],
    labTests: ["Urine Routine Examination (R/E)", "Urine Culture & Sensitivity (C/S)"],
    advice: "Drink at least 3 to 4 liters of clean water daily. Cranberry juice/extract. Do not hold urine for long periods. Practice proper hygiene.",
    followUpDays: 7
  },
  {
    keywords: ["typhoid", "enteric", "step-ladder fever", "rose spots", "salmonella"],
    diagnosisMatch: "Enteric Fever (Typhoid) Suspected / Confirmed",
    suggestedMedicines: [
      {
        brandName: "Cefspan",
        genericName: "Cefixime",
        strength: "400 mg",
        form: "Capsule",
        route: "Oral",
        dose: "1 capsule",
        frequency: "BD (Every 12 hours)",
        duration: "10-14 Days",
        instructions: "Take twice daily after meals. Crucial to complete the full 14 days course even if fever subsides.",
        category: "Cephalosporin",
        allergyTags: ["Cephalosporin allergy"]
      },
      {
        brandName: "Panadol",
        genericName: "Paracetamol",
        strength: "500 mg",
        form: "Tablet",
        route: "Oral",
        dose: "2 tablets",
        frequency: "TDS / SOS",
        duration: "7 Days",
        instructions: "Take for high fever and headache. Cold sponging if temp > 102 F.",
        category: "Antipyretic",
        allergyTags: ["Paracetamol allergy"]
      },
      {
        brandName: "Risek",
        genericName: "Omeprazole",
        strength: "20 mg",
        form: "Capsule",
        route: "Oral",
        dose: "1 capsule",
        frequency: "OD (Morning)",
        duration: "14 Days",
        instructions: "Take 30 minutes before breakfast.",
        category: "PPI",
        allergyTags: []
      }
    ],
    labTests: ["Typhidot IgM & IgG", "Blood Culture & Sensitivity", "Complete Blood Count (CBC) with Platelets", "Liver Function Tests (LFTs)"],
    advice: "Strictly consume boiled or purified bottled water. Eat freshly cooked, soft, hygienic food. Avoid street food, raw fruits, salads, and non-pasteurized dairy.",
    followUpDays: 7
  }
];

export function generateAISuggestions({ diagnosis = "", symptoms = "", patientAllergies = "", currentMedicines = "" }) {
  const queryText = `${diagnosis} ${symptoms}`.toLowerCase();
  
  // Find best matching protocol
  let bestMatch = CLINICAL_PROTOCOLS[0];
  let highestScore = 0;

  for (const protocol of CLINICAL_PROTOCOLS) {
    let score = 0;
    for (const kw of protocol.keywords) {
      if (queryText.includes(kw.toLowerCase())) {
        score += 3;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = protocol;
    }
  }

  // Detect allergies
  const allergiesList = (patientAllergies || "").toLowerCase().split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  const warnings = [];

  const processedMedicines = bestMatch.suggestedMedicines.map(med => {
    const medWarnings = [];
    
    // Check allergy conflict
    for (const allergy of allergiesList) {
      const isAllergic = med.allergyTags.some(tag => 
        tag.toLowerCase().includes(allergy) || 
        allergy.includes(tag.toLowerCase()) ||
        med.brandName.toLowerCase().includes(allergy) ||
        med.genericName.toLowerCase().includes(allergy)
      );

      if (isAllergic) {
        const warningMsg = `CRITICAL ALLERGY ALERT: Patient is allergic to "${allergy}", which conflicts with ${med.brandName} (${med.genericName})!`;
        medWarnings.push(warningMsg);
        warnings.push({
          type: "ALLERGY_CONFLICT",
          severity: "HIGH",
          medicine: med.brandName,
          allergy: allergy,
          message: warningMsg
        });
      }
    }

    // Check duplicate or current medicine conflict
    const curMedsLower = (currentMedicines || "").toLowerCase();
    if (curMedsLower.includes(med.brandName.toLowerCase()) || curMedsLower.includes(med.genericName.toLowerCase().split(' ')[0])) {
      const dupMsg = `DUPLICATE MEDICATION WARNING: Patient is already reported to be taking ${med.brandName} / ${med.genericName}.`;
      medWarnings.push(dupMsg);
      warnings.push({
        type: "DUPLICATE_MEDICATION",
        severity: "MEDIUM",
        medicine: med.brandName,
        message: dupMsg
      });
    }

    return {
      ...med,
      hasWarning: medWarnings.length > 0,
      warnings: medWarnings
    };
  });

  return {
    matchedDiagnosis: bestMatch.diagnosisMatch,
    confidenceScore: highestScore > 0 ? "High (Matched Clinical Protocol)" : "Standard Clinical Baseline",
    suggestedMedicines: processedMedicines,
    labTests: bestMatch.labTests,
    advice: bestMatch.advice,
    followUpDays: bestMatch.followUpDays,
    warnings: warnings,
    disclaimer: "AI Clinical Suggestions are intended solely as clinical decision support. The attending physician must exercise independent medical judgment, verify dosages, and approve all prescriptions before issuance."
  };
}

export function validatePrescriptionSafety({ medicines = [], patientAllergies = "" }) {
  const warnings = [];
  const allergiesList = (patientAllergies || "").toLowerCase().split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  const categoriesSeen = new Map();

  medicines.forEach((med, idx) => {
    const name = (med.name || med.brandName || "").toLowerCase();
    const generic = (med.generic || med.genericName || "").toLowerCase();

    // Allergy check
    for (const allergy of allergiesList) {
      if (
        name.includes(allergy) || 
        generic.includes(allergy) ||
        (allergy.includes("penicillin") && (name.includes("augmentin") || generic.includes("amoxicillin"))) ||
        (allergy.includes("nsaid") && (name.includes("brufen") || name.includes("ponstan") || name.includes("voltral") || name.includes("arinac") || generic.includes("ibuprofen") || generic.includes("diclofenac"))) ||
        (allergy.includes("aspirin") && (name.includes("loprin") || generic.includes("aspirin"))) ||
        (allergy.includes("sulfa") && (name.includes("getryl") || generic.includes("glimepiride") || generic.includes("sulfamethoxazole")))
      ) {
        warnings.push({
          type: "ALLERGY_CONFLICT",
          severity: "HIGH",
          medicineIndex: idx,
          medicineName: med.name || med.brandName,
          allergy: allergy,
          message: `Allergy Conflict: Patient allergic to "${allergy}" cannot take ${med.name || med.brandName}`
        });
      }
    }

    // Duplicate class check
    const isNSAID = name.includes("brufen") || name.includes("ponstan") || name.includes("voltral") || name.includes("arinac");
    const isPPI = name.includes("risek") || name.includes("nexum") || generic.includes("omeprazole") || generic.includes("esomeprazole");
    const isParacetamol = name.includes("panadol") || generic.includes("paracetamol") || generic.includes("acetaminophen");

    if (isNSAID) {
      if (categoriesSeen.has("NSAID")) {
        warnings.push({
          type: "DUPLICATE_CLASS",
          severity: "MEDIUM",
          message: `Duplicate NSAID detected: Multiple non-steroidal anti-inflammatory drugs prescribed (${categoriesSeen.get("NSAID")} and ${med.name}). High risk of gastrointestinal toxicity.`
        });
      } else {
        categoriesSeen.set("NSAID", med.name);
      }
    }

    if (isPPI) {
      if (categoriesSeen.has("PPI")) {
        warnings.push({
          type: "DUPLICATE_CLASS",
          severity: "LOW",
          message: `Duplicate Proton Pump Inhibitor (PPI): Both ${categoriesSeen.get("PPI")} and ${med.name} are prescribed simultaneously.`
        });
      } else {
        categoriesSeen.set("PPI", med.name);
      }
    }

    if (isParacetamol) {
      if (categoriesSeen.has("PARACETAMOL")) {
        warnings.push({
          type: "DUPLICATE_CLASS",
          severity: "MEDIUM",
          message: `Duplicate Paracetamol formulation detected: Prescribing both ${categoriesSeen.get("PARACETAMOL")} and ${med.name} may exceed safe daily limits (4000mg/day).`
        });
      } else {
        categoriesSeen.set("PARACETAMOL", med.name);
      }
    }
  });

  return {
    isValid: warnings.filter(w => w.severity === "HIGH").length === 0,
    warnings
  };
}
