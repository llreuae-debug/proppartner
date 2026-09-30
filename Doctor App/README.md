# DocCare — Healthcare Practice Management & Digital Prescription OS

DocCare is a modern, mobile-first, installable PWA web application tailored for medical practitioners in Pakistan and worldwide. It streamlines patient scheduling, longitudinal health record management, clinical AI assistance, pixel-perfect A4 prescription PDF generation, and automated WhatsApp delivery.

---

## 🌟 Key Features Delivered

### STEP 1: Doctor Account & Profile
- **Authentication**: Sign up and login via email or phone + password with demo OTP verification.
- **Comprehensive Profile**: Full name, specialization, qualifications (`MBBS`, `FCPS`, `MRCP`, `MCPS`, etc.), PMDC / Registration number, years of clinical experience, consultation fees (in PKR), clinic name, physical address, interactive Google Maps location pin, phone, WhatsApp dispatch number, and email.
- **Weekly Schedule & Slot Builder**: Configure consultation days (e.g., Monday through Saturday) and dynamic 30-minute time slots.
- **Public Profile & Desk QR Stand**: Shareable public link (`/doctor/:slug`) and dynamic QR code generator with printable desk stand layout for patient waiting areas.

### STEP 2: Appointment Management & Patient Timelines
- **Double-Booking Prevention**: Slot conflict engine ensures patients cannot book duplicate or already reserved time slots.
- **Online Patient Booking Form**: Captures name, age, gender, phone/WhatsApp, and detailed medical history (known drug allergies, chronic conditions like Diabetes/Hypertension/Asthma, current medications, reason for visit).
- **Appointment Lifecycle**: Status tracking across `Pending`, `Confirmed`, `Completed`, `Cancelled`, and `No-show`.
- **Doctor Dashboard**: Today's active queue, upcoming appointments, consultation history, and fast search by patient name or phone number.
- **Longitudinal Patient Records**: Centralized health timeline showing all past visits, prescriptions, vitals trends, and allergy profiles in one view.

### STEP 3: AI-Assisted Prescription Writer
- **105+ Common Medicines Database**: Pre-seeded with medicines widely prescribed in Pakistan (Panadol, Augmentin, Risek, Novidat, Cefspan, Flagyl, Softin, Klaricid, Lipiget, Glucophage, Concor, Ventolin, Seretide, Montiget, Surbex-Z, Neurobion, etc.) with brand, generic, strength, form (tablet, syrup, suspension, injection, inhaler, drops, sachet), typical dosage, and route.
- **Fast Autocomplete Search**: Real-time typeahead search filtering by brand or generic salt name.
- **AI Clinical Assistant Engine**: Enter diagnosis & presenting complaints to generate structured recommendations (medicine names, dose, frequency, duration, food timings, recommended lab tests, and dietary advice).
- **Active Safety & Allergy Warning Detection**: Warns automatically if any prescribed medication conflicts with the patient's listed drug allergies (e.g., Penicillin, NSAIDs, Sulfa drugs) or if duplicate drug classes are detected (e.g. 2 NSAIDs or 2 PPIs).
- **Clinical Prescription Templates**: Reusable templates for URTI/Flu, Acute Gastroenteritis, Type 2 Diabetes/Hypertension, and GERD/Gastritis with 1-click apply and custom template saving.
- **Medical Disclaimer**: Clear disclaimer banner ensuring doctors review and take clinical responsibility.

### STEP 4: Pixel-Perfect A4 PDF Prescription Engine
- **Header**: Doctor's profile photo/clinic logo, full name, qualifications, specialization, PMDC registration number, clinic name, physical address, phone, and email.
- **Body**: Patient name, age, gender, date, unique Rx ID, allergy alerts, vital signs (BP, Pulse, Temp, Weight, SpO2), clinical diagnosis, detailed Rx table with meal timing instructions, lab investigations advised, clinical advice, and follow-up date.
- **Footer**: Attending physician's digital signature, official clinic stamp, verification QR code pointing to public verifiable prescription link (`/verify/:token`), "Get well soon" wish line, and legal disclaimer.
- **Design Customization**: Real-time palette accent switcher (Teal, Medical Blue, Navy, Indigo, Purple, Slate).
- **Options**: Live preview modal, print on any A4 printer, and high-resolution downloadable PDF via vector/canvas rendering.

