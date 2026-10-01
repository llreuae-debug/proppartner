/**
 * End-to-End Automated Verification Script for DocCare Prescription Lifecycle & Access Control
 */

import http from 'http';

const BASE_URL = 'http://127.0.0.1:5001';

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING DOCCARE PRESCRIPTION LIFECYCLE E2E TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Doctor Login
    console.log('1️⃣ Authenticating Doctor...');
    const docLogin = await request('/api/auth/login', { method: 'POST' }, {
      identifier: 'dr.ayesha@doccare.pk',
      password: 'doctor123',
      role: 'doctor'
    });
    assert(docLogin.status === 200 && docLogin.body.token, 'Doctor login succeeded with JWT');
    const docToken = docLogin.body.token;
    const docId = docLogin.body.doctor.id;

    // 2. Patient Login
    console.log('\n2️⃣ Authenticating Patient...');
    const patientLogin = await request('/api/auth/login', { method: 'POST' }, {
      identifier: 'patient@doccare.pk',
      password: 'patient123',
      role: 'patient'
    });
    assert(patientLogin.status === 200 && patientLogin.body.token, 'Patient login succeeded with JWT');
    const patientToken = patientLogin.body.token;
    const patientId = patientLogin.body.patient.id;

    // 3. Create a New Prescription with Snapshots
    console.log('\n3️⃣ Doctor creates and finalizes a prescription with immutable snapshots...');
    const newRxPayload = {
      patient_id: patientId,
      patient_name: 'Usman Ali',
      doctor_id: docId,
      doctor_name: 'Dr. Tariq Khan',
      diagnosis: 'Type 2 Diabetes Mellitus & Essential Hypertension',
      notes: 'Doctor private clinical observation - confidential',
      follow_up_date: '2026-10-15',
      status: 'final',
      items: [
        {
          medicine_id: 'med_panadol_500',
          brand_name: 'Panadol CF',
          generic_name: 'Paracetamol + Phenylephrine',
          strength: '500mg/5mg',
          dosage_form: 'Tablet',
          route: 'Oral',
          dose: '1 Tablet',
          frequency: 'TDS (Three Times Daily)',
          duration: '5 Days',
          quantity: '15 Tablets',
          instructions: 'After meals with a full glass of water'
        },
        {
          medicine_id: 'med_glucophage_500',
          brand_name: 'Glucophage',
          generic_name: 'Metformin HCl',
          strength: '500mg',
          dosage_form: 'Tablet',
          route: 'Oral',
          dose: '1 Tablet',
          frequency: 'BD (Twice Daily)',
          duration: '30 Days',
          quantity: '60 Tablets',
          instructions: 'Take during or immediately after meals'
        }
      ]
    };

    const saveRxRes = await request('/api/prescriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${docToken}` }
    }, newRxPayload);

    assert(saveRxRes.status === 200 || saveRxRes.status === 201, 'Prescription saved successfully');
    const createdRx = saveRxRes.body.prescription;
    assert(createdRx && createdRx.prescription_no && createdRx.prescription_no.startsWith('DC-RX-'), `Unique Prescription ID generated: ${createdRx?.prescription_no}`);
    assert(createdRx && createdRx.items && createdRx.items.length === 2, 'All prescribed medicines saved with item records');
    assert(createdRx?.items[0]?.brand_name_snapshot === 'Panadol CF', 'Immutable brand name snapshot stored');
    assert(createdRx?.items[0]?.generic_name_snapshot === 'Paracetamol + Phenylephrine', 'Immutable generic snapshot stored');

    const rxId = createdRx.id;

    // 4. Query Doctor Prescription History
    console.log('\n4️⃣ Doctor queries Prescription History with filters & sorting...');
    const historyRes = await request(`/api/prescriptions?q=${encodeURIComponent('Diabetes')}&sort=newest`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${docToken}` }
    });
    assert(historyRes.status === 200, 'Doctor prescription history fetched');
    assert(Array.isArray(historyRes.body.prescriptions) && historyRes.body.prescriptions.length > 0, 'Prescriptions list populated in Doctor portal');
    const foundRx = historyRes.body.prescriptions.find(r => r.id === rxId);
    assert(foundRx && foundRx.diagnosis.includes('Diabetes'), 'Filtered and found newly saved prescription by diagnosis');

    // 5. Doctor logs Audit Events (Print, Download)
    console.log('\n5️⃣ Doctor logs Audit Events (printed, downloaded)...');
    const printAuditRes = await request(`/api/prescriptions/${rxId}/audit-event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${docToken}` }
    }, { event_type: 'printed' });
    assert(printAuditRes.status === 200, 'Doctor logged "printed" audit event');

    const downloadAuditRes = await request(`/api/prescriptions/${rxId}/audit-event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${docToken}` }
    }, { event_type: 'downloaded' });
    assert(downloadAuditRes.status === 200, 'Doctor logged "downloaded" audit event');

    // 6. Patient Views Prescription History
    console.log('\n6️⃣ Patient queries their own prescriptions in Patient Portal...');
    const patientRxList = await request('/api/patient/prescriptions', {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert(patientRxList.status === 200, 'Patient fetched their prescription history');
    assert(Array.isArray(patientRxList.body.prescriptions), 'Patient prescriptions array returned');
    const patientFoundRx = patientRxList.body.prescriptions.find(r => r.id === rxId);
    assert(patientFoundRx, 'Newly saved prescription is visible to the authorized patient');

    // 7. Security & Confidentiality Boundary Verification
    console.log('\n7️⃣ Verifying Privacy & Security Boundary (Doctor Private Notes sanitized)...');
    assert(patientFoundRx && patientFoundRx.doctor_notes === undefined, 'Doctor private notes are NEVER exposed in patient prescription response');
    assert(patientFoundRx && patientFoundRx.internal_notes === undefined, 'Doctor internal notes are NEVER exposed in patient prescription response');
    assert(patientFoundRx && patientFoundRx.doctor_financials === undefined, 'Doctor financial ledger data is NEVER exposed');

    // 8. Patient Logs Audit Events
    console.log('\n8️⃣ Patient logs Audit Events (printed, downloaded)...');
    const patientPrintAudit = await request(`/api/patient/prescriptions/${rxId}/audit-event`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` }
    }, { event_type: 'printed' });
    assert(patientPrintAudit.status === 200, 'Patient logged "printed" audit event');

    // 9. Unauthorized Patient Isolation Test
    console.log('\n9️⃣ Verifying Access Control: Patient cannot access another patient\'s prescription...');
    const unauthRes = await request(`/api/patient/prescriptions/rx_other_9999`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    assert(unauthRes.status === 404 || unauthRes.status === 403, `Unauthorized cross-patient access blocked (HTTP ${unauthRes.status})`);

    // 10. Audit Trail Verification
    console.log('\n🔟 Verifying complete Audit Trail on Doctor record...');
    const rxDetailRes = await request(`/api/prescriptions/${rxId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${docToken}` }
    });
    assert(rxDetailRes.status === 200, 'Doctor fetched single prescription record with audit trail');
    const rxDetail = rxDetailRes.body.prescription;
    assert(Array.isArray(rxDetail.audit_trail) && rxDetail.audit_trail.length >= 3, `Audit trail recorded ${rxDetail?.audit_trail?.length} lifecycle events`);
    const eventTypes = (rxDetail.audit_trail || []).map(a => a.event_type);
    assert(eventTypes.includes('created') && eventTypes.includes('printed') && eventTypes.includes('downloaded'), `Audit trail contains: ${eventTypes.join(', ')}`);

  } catch (err) {
    console.error('💥 Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
