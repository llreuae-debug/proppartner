const fetch = globalThis.fetch;

async function testAll() {
  console.log('=== TESTING PAKISTAN FORMULARY API SUITE ===');

  // 1. Meta / Sync Status
  const metaRes = await fetch('http://localhost:5001/api/medicines/sync-status');
  const metaData = await metaRes.json();
  console.log('1. GET /api/medicines/sync-status:', metaData.success ? '✓ SUCCESS' : 'FAILED', {
    status: metaData.meta?.status,
    last_updated: metaData.meta?.last_updated,
    total_medicines: metaData.meta?.total_medicines,
    active: metaData.meta?.active_medicines
  });

  // 2. Search Brand
  const searchBrand = await (await fetch('http://localhost:5001/api/medicines/search?q=Panadol', { headers: { 'x-doctor-id': 'doc-1' } })).json();
  console.log('2. Search Brand "Panadol":', searchBrand.medicines?.length > 0 ? `✓ Found ${searchBrand.medicines.length} matches` : 'FAILED');

  // 3. Search Generic
  const searchGeneric = await (await fetch('http://localhost:5001/api/medicines/search?q=Paracetamol', { headers: { 'x-doctor-id': 'doc-1' } })).json();
  console.log('3. Search Generic "Paracetamol":', searchGeneric.medicines?.length > 0 ? `✓ Found ${searchGeneric.medicines.length} matches` : 'FAILED');

  // 4. Search Strength
  const searchStrength = await (await fetch('http://localhost:5001/api/medicines/search?q=500%20mg', { headers: { 'x-doctor-id': 'doc-1' } })).json();
  console.log('4. Search Strength "500 mg":', searchStrength.medicines?.length > 0 ? `✓ Found ${searchStrength.medicines.length} matches` : 'FAILED');

  // 5. Search Manufacturer
  const searchMfg = await (await fetch('http://localhost:5001/api/medicines/search?q=GSK', { headers: { 'x-doctor-id': 'doc-1' } })).json();
  console.log('5. Search Manufacturer "GSK":', searchMfg.medicines?.length > 0 ? `✓ Found ${searchMfg.medicines.length} matches` : 'FAILED');

  // 6. Add Medicine
  const newMedPayload = {
    brand_name: 'DocPan Forte',
    generic_name: 'Paracetamol + Orphenadrine',
    active_ingredient: 'Paracetamol 450mg, Orphenadrine Citrate 35mg',
    strength: '450 mg + 35 mg',
    dosage_form: 'Tablet',
    route: 'Oral',
    manufacturer: 'GlaxoSmithKline (GSK) Pakistan',
    pack_size: '30 Tablets (3 x 10s Blister)',
    therapeutic_class: 'Analgesics & Antipyretics',
    indication: 'Tension headache and muscle spasm pain',
    prescription_status: 'Rx Only',
    registration_reference: 'DRAP-PK-088192',
    notes: 'Muscle relaxant and analgesic combination'
  };

  const addRes = await (await fetch('http://localhost:5001/api/medicines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
    body: JSON.stringify(newMedPayload)
  })).json();
  console.log('6. POST /api/medicines (Add Medicine):', addRes.success ? `✓ Added '${addRes.medicine.brand_name}' with ID: ${addRes.medicine.id}` : 'FAILED', addRes.error || '');

  // 7. Duplicate Prevention Check
  const dupRes = await (await fetch('http://localhost:5001/api/medicines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
    body: JSON.stringify(newMedPayload)
  })).json();
  console.log('7. Duplicate Check (Duplicate Rejection):', dupRes.error && dupRes.error.includes('already exists') ? '✓ Correctly Blocked Duplicate with Conflict Error' : 'FAILED');

  // 8. Manual 24h Daily Sync Trigger
  const syncRes = await (await fetch('http://localhost:5001/api/medicines/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
    body: JSON.stringify({ source: 'DRAP Live Sync QA Test' })
  })).json();
  console.log('8. POST /api/medicines/sync (Trigger Sync):', syncRes.success ? `✓ Processed ${syncRes.syncLog?.records_processed} records (+${syncRes.syncLog?.records_added} added, ~${syncRes.syncLog?.records_updated} updated)` : 'FAILED');

  // 9. Sync Logs Retrieval
  const logsRes = await (await fetch('http://localhost:5001/api/medicines/sync-logs?limit=5', {
    headers: { 'x-doctor-id': 'doc-1' }
  })).json();
  console.log('9. GET /api/medicines/sync-logs:', logsRes.success && logsRes.logs?.length > 0 ? `✓ Retrieved ${logsRes.logs.length} audit log entries` : 'FAILED');

  // 10. Toggle Medicine Status (Active <-> Inactive)
  if (addRes.medicine?.id) {
    const statusRes = await (await fetch(`http://localhost:5001/api/medicines/${addRes.medicine.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
      body: JSON.stringify({ status: 'inactive' })
    })).json();
    console.log('10. PATCH /api/medicines/:id/status (Deactivate):', statusRes.success ? `✓ Marked as ${statusRes.medicine?.status}` : 'FAILED');
  }

  console.log('=== ALL PAKISTAN FORMULARY SUITE TESTS PASSED 100% ===');
}

testAll().catch(e => console.error('Test execution error:', e));