### STEP 5: Instant WhatsApp Prescription Dispatch
- **"Send to Patient" Button**: Dispatches prescription directly to the patient's WhatsApp number with pre-filled message: `"Hello [Patient Name], your digital prescription from Dr. [Name] is ready: [Secure Link]"`.
- **Expiring Secure Links**: Token-verified public prescription verification link (`/verify/:token`).
- **Comprehensive Dispatch Logs**: Detailed transmission history recording delivery timestamps, recipient phone numbers, delivery status, and 1-click resend.

### STEP 6: Security, Compliance & Extras
- **Doctor Isolation**: Role-based access ensuring each doctor only accesses their own patients and prescriptions.
- **Audit Trail**: Activity logs recording all logins, appointment bookings, and prescription issuances.
- **Full Database Export & Restore**: 1-click JSON backup download and archive restoration.
- **Bilingual English & Urdu Toggle**: Full UI localization in Urdu (اردو) with Nastaliq typography and RTL support.
- **PWA Ready**: Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) for installable desktop/mobile experience.

---

## 🚀 Run Instructions

### 1. Start Both Backend & Frontend Concurrently
```bash
npm run dev
```
- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:5001`

### 2. Run Backend Server Only
```bash
npm run server
```

### 3. Run Frontend Only
```bash
npm run client
```

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🔑 Environment Variables & Secrets

Add the following keys in your `.env` or Replit Secrets:

| Secret Name | Description | Required / Optional |
|---|---|---|
| `PORT` | Backend server port (Default: `5001`) | Optional |
| `VITE_API_URL` | API base URL for client (Default: `http://localhost:5001`) | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key for enhanced LLM suggestions (Built-in clinical rule engine active as fallback) | Optional |
| `GEMINI_API_KEY` | Google Gemini API Key for AI synthesis | Optional |
| `WHATSAPP_CLOUD_API_KEY` | WhatsApp Business Cloud API token (Uses instant `wa.me` click-to-chat if empty) | Optional |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone number ID | Optional |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account ID | Optional |

---

## 👩‍⚕️ Demo Doctor Accounts

DocCare comes pre-seeded with 3 demo doctors:

1. **Dr. Ayesha Siddiqui**
   - Specialization: Consultant Physician & Diabetologist
   - Qualifications: MBBS (KEMU), FCPS (Internal Medicine), MRCP (UK)
   - PMDC #: `49821-P`
   - Clinic: Shifa Executive Clinic, Lahore

2. **Dr. Muhammad Tariq Khan**
   - Specialization: Consultant Cardiologist & Heart Specialist
   - Qualifications: MBBS (DMC), FCPS (Cardiology)
   - PMDC #: `34102-S`
   - Clinic: Karachi Heart Institute, Clifton Karachi

3. **Dr. Fatima Noor**
   - Specialization: Consultant Pediatrician & Child Specialist
   - Qualifications: MBBS (RMC), MCPS (Pediatrics), DCH (Glasgow)
   - PMDC #: `61284-F`
   - Clinic: Little Angels Child Health Care, Islamabad

---

## 📱 WhatsApp Setup & Architecture (Step 5)

DocCare provides two messaging operational modes: **Mode A (Direct WhatsApp Web/App via `wa.me`)** which works instantly with zero API keys, and **Mode B (Meta WhatsApp Business Cloud API)** for automated server-to-server messaging.

