# PropPartner — 3D Real Estate Affiliate Partner Network & Super Admin ERP Platform

[![Production Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/llreuae-debug/proppartner)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-blue.svg)](https://github.com/llreuae-debug/proppartner)
[![Security](https://img.shields.io/badge/Auth-WebCrypto%20PBKDF2-gold.svg)](https://github.com/llreuae-debug/proppartner)
[![Three.js](https://img.shields.io/badge/3D-Three.js%20r128-black.svg)](https://github.com/llreuae-debug/proppartner)

**PropPartner** is a production-ready, ultra-premium Real Estate Affiliate Partner Network and Super Admin Enterprise Management Platform. It connects high-converting 3D architectural visualizations with a complete CRM, duplicate lead management, milestone-based commission approval workflows, financial ledgers, and role-based access control.

---

## 🌟 Key Platform Capabilities

### 1. 🌐 Public 3D Architectural Landing Experience
- **Cinematic Three.js 3D Hero Scene**: Vertical procedural tower evolution responding to user scroll.
- **3D Network Visualization Graph**: Interactive node cluster demonstrating the **Real Estate → Network → Referral → Sale → Commission** economic ecosystem.
- **Interactive Commission Calculator**: Real-time commission simulator calculating base earnings, milestone bonuses, and projected monthly payouts across 5 flagship developments.
- **Multi-Currency Engine**: Instant toggle across **PKR (₨)**, **USD ($)**, and **AED (د.إ)**.
- **Dynamic Marketing Toolkit & FAQ Accordion**.

### 2. 👑 Super Admin Enterprise ERP & Governance
- **Primary Super Admin Identity**: `llre.uae@gmail.com` with root authorization.
- **Executive BI Dashboard**: Real-time KPI ribbons, quarterly sales volume charts, commission payout status, and transaction velocity meters.
- **12-Tab Project Detail View**: Master inventory control, unit status matrix (Available, Reserved, Sold), developer escrow specifications, and tiered affiliate commission rates.
- **Duplicate Lead Resolution CRM**: 6-stage lead pipeline with auto-flagging of duplicate phone numbers and emails for administrative attribution review.
- **Milestone Commission Approvals**: Structured 4-stage release schedule (Booking 20%, Groundbreaking 30%, Structure 30%, Handover 20%).
- **Payment & Voucher Center**: Wire transfer settlement, RTGS batch generation, and downloadable payout vouchers.
- **Master & Project Financial Ledgers**: Immutable double-entry financial ledger recording gross sales, escrow inflows, affiliate commissions, and net developer yields with CSV/PDF exports.

### 3. 💼 Affiliate Partner Portal (100% Mobile-First PWA)
- **Unique Referral Link Generator**: Global and project-specific referral link generator with QR code export and native smartphone sharing.
- **Commission & Payout Tracker**: Real-time ledger of earned, pending, and payable commissions.
- **Marketing Kit Downloader**: Access to lookbooks, WhatsApp copy kits, high-res renders, and developer fact sheets.
- **AI Support Assistant**: 24/7 interactive concierge answering property specs and commission policies.

### 4. 🔐 Security, Authentication & User Management
- **Hardware-Accelerated Cryptographic Hashing**: Web Crypto API `PBKDF2-SHA256` (100,000 salted iterations) with zero plaintext passwords stored.
- **Live Password Strength Meter**: 4-tier visual validator enforcing 12+ characters, uppercase, lowercase, numbers, and special symbols.
- **Zero-Knowledge Forgot Password Flow**: Single-use, cryptographically random 24-byte tokens auto-expiring after 15 minutes.
- **Super Admin User Accounts Governance**: Account locking/unlocking, suspension, forced password reset on first login, and active multi-device session revocation.
- **Granular RBAC Matrix**: 16+ permissions across 7 roles (`Super Admin`, `Admin`, `Sales Manager`, `Sales Agent`, `Finance`, `Support`, `Affiliate Partner`).
- **🚨 Emergency Control Center**: 1-click global actions to terminate all active sessions, lock non-admin accounts, disable registrations, or activate maintenance mode.

---

## 🛠️ Technology Stack

- **Build Engine & Bundler**: [Vite](https://vitejs.dev/)
- **3D Graphics & Animations**: [Three.js](https://threejs.org/) + Canvas 2D
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Cryptography**: Web Crypto API (`crypto.subtle`, `crypto.getRandomValues`)
- **PWA Architecture**: Manifest v3 (`public/manifest.webmanifest`) + Offline Service Worker (`public/sw.js`)
- **Styling**: Vanilla CSS3 with mobile-first CSS variables, glassmorphism, and responsive breakpoints.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# 1. Clone repository
git clone https://github.com/llreuae-debug/proppartner.git
cd proppartner

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build
```bash
# Compile and optimize production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📱 Navigation & Direct Portal Routes

| Route | Destination | Description |
| :--- | :--- | :--- |
| `http://localhost:5173/` | **Public 3D Landing Page** | Public marketing showcase with 3D towers and calculator |
| `http://localhost:5173/#admin` | **Super Admin Portal** | Executive BI, CRM, Ledgers, Users & Security Center |
| `http://localhost:5173/#partner` | **Affiliate Partner Portal** | Partner workspace, lead submission & earnings tracker |
| `http://localhost:5173/#reset-password?token=...` | **Password Reset** | Single-use secure token password reset dialog |

---

## 🔒 Security Best Practices

- **Zero Plaintext Secrets**: No API keys, JWT tokens, database passwords, or private certificates are committed.
- **Salted Hash Verification**: User authentication uses client/server Web Crypto PBKDF2 hashing with unique 16-byte cryptographic salts.
- **Session Revocation**: Password updates immediately terminate all secondary active sessions across all devices.

---

## 📄 License
PropPartner Network © 2026. All rights reserved.