### Mode A: Direct WhatsApp (`wa.me` Link Dispatch) — Default
- **No Setup Required**: Works out of the box with zero API tokens or configurations.
- **Workflow**:
  1. Doctor finalizes a prescription.
  2. Doctor clicks **"Send via WhatsApp"**.
  3. DocCare generates a secure, random 32-byte cryptographic token (`/rx/:share_token`) with the chosen expiry duration (1, 3, 7, 30 days).
  4. The phone number is normalized to international format without a leading plus (e.g., `0300-1234567` becomes `923001234567`).
  5. The message is pre-populated with placeholders replaced (`[Patient Name]`, `[Doctor Name]`, `[Clinic Name]`, `[Link]`, `[Expiry Date]`).
  6. Clinical privacy is enforced: **medication and diagnosis names are strictly omitted** from the message body text.
  7. DocCare opens `https://wa.me/<number>?text=<encoded_text>` in a new tab, launching WhatsApp Web or mobile app so the doctor sends it from their own WhatsApp.
  8. The dispatch is logged in `message_log` with `channel: 'wa_link'` and `status: 'opened'`.
  9. Includes an **SMS Fallback** (`sms:<number>?body=...`) and **Copy Link** button if the patient's phone does not support WhatsApp.

---

### Mode B: Meta WhatsApp Business Cloud API (Automated)

When configured in environment variables / Replit Secrets, Mode B enables a **"Send automatically (Cloud API)"** option in the send modal.

#### Required Environment Variables:
```env
WHATSAPP_CLOUD_TOKEN=EAA...YourMetaSystemUserToken...
WHATSAPP_PHONE_NUMBER_ID=109283746501928
WHATSAPP_BUSINESS_ACCOUNT_ID=982736451029384
WHATSAPP_WEBHOOK_VERIFY_TOKEN=doccare_webhook_token_2026
WHATSAPP_TEMPLATE_NAME=doccare_prescription_ready
WHATSAPP_TEMPLATE_LANG=en
```

#### Step-by-Step Meta WhatsApp Cloud API Setup:
1. **Create a Meta Developer App**:
   - Go to [developers.facebook.com](https://developers.facebook.com).
   - Create an app with type **Business** and name it **DocCare Prescriptions**.
   - Add the **WhatsApp** product to your app.
2. **Configure WhatsApp Phone Number**:
   - In the WhatsApp Getting Started page, select or add your clinic's business phone number.
   - Copy the **Phone Number ID** into `WHATSAPP_PHONE_NUMBER_ID` and **WhatsApp Business Account ID** into `WHATSAPP_BUSINESS_ACCOUNT_ID`.
   - Generate a permanent System User Access Token and save it in `WHATSAPP_CLOUD_TOKEN`.
3. **Submit Message Template for Approval**:
   - In Meta WhatsApp Manager under **Message Templates**, create a template with name `doccare_prescription_ready` (category: `Utility`, language: `en`).
   - **Template Body Text**:
     ```
     Hello {{1}}, your prescription from Dr. {{2}} ({{3}}) is ready. View or download your official digital prescription here: {{4}}. This secure link expires in {{5}} days. Get well soon.
     ```
   - **Sample Variable Values for Approval**:
     - `{{1}}`: Kamran Ali
     - `{{2}}`: Dr. Ayesha Siddiqui
     - `{{3}}`: Shifa Executive Clinic
     - `{{4}}`: https://doccare.pk/rx/7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
     - `{{5}}`: 7
4. **Configure Webhook**:
   - In your Meta Developer App, go to **WhatsApp > Configuration > Webhook**.
   - **Callback URL**: `https://your-domain.com/api/webhooks/whatsapp`
   - **Verify Token**: `doccare_webhook_token_2026` (matching `WHATSAPP_WEBHOOK_VERIFY_TOKEN`).
   - Click **Verify and Save**.
   - Subscribe to the `messages` webhook field.
   - When patients receive or open messages, Meta sends delivery updates (`sent`, `delivered`, `read`, `failed`) which automatically update DocCare's real-time `message_log`.

---

## 🔒 Security & Expiring Link Rules

- **Cryptographic Access Key**: Public links use 32-byte cryptographically secure random hex tokens (`crypto.randomBytes(32).toString('hex')`). Sequential database IDs are never exposed.
- **Link Expiration**:
  - Links automatically expire after doctor's selected duration (1, 3, 7, 30 days).
  - When accessed after expiration, or if revoked by the doctor, or if max downloads are reached, the system renders a friendly contact page with the doctor's phone number and clinic details.
- **Download Counting & Auditing**:
  - Every download increments `download_count` and updates `last_downloaded_at`.
  - Downloads, link creations, and revocations are logged in the practice audit trail.
- **Response Headers**:
  - `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, private`
  - `X-Robots-Tag: noindex, nofollow, noarchive`
  - `Content-Disposition: inline; filename="RX-2026-00001.pdf"`

---

## 📡 Step 5 New API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/public/rx-info/:share_token` | Public | Returns validity status, doctor contact, and expiry details for a share token |
| `GET` | `/api/public/rx/:share_token` | Public | Streams the secure A4 PDF (rate-limited, increments download counter, applies security headers) |
| `POST` | `/api/prescriptions/:id/share` | Doctor | Creates or returns active expiring share token for a finalized prescription |
| `GET` | `/api/prescriptions/:id/shares` | Doctor | Lists all active and historical share links for a prescription |
| `POST` | `/api/shares/:id/revoke` | Doctor | Revokes an active public share link |
| `GET` | `/api/whatsapp/config` | Doctor | Returns WhatsApp mode availability (Mode A / Mode B) and doctor template defaults |
| `POST` | `/api/whatsapp/send-link` | Doctor | Mode A: Normalizes phone to `923XXXXXXXXX`, logs dispatch, returns `wa.me` & `sms` URLs |
| `POST` | `/api/whatsapp/send-cloud` | Doctor | Mode B: Dispatches pre-approved template message via Meta WhatsApp Business Cloud API |
| `GET` | `/api/webhooks/whatsapp` | Public | Meta Webhook verification handshake (`hub.challenge`) |
| `POST` | `/api/webhooks/whatsapp` | Public | Meta Webhook delivery status updates (`sent`, `delivered`, `read`, `failed`) |
| `GET` | `/api/messages` | Doctor | Filterable list of all WhatsApp dispatches (date, status, type, patient, search query) |
| `GET` | `/api/messages/stats` | Doctor | Summary metrics: prescriptions sent today, failed count, total dispatches |
| `PUT` | `/api/doctor/whatsapp-settings` | Doctor | Updates doctor's WhatsApp message template and default link expiry days |

---

## 🧪 How to Test End-to-End

### 1. Test Prescription Share & WhatsApp Link (Mode A)
1. Open the DocCare application at `http://localhost:5173`.
2. Navigate to **Prescriptions**, select an existing finalized prescription (e.g. `RX-2026-00001`), or create and finalize a new prescription.
3. Click **"Print / Share PDF"** or **"Send via WhatsApp"**.
4. In the WhatsApp modal:
   - Notice the phone number normalized to Pakistani format (`0301-4458921` -> `923014458921`).
   - Select expiry duration (e.g., 7 days).
   - Verify that medication and diagnosis names are omitted from the message text for confidentiality.
   - Click **"Open in WhatsApp (Mode A)"**.
5. WhatsApp opens in a new tab with the pre-filled message and secure link `http://localhost:5173/rx/<token>`.
6. Click the secure link or open `http://localhost:5173/rx/<token>` in an incognito browser window:
   - Verify the A4 prescription PDF renders cleanly with doctor details, stamp, signature, and verification QR.
   - Verify "Download A4 PDF" downloads `<RX_NUMBER>.pdf`.
7. Return to the doctor app and navigate to the **"WhatsApp & Messages"** sidebar tab:
   - Verify the dispatch is logged with status `App Opened`, recipient phone number, and download counter.

### 2. Test Link Expiry and Revocation
1. In the **WhatsApp & Messages** tab or on the prescription's **Sent History** drawer, click the trash icon next to an active share to **Revoke Link**.
2. Open the revoked link `http://localhost:5173/rx/<token>` in a browser.
3. Verify the friendly expiration notice displays: *"Prescription Link Expired. This secure prescription download link has expired or reached its access limit. Please contact your doctor."* along with the doctor's name, clinic address, and direct call button.

### 3. Test Appointment Reminders and Confirmations
1. Go to **Appointments** or **Dashboard**.
2. On any appointment card, click **"Reminder"**.
3. In the modal, verify the reminder message is pre-filled: *"Hello [Patient], this is a reminder of your appointment with Dr. [Doctor] on [Date] at [Time], [Clinic]."*
4. Click **"Open in WhatsApp"** and verify the message log records `type: 'reminder'`.

