// Platform Store - PropPartner Core Relational State & Financial Engine

const STORE_STORAGE_KEY = 'proppartner_platform_data_v2';

export const CURRENCY_RATES = {
  PKR: { symbol: '₨', prefix: 'PKR ', rate: 1, label: 'PKR (₨)' },
  USD: { symbol: '$', prefix: '$', rate: 0.0036, label: 'USD ($)' },
  AED: { symbol: 'د.إ', prefix: 'AED ', rate: 0.0132, label: 'AED (د.إ)' }
};

export function formatCurrencyValue(amount, currency = 'PKR') {
  if (isNaN(amount) || amount === null || amount === undefined) return 'PKR 0';
  const num = Number(amount);
  const cfg = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
  const converted = num * cfg.rate;

  if (currency === 'PKR') {
    if (Math.abs(converted) >= 10000000) {
      return `PKR ${(converted / 10000000).toFixed(2)} Cr`;
    } else if (Math.abs(converted) >= 100000) {
      return `PKR ${(converted / 100000).toFixed(2)} Lac`;
    }
    return `PKR ${converted.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  } else if (currency === 'USD') {
    return `$${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  } else if (currency === 'AED') {
    return `AED ${converted.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
  }
  return `${cfg.prefix}${converted.toLocaleString()}`;
}

// Initial Comprehensive Seed Data
const INITIAL_PROJECTS = [
  {
    id: 'luminary-towers',
    name: 'The Luminary Sky Residences',
    developer: 'Emaar Pakistan / HRL Group',
    location: 'Main Boulevard, Financial District, Phase 8',
    city: 'Karachi',
    country: 'Pakistan',
    type: 'Luxury High-Rise Residential',
    description: 'Ultra-luxury 48-storey twin towers featuring panoramic ocean & skyline penthouses, private sky club, infinity pool, and concierge services.',
    status: 'Active',
    launchDate: '2024-03-15',
    completionDate: '2027-12-31',
    startingPrice: 38500000,
    commissionModel: 'Percentage',
    commissionRate: 3.5,
    commissionTiers: [
      { minSales: 1, maxSales: 2, rate: 3.0 },
      { minSales: 3, maxSales: 5, rate: 3.5 },
      { minSales: 6, maxSales: 999, rate: 4.2 }
    ],
    unitsTotal: 120,
    unitsAvailable: 14,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    website: 'https://luminary.proppartner.network',
    brochureUrl: '/assets/luminary-brochure.pdf',
    contactPerson: 'Zayn Malik (Head of Sales)',
    contactPhone: '+92 300 8219001'
  },
  {
    id: 'elysium-waterfront',
    name: 'Elysium Waterfront Villas',
    developer: 'Damac / Premier Properties Ltd',
    location: 'Coastal Palm Avenue, Sector E',
    city: 'Dubai / Gwadar Coast',
    country: 'UAE / Pakistan',
    type: 'Waterfront Luxury Villas',
    description: 'Exclusive private island beachfront villas with private marina berths, smart home automation, and private beach access.',
    status: 'Active',
    launchDate: '2024-06-01',
    completionDate: '2026-10-30',
    startingPrice: 65000000,
    commissionModel: 'Percentage',
    commissionRate: 4.5,
    commissionTiers: [
      { minSales: 1, maxSales: 2, rate: 4.0 },
      { minSales: 3, maxSales: 5, rate: 4.5 },
      { minSales: 6, maxSales: 999, rate: 5.5 }
    ],
    unitsTotal: 36,
    unitsAvailable: 8,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80',
    website: 'https://elysium.proppartner.network',
    brochureUrl: '/assets/elysium-brochure.pdf',
    contactPerson: 'Fatima Al-Suwaidi',
    contactPhone: '+971 52 443 9081'
  },
  {
    id: 'nexus-horizon',
    name: 'Nexus Horizon Corporate Hub',
    developer: 'Habib & Sons Real Estate',
    location: 'Central Business District, Tech Corridor',
    city: 'Lahore / Islamabad',
    country: 'Pakistan',
    type: 'Commercial Office Suites & Retail',
    description: 'Grade-A LEED Platinum commercial towers with state-of-the-art tech incubator spaces, executive boardroom lounges, and high-street retail promenade.',
    status: 'Active',
    launchDate: '2023-11-10',
    completionDate: '2026-05-15',
    startingPrice: 24500000,
    commissionModel: 'Percentage',
    commissionRate: 3.0,
    commissionTiers: [
      { minSales: 1, maxSales: 3, rate: 3.0 },
      { minSales: 4, maxSales: 8, rate: 3.5 },
      { minSales: 9, maxSales: 999, rate: 4.0 }
    ],
    unitsTotal: 90,
    unitsAvailable: 22,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    website: 'https://nexus.proppartner.network',
    brochureUrl: '/assets/nexus-brochure.pdf',
    contactPerson: 'Hamza Farooq (Commercial Director)',
    contactPhone: '+92 321 9008812'
  },
  {
    id: 'crescent-bay',
    name: 'Crescent Bay Horizon Suites',
    developer: 'Emaar Properties Group',
    location: 'Seaview Waterfront Boulevard, DHA Phase 8',
    city: 'Karachi',
    country: 'Pakistan',
    type: 'Waterfront Serviced Apartments',
    description: 'Panoramic sea-facing 2, 3 and 4-bedroom serviced residences with branded hotel management, resort swimming lagoons, and private promenade access.',
    status: 'Active',
    launchDate: '2024-01-20',
    completionDate: '2027-06-30',
    startingPrice: 42000000,
    commissionModel: 'Percentage',
    commissionRate: 4.0,
    commissionTiers: [
      { minSales: 1, maxSales: 2, rate: 3.5 },
      { minSales: 3, maxSales: 5, rate: 4.0 },
      { minSales: 6, maxSales: 999, rate: 4.8 }
    ],
    unitsTotal: 84,
    unitsAvailable: 19,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    website: 'https://crescent.proppartner.network',
    brochureUrl: '/assets/crescent-brochure.pdf',
    contactPerson: 'Rehan Siddiqui',
    contactPhone: '+92 333 4455667'
  },
  {
    id: 'marina-enclave',
    name: 'The Marina Heights Enclave',
    developer: 'Al-Ghurair & Apex Developers',
    location: 'Dubai Marina North Shore / Gwadar West Bay',
    city: 'Dubai',
    country: 'UAE',
    type: 'Ultra-Luxury Penthouses & Duplexes',
    description: 'Super-prime high-floor duplexes and penthouses with 360-degree skyline views, private plunge pools, and helipad access.',
    status: 'Coming Soon',
    launchDate: '2025-01-15',
    completionDate: '2028-04-30',
    startingPrice: 95000000,
    commissionModel: 'Percentage',
    commissionRate: 5.0,
    commissionTiers: [
      { minSales: 1, maxSales: 1, rate: 4.5 },
      { minSales: 2, maxSales: 4, rate: 5.0 },
      { minSales: 5, maxSales: 999, rate: 6.0 }
    ],
    unitsTotal: 24,
    unitsAvailable: 24,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
    website: 'https://marina.proppartner.network',
    brochureUrl: '/assets/marina-brochure.pdf',
    contactPerson: 'Omar Al-Hashimi',
    contactPhone: '+971 50 119 2834'
  }
];

const INITIAL_AFFILIATES = [
  {
    id: 'AFF-000101',
    referralCode: 'AFF00101',
    name: 'Tariq Mansoor',
    email: 'tariq.mansoor@apexwealth.com',
    phone: '+92 300 1234567',
    whatsapp: '+92 300 1234567',
    country: 'Pakistan',
    city: 'Karachi',
    profession: 'Wealth Manager & Family Office Advisor',
    company: 'Apex Wealth Advisory',
    tier: 'Platinum',
    status: 'Approved',
    referralStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    bankName: 'Habib Bank Limited (HBL Prestige)',
    accountNumber: 'PK36HABB00012345678901',
    accountTitle: 'Tariq Mansoor Advisory',
    taxId: 'NTN-8921094-1',
    registeredDate: '2024-01-10',
    totalReferrals: 48,
    referralClicks: 342,
    referralVisits: 280,
    qrScans: 124,
    qualifiedLeads: 28,
    successfulSales: 7,
    conversionRate: '14.6%'
  },
  {
    id: 'AFF-000102',
    referralCode: 'SARAH2026',
    name: 'Sarah Al-Maktoum Jenkins',
    email: 'sarah.j@dubaiinvest.ae',
    phone: '+971 50 882 1902',
    whatsapp: '+971 50 882 1902',
    country: 'United Arab Emirates',
    city: 'Dubai',
    profession: 'International Property Consultant',
    company: 'Gulf Capital Partners',
    tier: 'Gold',
    status: 'Approved',
    referralStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    bankName: 'Emirates NBD',
    accountNumber: 'AE440260001234567890123',
    accountTitle: 'Sarah Jenkins Real Estate',
    taxId: 'TRN-1002938481',
    registeredDate: '2024-02-14',
    totalReferrals: 34,
    referralClicks: 215,
    referralVisits: 178,
    qrScans: 86,
    qualifiedLeads: 19,
    successfulSales: 4,
    conversionRate: '11.8%'
  },
  {
    id: 'AFF-000103',
    referralCode: 'HAMID77',
    name: 'Hamid Raza Qureshi',
    email: 'hamid.qureshi@qureshilaw.com',
    phone: '+92 321 8899221',
    whatsapp: '+92 321 8899221',
    country: 'Pakistan',
    city: 'Lahore',
    profession: 'Senior Corporate Attorney',
    company: 'Qureshi & Co Legal Partners',
    tier: 'Gold',
    status: 'Approved',
    referralStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    bankName: 'Standard Chartered Pakistan',
    accountNumber: 'PK12SCBL00998877665544',
    accountTitle: 'Hamid Raza Qureshi',
    taxId: 'NTN-4455667-2',
    registeredDate: '2024-02-28',
    totalReferrals: 26,
    referralClicks: 184,
    referralVisits: 142,
    qrScans: 62,
    qualifiedLeads: 14,
    successfulSales: 3,
    conversionRate: '11.5%'
  },
  {
    id: 'AFF-000104',
    referralCode: 'ELENA88',
    name: 'Elena Rostova',
    email: 'elena@monacoconsulting.com',
    phone: '+44 7700 900123',
    whatsapp: '+44 7700 900123',
    country: 'United Kingdom',
    city: 'London / Dubai',
    profession: 'Private Banker / Expat Asset Broker',
    company: 'Monaco Global Advisory',
    tier: 'Platinum',
    status: 'Approved',
    referralStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    bankName: 'HSBC UK Private Bank',
    accountNumber: 'GB29MIDL40051512345678',
    accountTitle: 'Elena Rostova Overseas',
    taxId: 'UK-UTR-9018273645',
    registeredDate: '2024-03-01',
    totalReferrals: 22,
    referralClicks: 198,
    referralVisits: 165,
    qrScans: 95,
    qualifiedLeads: 16,
    successfulSales: 5,
    conversionRate: '22.7%'
  },
  {
    id: 'AFF-000105',
    referralCode: 'BILAL55',
    name: 'Bilal Khan Afridi',
    email: 'bilal.afridi@frontiertech.pk',
    phone: '+92 333 5556677',
    whatsapp: '+92 333 5556677',
    country: 'Pakistan',
    city: 'Islamabad',
    profession: 'Tech Entrepreneur & Angel Investor',
    company: 'Frontier Ventures',
    tier: 'Silver',
    status: 'Approved',
    referralStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    bankName: 'Meezan Bank Ltd (Islamic Banking)',
    accountNumber: 'PK88MEZN00034455667788',
    accountTitle: 'Bilal Khan Afridi',
    taxId: 'NTN-3322110-4',
    registeredDate: '2024-03-18',
    totalReferrals: 15,
    referralClicks: 110,
    referralVisits: 88,
    qrScans: 40,
    qualifiedLeads: 7,
    successfulSales: 1,
    conversionRate: '6.7%'
  },
  {
    id: 'AFF-000106',
    referralCode: 'ADNAN99',
    name: 'Adnan Zafar',
    email: 'adnan.zafar@gulfnetwork.com',
    phone: '+92 301 9988776',
    whatsapp: '+92 301 9988776',
    country: 'Pakistan',
    city: 'Karachi',
    profession: 'Chartered Accountant / Tax Consultant',
    company: 'Zafar Financial Advisory',
    tier: 'Silver',
    status: 'Pending',
    referralStatus: 'Disabled',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    bankName: 'Bank Alfalah',
    accountNumber: 'PK09ALFH00123498765432',
    accountTitle: 'Adnan Zafar',
    taxId: 'NTN-7766554-9',
    registeredDate: '2024-04-02',
    totalReferrals: 0,
    referralClicks: 0,
    referralVisits: 0,
    qrScans: 0,
    qualifiedLeads: 0,
    successfulSales: 0,
    conversionRate: '0.0%'
  },
  {
    id: 'AFF-000107',
    referralCode: 'NAVEED33',
    name: 'Naveed Akhtar',
    email: 'naveed.akhtar@primeinvest.pk',
    phone: '+92 345 1122334',
    whatsapp: '+92 345 1122334',
    country: 'Pakistan',
    city: 'Faisalabad',
    profession: 'Industrialist / Real Estate Exporter',
    company: 'Prime Group',
    tier: 'Silver',
    status: 'Suspended',
    referralStatus: 'Disabled',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    bankName: 'MCB Bank Limited',
    accountNumber: 'PK77MUCB00045612378901',
    accountTitle: 'Naveed Akhtar',
    taxId: 'NTN-1122334-8',
    registeredDate: '2024-01-22',
    totalReferrals: 12,
    referralClicks: 65,
    referralVisits: 52,
    qrScans: 18,
    qualifiedLeads: 4,
    successfulSales: 0,
    conversionRate: '0.0%'
  }
];

const INITIAL_INVENTORY = [
  { unitId: 'LUM-1204', projectId: 'luminary-towers', block: 'Tower A (North)', floor: '12th Floor', unitNumber: 'A-1204', type: '3-Bed Executive Suite', size: '2,450 sq.ft', price: 38500000, discount: 0, finalPrice: 38500000, status: 'Sold', buyer: 'M. Zubair Chaudhry', affiliateId: 'AFF-000101', bookingDate: '2024-02-10', saleDate: '2024-02-25' },
  { unitId: 'LUM-2801', projectId: 'luminary-towers', block: 'Tower A (North)', floor: '28th Floor', unitNumber: 'A-2801', type: '4-Bed Sky Penthouse', size: '4,100 sq.ft', price: 68000000, discount: 1000000, finalPrice: 67000000, status: 'Sold', buyer: 'Sheikh Rashid Bin Khalid', affiliateId: 'AFF-000104', bookingDate: '2024-03-05', saleDate: '2024-03-18' },
  { unitId: 'LUM-1802', projectId: 'luminary-towers', block: 'Tower B (South)', floor: '18th Floor', unitNumber: 'B-1802', type: '2-Bed Ocean View', size: '1,850 sq.ft', price: 29500000, discount: 500000, finalPrice: 29000000, status: 'Sold', buyer: 'Dr. Ayesha Siddiqa', affiliateId: 'AFF-000102', bookingDate: '2024-03-12', saleDate: '2024-03-29' },
  { unitId: 'LUM-3504', projectId: 'luminary-towers', block: 'Tower B (South)', floor: '35th Floor', unitNumber: 'B-3504', type: '3-Bed Corner Suite', size: '2,650 sq.ft', price: 44500000, discount: 0, finalPrice: 44500000, status: 'Booked', buyer: 'Nadeem Jahangir', affiliateId: 'AFF-000101', bookingDate: '2024-04-01', saleDate: null },
  { unitId: 'LUM-0902', projectId: 'luminary-towers', block: 'Tower A (North)', floor: '9th Floor', unitNumber: 'A-0902', type: '2-Bed City View', size: '1,750 sq.ft', price: 27500000, discount: 0, finalPrice: 27500000, status: 'Available', buyer: null, affiliateId: null, bookingDate: null, saleDate: null },
  { unitId: 'ELY-V08', projectId: 'elysium-waterfront', block: 'Palm Island Shore', floor: 'Ground + 2', unitNumber: 'Villa 08', type: '5-Bed Beachfront Mansion', size: '7,800 sq.ft', price: 95000000, discount: 2000000, finalPrice: 93000000, status: 'Sold', buyer: 'Ali Reza Merchant', affiliateId: 'AFF-000101', bookingDate: '2024-02-18', saleDate: '2024-03-02' },
  { unitId: 'ELY-V14', projectId: 'elysium-waterfront', block: 'Lagoon Bay Shore', floor: 'Ground + 2', unitNumber: 'Villa 14', type: '4-Bed Lagoon Villa', size: '6,200 sq.ft', price: 72000000, discount: 0, finalPrice: 72000000, status: 'Sold', buyer: 'Karim Al-Dossary', affiliateId: 'AFF-000104', bookingDate: '2024-03-10', saleDate: '2024-03-24' },
  { unitId: 'ELY-V22', projectId: 'elysium-waterfront', block: 'Sunset Cove', floor: 'Ground + 2', unitNumber: 'Villa 22', type: '4-Bed Sunset Villa', size: '5,900 sq.ft', price: 68000000, discount: 0, finalPrice: 68000000, status: 'Reserved', buyer: 'Farhan Qureshi', affiliateId: 'AFF-000103', bookingDate: '2024-03-28', saleDate: null },
  { unitId: 'NEX-0501', projectId: 'nexus-horizon', block: 'West Tech Wing', floor: '5th Floor', unitNumber: 'W-0501', type: 'Commercial Tech Office', size: '3,200 sq.ft', price: 32000000, discount: 500000, finalPrice: 31500000, status: 'Sold', buyer: 'CloudScale Technologies Ltd', affiliateId: 'AFF-000103', bookingDate: '2024-01-15', saleDate: '2024-01-30' },
  { unitId: 'NEX-1102', projectId: 'nexus-horizon', block: 'East Executive Wing', floor: '11th Floor', unitNumber: 'E-1102', type: 'Executive Corporate Suite', size: '4,500 sq.ft', price: 45000000, discount: 0, finalPrice: 45000000, status: 'Sold', buyer: 'SilkBank Corporate Banking', affiliateId: 'AFF-000101', bookingDate: '2024-02-05', saleDate: '2024-02-20' },
  { unitId: 'CRES-1403', projectId: 'crescent-bay', block: 'Pearl Tower', floor: '14th Floor', unitNumber: 'P-1403', type: '3-Bed Sea View', size: '2,800 sq.ft', price: 42000000, discount: 0, finalPrice: 42000000, status: 'Sold', buyer: 'Faisal Karim', affiliateId: 'AFF-000102', bookingDate: '2024-02-28', saleDate: '2024-03-14' }
];

const INITIAL_LEADS = [
  {
    id: 'LEAD-1001',
    name: 'M. Zubair Chaudhry',
    phone: '+92 300 9988112',
    whatsapp: '+92 300 9988112',
    email: 'm.zubair@chaudhryholdings.com',
    city: 'Karachi',
    country: 'Pakistan',
    projectId: 'luminary-towers',
    unitInterested: '3-Bed Executive Suite',
    budget: 40000000,
    affiliateId: 'AFF-000101',
    source: 'Affiliate Referral Link',
    referralCode: 'REF-AFF101-LUM',
    date: '2024-02-05',
    salesRep: 'Zayn Malik',
    status: 'Converted',
    notes: 'HNW industrialist buyer. Closed deal on Unit A-1204.',
    duplicateFlag: false,
    duplicateMatches: []
  },
  {
    id: 'LEAD-1002',
    name: 'Sheikh Rashid Bin Khalid',
    phone: '+971 50 123 4567',
    whatsapp: '+971 50 123 4567',
    email: 'rashid.khalid@gulfroyal.ae',
    city: 'Abu Dhabi',
    country: 'UAE',
    projectId: 'luminary-towers',
    unitInterested: 'Sky Penthouse',
    budget: 70000000,
    affiliateId: 'AFF-000104',
    source: 'Private Family Office Referral',
    referralCode: 'REF-AFF104-LUM',
    date: '2024-03-01',
    salesRep: 'Zayn Malik',
    status: 'Converted',
    notes: 'Purchased Penthouse A-2801. 100% token payment verified.',
    duplicateFlag: false,
    duplicateMatches: []
  },
  {
    id: 'LEAD-1003',
    name: 'Dr. Ayesha Siddiqa',
    phone: '+92 333 4411223',
    whatsapp: '+92 333 4411223',
    email: 'ayesha.siddiqa@medicare.pk',
    city: 'Dubai / Lahore',
    country: 'Pakistan',
    projectId: 'luminary-towers',
    unitInterested: '2-Bed Ocean View',
    budget: 30000000,
    affiliateId: 'AFF-000102',
    source: 'WhatsApp Campaign Link',
    referralCode: 'REF-AFF102-LUM',
    date: '2024-03-08',
    salesRep: 'Zayn Malik',
    status: 'Converted',
    notes: 'Expat surgeon investor. Purchased Unit B-1802.',
    duplicateFlag: false,
    duplicateMatches: []
  },
  {
    id: 'LEAD-1004',
    name: 'Ali Reza Merchant',
    phone: '+92 321 4455998',
    whatsapp: '+92 321 4455998',
    email: 'ali.merchant@merchantgroup.pk',
    city: 'Karachi',
    country: 'Pakistan',
    projectId: 'elysium-waterfront',
    unitInterested: 'Beachfront Mansion',
    budget: 100000000,
    affiliateId: 'AFF-000101',
    source: 'Direct Partner Intro',
    referralCode: 'REF-AFF101-ELY',
    date: '2024-02-12',
    salesRep: 'Fatima Al-Suwaidi',
    status: 'Converted',
    notes: 'Purchased Beachfront Villa 08. VIP onboarding complete.',
    duplicateFlag: false,
    duplicateMatches: []
  },
  {
    id: 'LEAD-1005',
    name: 'Nadeem Jahangir',
    phone: '+92 300 7711223',
    whatsapp: '+92 300 7711223',
    email: 'nadeem@jahangirfabrics.com',
    city: 'Lahore',
    country: 'Pakistan',
    projectId: 'luminary-towers',
    unitInterested: '3-Bed Corner Suite',
    budget: 45000000,
    affiliateId: 'AFF-000101',
    source: 'Affiliate Portal Lead Form',
    referralCode: 'REF-AFF101-LUM',
    date: '2024-03-22',
    salesRep: 'Zayn Malik',
    status: 'Booked',
    notes: 'Token deposited for B-3504. Awaiting developer contract signing.',
    duplicateFlag: false,
    duplicateMatches: []
  },
  {
    id: 'LEAD-1006',
    name: 'Farhan Qureshi',
    phone: '+92 321 9900112',
    whatsapp: '+92 321 9900112',
    email: 'farhan.q@qureshitrading.com',
    city: 'Islamabad',
    country: 'Pakistan',
    projectId: 'elysium-waterfront',
    unitInterested: 'Sunset Villa',
    budget: 70000000,
    affiliateId: 'AFF-000103',
    source: 'Direct Partner Intro',
    referralCode: 'REF-AFF103-ELY',
    date: '2024-03-24',
    salesRep: 'Fatima Al-Suwaidi',
    status: 'Site Visit',
    notes: 'Visited site on March 27. Interested in Villa 22.',
    duplicateFlag: false,
    duplicateMatches: []
  },
  {
    id: 'LEAD-1007',
    name: 'Kamran Haroon',
    phone: '+92 300 5544332',
    whatsapp: '+92 300 5544332',
    email: 'kamran.h@haroonbuilders.pk',
    city: 'Karachi',
    country: 'Pakistan',
    projectId: 'luminary-towers',
    unitInterested: '2-Bed Ocean View',
    budget: 28000000,
    affiliateId: 'AFF-000105',
    source: 'LinkedIn Campaign Link',
    referralCode: 'REF-AFF105-LUM',
    date: '2024-03-29',
    salesRep: 'Zayn Malik',
    status: 'Qualified',
    notes: 'Qualified investor looking for rental yield properties.',
    duplicateFlag: false,
    duplicateMatches: []
  },
  // DUPLICATE LEAD EXAMPLE (Demonstrates Duplicate Lead Protection)
  {
    id: 'LEAD-1008',
    name: 'M. Zubair Chaudhry',
    phone: '+92 300 9988112', // Matches LEAD-1001
    whatsapp: '+92 300 9988112',
    email: 'm.zubair@chaudhryholdings.com',
    city: 'Karachi',
    country: 'Pakistan',
    projectId: 'luminary-towers',
    unitInterested: 'Penthouse Unit',
    budget: 40000000,
    affiliateId: 'AFF-000105', // Different affiliate!
    source: 'Website Form Submission',
    referralCode: 'REF-AFF105-LUM',
    date: '2024-03-30',
    salesRep: 'Unassigned',
    status: 'New',
    notes: 'Duplicate detection flagged: Client already registered under Tariq Mansoor (AFF-000101).',
    duplicateFlag: true,
    duplicateMatches: ['LEAD-1001'],
    attributionStatus: 'Under Admin Review'
  },
  {
    id: 'LEAD-1009',
    name: 'Tariq Mehmood Bajwa',
    phone: '+92 333 8877665',
    whatsapp: '+92 333 8877665',
    email: 'tariq.bajwa@agritech.com.pk',
    city: 'Lahore',
    country: 'Pakistan',
    projectId: 'nexus-horizon',
    unitInterested: 'Corporate Floor',
    budget: 50000000,
    affiliateId: 'AFF-000102',
    source: 'Email Pitch Deck',
    referralCode: 'REF-AFF102-NEX',
    date: '2024-04-01',
    salesRep: 'Hamza Farooq',
    status: 'Negotiation',
    notes: 'Negotiating full floor lease with buy-out option.',
    duplicateFlag: false,
    duplicateMatches: []
  }
];

const INITIAL_SALES = [
  {
    id: 'SALE-2024-001',
    customerId: 'LEAD-1001',
    customerName: 'M. Zubair Chaudhry',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    unitId: 'LUM-1204',
    unitNumber: 'Tower A / Unit A-1204',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    salePrice: 38500000,
    commissionRate: 3.5,
    grossCommission: 1347500,
    bookingDate: '2024-02-10',
    saleDate: '2024-02-25',
    status: 'Completed',
    salesRep: 'Zayn Malik',
    paymentStatus: 'Paid',
    notes: 'First qualifying sale for Tariq Mansoor. Full commission settled.'
  },
  {
    id: 'SALE-2024-002',
    customerId: 'LEAD-1004',
    customerName: 'Ali Reza Merchant',
    projectId: 'elysium-waterfront',
    projectName: 'Elysium Waterfront Villas',
    unitId: 'ELY-V08',
    unitNumber: 'Beachfront Villa 08',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    salePrice: 93000000,
    commissionRate: 4.5,
    grossCommission: 4185000,
    bookingDate: '2024-02-18',
    saleDate: '2024-03-02',
    status: 'Completed',
    salesRep: 'Fatima Al-Suwaidi',
    paymentStatus: 'Paid',
    notes: 'High-value island villa transaction. Commission disbursed via HBL wire.'
  },
  {
    id: 'SALE-2024-003',
    customerId: 'LEAD-1002',
    customerName: 'Sheikh Rashid Bin Khalid',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    unitId: 'LUM-2801',
    unitNumber: 'Tower A / Penthouse A-2801',
    affiliateId: 'AFF-000104',
    affiliateName: 'Elena Rostova',
    salePrice: 67000000,
    commissionRate: 4.2,
    grossCommission: 2814000,
    bookingDate: '2024-03-05',
    saleDate: '2024-03-18',
    status: 'Completed',
    salesRep: 'Zayn Malik',
    paymentStatus: 'Paid',
    notes: 'Overseas buyer penthouse closing. Commission settled via HSBC wire.'
  },
  {
    id: 'SALE-2024-004',
    customerId: 'LEAD-1003',
    customerName: 'Dr. Ayesha Siddiqa',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    unitId: 'LUM-1802',
    unitNumber: 'Tower B / Unit B-1802',
    affiliateId: 'AFF-000102',
    affiliateName: 'Sarah Al-Maktoum Jenkins',
    salePrice: 29000000,
    commissionRate: 3.5,
    grossCommission: 1015000,
    bookingDate: '2024-03-12',
    saleDate: '2024-03-29',
    status: 'Completed',
    salesRep: 'Zayn Malik',
    paymentStatus: 'Payable',
    notes: 'Transaction verified by developer. Ready for payout batch.'
  },
  {
    id: 'SALE-2024-005',
    customerId: 'LEAD-1005',
    customerName: 'Nadeem Jahangir',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    unitId: 'LUM-3504',
    unitNumber: 'Tower B / Unit B-3504',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    salePrice: 44500000,
    commissionRate: 3.5,
    grossCommission: 1557500,
    bookingDate: '2024-04-01',
    saleDate: null,
    status: 'Booking',
    salesRep: 'Zayn Malik',
    paymentStatus: 'Pending',
    notes: 'Token advance paid. Commission pending final deed registration.'
  }
];

const INITIAL_COMMISSIONS = [
  {
    id: 'COM-2024-001',
    saleId: 'SALE-2024-001',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    grossSale: 38500000,
    eligibleAmount: 38500000,
    rate: 3.5,
    grossCommission: 1347500,
    adjustments: 0,
    netPayable: 1347500,
    status: 'Paid',
    createdDate: '2024-02-25',
    approvedDate: '2024-02-26',
    paidDate: '2024-03-01',
    approvedBy: 'Dilnawaz (Super Admin)',
    paymentReference: 'PAY-HBL-992101'
  },
  {
    id: 'COM-2024-002',
    saleId: 'SALE-2024-002',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    projectId: 'elysium-waterfront',
    projectName: 'Elysium Waterfront Villas',
    grossSale: 93000000,
    eligibleAmount: 93000000,
    rate: 4.5,
    grossCommission: 4185000,
    adjustments: -50000, // VIP Marketing Shared Adjustment
    netPayable: 4135000,
    status: 'Paid',
    createdDate: '2024-03-02',
    approvedDate: '2024-03-04',
    paidDate: '2024-03-10',
    approvedBy: 'Dilnawaz (Super Admin)',
    paymentReference: 'PAY-HBL-992102'
  },
  {
    id: 'COM-2024-003',
    saleId: 'SALE-2024-003',
    affiliateId: 'AFF-000104',
    affiliateName: 'Elena Rostova',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    grossSale: 67000000,
    eligibleAmount: 67000000,
    rate: 4.2,
    grossCommission: 2814000,
    adjustments: 0,
    netPayable: 2814000,
    status: 'Paid',
    createdDate: '2024-03-18',
    approvedDate: '2024-03-20',
    paidDate: '2024-03-25',
    approvedBy: 'Dilnawaz (Super Admin)',
    paymentReference: 'PAY-HSBC-881290'
  },
  {
    id: 'COM-2024-004',
    saleId: 'SALE-2024-004',
    affiliateId: 'AFF-000102',
    affiliateName: 'Sarah Al-Maktoum Jenkins',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    grossSale: 29000000,
    eligibleAmount: 29000000,
    rate: 3.5,
    grossCommission: 1015000,
    adjustments: 0,
    netPayable: 1015000,
    status: 'Payable',
    createdDate: '2024-03-29',
    approvedDate: '2024-03-30',
    paidDate: null,
    approvedBy: 'Dilnawaz (Super Admin)',
    paymentReference: null
  },
  {
    id: 'COM-2024-005',
    saleId: 'SALE-2024-005',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    projectId: 'luminary-towers',
    projectName: 'The Luminary Sky Residences',
    grossSale: 44500000,
    eligibleAmount: 44500000,
    rate: 3.5,
    grossCommission: 1557500,
    adjustments: 0,
    netPayable: 1557500,
    status: 'Pending',
    createdDate: '2024-04-01',
    approvedDate: null,
    paidDate: null,
    approvedBy: null,
    paymentReference: null
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 'PAY-0001',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    projectId: 'luminary-towers',
    commissionIds: ['COM-2024-001'],
    amount: 1347500,
    method: 'Bank Transfer',
    reference: 'HBL-FT-98721094',
    date: '2024-03-01',
    proofUrl: '/receipts/pay-0001-hbl.pdf',
    status: 'Paid',
    approvedBy: 'Dilnawaz (Super Admin)',
    notes: 'Direct RTGS credit to HBL Prestige Account.'
  },
  {
    id: 'PAY-0002',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    projectId: 'elysium-waterfront',
    commissionIds: ['COM-2024-002'],
    amount: 4135000,
    method: 'Bank Transfer',
    reference: 'HBL-FT-99120482',
    date: '2024-03-10',
    proofUrl: '/receipts/pay-0002-hbl.pdf',
    status: 'Paid',
    approvedBy: 'Dilnawaz (Super Admin)',
    notes: 'Wire transfer for Elysium Villa 08 commission settlement.'
  },
  {
    id: 'PAY-0003',
    affiliateId: 'AFF-000104',
    affiliateName: 'Elena Rostova',
    projectId: 'luminary-towers',
    commissionIds: ['COM-2024-003'],
    amount: 2814000,
    method: 'Online Transfer',
    reference: 'HSBC-UK-9921804',
    date: '2024-03-25',
    proofUrl: '/receipts/pay-0003-hsbc.pdf',
    status: 'Paid',
    approvedBy: 'Dilnawaz (Super Admin)',
    notes: 'International SWIFT transfer to HSBC London Private.'
  }
];

const INITIAL_LEDGER = [
  {
    id: 'TX-1001',
    date: '2024-02-10',
    projectId: 'luminary-towers',
    unitId: 'LUM-1204',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    customerName: 'M. Zubair Chaudhry',
    type: 'Booking',
    amount: 38500000,
    commissionRate: 3.5,
    grossCommission: 1347500,
    adjustment: 0,
    netCommission: 1347500,
    status: 'Approved',
    reference: 'BK-LUM-1204',
    notes: 'Token Advance received and booking confirmed.',
    createdBy: 'System Engine'
  },
  {
    id: 'TX-1002',
    date: '2024-02-25',
    projectId: 'luminary-towers',
    unitId: 'LUM-1204',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    customerName: 'M. Zubair Chaudhry',
    type: 'Sale',
    amount: 38500000,
    commissionRate: 3.5,
    grossCommission: 1347500,
    adjustment: 0,
    netCommission: 1347500,
    status: 'Approved',
    reference: 'SL-LUM-1204',
    notes: 'Final deed signed. Commission moved to Payable.',
    createdBy: 'Dilnawaz (Super Admin)'
  },
  {
    id: 'TX-1003',
    date: '2024-03-01',
    projectId: 'luminary-towers',
    unitId: 'LUM-1204',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    customerName: 'M. Zubair Chaudhry',
    type: 'Payment',
    amount: 1347500,
    commissionRate: 0,
    grossCommission: 0,
    adjustment: 0,
    netCommission: -1347500,
    status: 'Paid',
    reference: 'HBL-FT-98721094',
    notes: 'Disbursed payout to affiliate HBL account.',
    createdBy: 'Dilnawaz (Super Admin)'
  },
  {
    id: 'TX-1004',
    date: '2024-02-18',
    projectId: 'elysium-waterfront',
    unitId: 'ELY-V08',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    customerName: 'Ali Reza Merchant',
    type: 'Sale',
    amount: 93000000,
    commissionRate: 4.5,
    grossCommission: 4185000,
    adjustment: -50000,
    netCommission: 4135000,
    status: 'Approved',
    reference: 'SL-ELY-V08',
    notes: 'Verified qualifying sale. Adjusted for VIP launch package.',
    createdBy: 'Dilnawaz (Super Admin)'
  },
  {
    id: 'TX-1005',
    date: '2024-03-10',
    projectId: 'elysium-waterfront',
    unitId: 'ELY-V08',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    customerName: 'Ali Reza Merchant',
    type: 'Payment',
    amount: 4135000,
    commissionRate: 0,
    grossCommission: 0,
    adjustment: 0,
    netCommission: -4135000,
    status: 'Paid',
    reference: 'HBL-FT-99120482',
    notes: 'Disbursed payout for Villa 08.',
    createdBy: 'Dilnawaz (Super Admin)'
  }
];

const INITIAL_AUDIT_LOGS = [
  { id: 'AUD-001', timestamp: '2024-04-01 10:15:22', user: 'Dilnawaz (Super Admin)', action: 'COMMISSION_APPROVED', entity: 'Commission #COM-2024-004', oldValue: 'Pending', newValue: 'Payable', details: 'Approved 3.5% commission (PKR 1,015,000) for Sarah Jenkins.' },
  { id: 'AUD-002', timestamp: '2024-03-30 14:22:10', user: 'System Engine', action: 'DUPLICATE_LEAD_DETECTED', entity: 'Lead #LEAD-1008', oldValue: 'None', newValue: 'Flagged Duplicate', details: 'Collision detected on phone +92 300 9988112 with Lead #LEAD-1001.' },
  { id: 'AUD-003', timestamp: '2024-03-25 09:44:01', user: 'Dilnawaz (Super Admin)', action: 'PAYMENT_DISBURSED', entity: 'Payment #PAY-0003', oldValue: 'Approved', newValue: 'Paid', details: 'Transferred PKR 2,814,000 via SWIFT to Elena Rostova (HSBC UK).' },
  { id: 'AUD-004', timestamp: '2024-03-20 16:30:15', user: 'Dilnawaz (Super Admin)', action: 'PROJECT_UPDATED', entity: 'Project #luminary-towers', oldValue: 'Comm Rate 3.0%', newValue: 'Comm Rate 3.5%', details: 'Updated base commission tier for Q2 sales drive.' }
];

const INITIAL_MARKETING = [
  { id: 'MKT-01', projectId: 'luminary-towers', projectName: 'The Luminary Sky Residences', category: 'Brochure', title: 'Official Investor & Floor Plan Portfolio (PDF)', format: 'PDF (28 MB)', url: '/assets/luminary-brochure.pdf', downloads: 1420 },
  { id: 'MKT-02', projectId: 'elysium-waterfront', projectName: 'Elysium Waterfront Villas', category: 'Brochure', title: 'Private Island Luxury Lookbook (PDF)', format: 'PDF (34 MB)', url: '/assets/elysium-brochure.pdf', downloads: 980 },
  { id: 'MKT-03', projectId: 'luminary-towers', projectName: 'The Luminary Sky Residences', category: 'WhatsApp Pitch', title: 'Ultra-HNW WhatsApp Pitch Template + Teaser Copy', format: 'Text & Media Kit', url: '#', downloads: 2310 },
  { id: 'MKT-04', projectId: 'elysium-waterfront', projectName: 'Elysium Waterfront Villas', category: 'Social Media', title: 'Instagram & LinkedIn High-Converting Carousel Pack', format: 'ZIP (12 HQ Graphics)', url: '#', downloads: 1840 },
  { id: 'MKT-05', projectId: 'nexus-horizon', projectName: 'Nexus Horizon Corporate Hub', category: 'Email Template', title: 'Corporate Investor Email Sequence (3-Part)', format: 'HTML / Text', url: '#', downloads: 650 }
];

const INITIAL_NOTIFICATIONS = [
  { id: 'NOTIF-01', targetRole: 'ALL', targetUserId: null, title: 'Q2 High-Yield Commission Bonus Active', message: 'Earn an additional +0.5% bonus on all verified bookings closed before June 30.', timestamp: '2 hours ago', read: false, type: 'announcement' },
  { id: 'NOTIF-02', targetRole: 'SUPER_ADMIN', targetUserId: 'USR-ADMIN-01', title: 'Duplicate Lead Alert', message: 'Lead #LEAD-1008 (M. Zubair Chaudhry) was flagged as duplicate for review.', timestamp: '4 hours ago', read: false, type: 'alert' },
  { id: 'NOTIF-03', targetRole: 'AFFILIATE_PARTNER', targetUserId: 'USR-AFF-101', title: 'Commission Approved', message: 'Your commission for Sale #SALE-2024-001 (PKR 1,347,500) has been paid.', timestamp: '1 day ago', read: true, type: 'success' }
];

const INITIAL_TICKETS = [
  {
    id: 'TCK-101',
    affiliateId: 'AFF-000101',
    affiliateName: 'Tariq Mansoor',
    subject: 'Request for Private Helipad Landing Permissions for Luminary VIP Client',
    category: 'Client Support & Site Visit',
    status: 'Resolved',
    createdAt: '2024-03-20',
    messages: [
      { sender: 'Tariq Mansoor', role: 'partner', text: 'Our international client from Abu Dhabi requests private helicopter arrival for the Luminary Towers site inspection.', time: '2024-03-20 11:30 AM' },
      { sender: 'Admin Desk', role: 'admin', text: 'Approved! The aviation desk has confirmed landing slot at Sky Tower Helipad for March 22 at 2:00 PM.', time: '2024-03-20 02:15 PM' }
    ]
  },
  {
    id: 'TCK-102',
    affiliateId: 'AFF-000102',
    affiliateName: 'Sarah Jenkins',
    subject: 'Commission Wire Settlement for Unit B-1802',
    category: 'Commission & Payments',
    status: 'In Progress',
    createdAt: '2024-03-31',
    messages: [
      { sender: 'Sarah Jenkins', role: 'partner', text: 'Hi, confirming that client deed is finalized. When is the batch disbursement date?', time: '2024-03-31 04:00 PM' },
      { sender: 'Admin Desk', role: 'admin', text: 'Hello Sarah, Commission #COM-2024-004 is marked as Payable and will be released in this week’s payout cycle.', time: '2024-04-01 10:00 AM' }
    ]
  }
];

class PlatformStore {
  constructor() {
    this.projects = [];
    this.affiliates = [];
    this.inventory = [];
    this.leads = [];
    this.sales = [];
    this.commissions = [];
    this.payments = [];
    this.ledger = [];
    this.auditLogs = [];
    this.marketing = [];
    this.notifications = [];
    this.tickets = [];
    this.currency = 'PKR';
    this.listeners = [];

    this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.projects = parsed.projects || INITIAL_PROJECTS;
        this.affiliates = parsed.affiliates || INITIAL_AFFILIATES;
        this.inventory = parsed.inventory || INITIAL_INVENTORY;
        this.leads = parsed.leads || INITIAL_LEADS;
        this.sales = parsed.sales || INITIAL_SALES;
        this.commissions = parsed.commissions || INITIAL_COMMISSIONS;
        this.payments = parsed.payments || INITIAL_PAYMENTS;
        this.ledger = parsed.ledger || INITIAL_LEDGER;
        this.auditLogs = parsed.auditLogs || INITIAL_AUDIT_LOGS;
        this.marketing = parsed.marketing || INITIAL_MARKETING;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.tickets = parsed.tickets || INITIAL_TICKETS;
        this.currency = parsed.currency || 'PKR';
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.warn('Store load failed, resetting:', e);
      this.resetToDefaults();
    }
  }

  save() {
    try {
      const data = {
        projects: this.projects,
        affiliates: this.affiliates,
        inventory: this.inventory,
        leads: this.leads,
        sales: this.sales,
        commissions: this.commissions,
        payments: this.payments,
        ledger: this.ledger,
        auditLogs: this.auditLogs,
        marketing: this.marketing,
        notifications: this.notifications,
        tickets: this.tickets,
        currency: this.currency
      };
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Store save error:', e);
    }
    this.notify();
  }

  resetToDefaults() {
    this.projects = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
    this.affiliates = JSON.parse(JSON.stringify(INITIAL_AFFILIATES));
    this.inventory = JSON.parse(JSON.stringify(INITIAL_INVENTORY));
    this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
    this.sales = JSON.parse(JSON.stringify(INITIAL_SALES));
    this.commissions = JSON.parse(JSON.stringify(INITIAL_COMMISSIONS));
    this.payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
    this.ledger = JSON.parse(JSON.stringify(INITIAL_LEDGER));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.marketing = JSON.parse(JSON.stringify(INITIAL_MARKETING));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.tickets = JSON.parse(JSON.stringify(INITIAL_TICKETS));
    this.currency = 'PKR';
    this.save();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  setCurrency(curr) {
    if (CURRENCY_RATES[curr]) {
      this.currency = curr;
      this.save();
    }
  }

  logAudit(user, action, entity, oldValue, newValue, details) {
    const log = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: user || 'Super Admin',
      action,
      entity,
      oldValue: oldValue || 'N/A',
      newValue: newValue || 'N/A',
      details: details || ''
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  // ==========================================
  // AFFILIATE MANAGEMENT
  // ==========================================
  updateAffiliateStatus(affiliateId, newStatus, reason = '') {
    const aff = this.affiliates.find(a => a.id === affiliateId);
    if (!aff) return { success: false, message: 'Affiliate not found' };
    const oldStatus = aff.status;
    aff.status = newStatus;

    this.logAudit(
      'Dilnawaz (Super Admin)',
      'AFFILIATE_STATUS_CHANGE',
      `Affiliate #${affiliateId} (${aff.name})`,
      oldStatus,
      newStatus,
      reason || `Status updated to ${newStatus}`
    );

    this.save();
    return { success: true, affiliate: aff };
  }

  updateAffiliateTier(affiliateId, newTier) {
    const aff = this.affiliates.find(a => a.id === affiliateId);
    if (!aff) return { success: false };
    const oldTier = aff.tier;
    aff.tier = newTier;
    this.logAudit('Super Admin', 'AFFILIATE_TIER_UPDATE', `Affiliate #${affiliateId}`, oldTier, newTier, `Upgraded tier to ${newTier}`);
    this.save();
    return { success: true };
  }

  // ==========================================
  // REFERRAL CODE & QR TRACKING ENGINE
  // ==========================================
  getAffiliateByReferralCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return this.affiliates.find(a => 
      (a.id && a.id.toUpperCase() === clean) ||
      (a.referralCode && a.referralCode.toUpperCase() === clean)
    ) || null;
  }

  recordReferralVisit(affiliateId, metadata = {}) {
    const aff = this.affiliates.find(a => a.id === affiliateId);
    if (!aff) return;

    aff.referralClicks = (aff.referralClicks || 0) + 1;
    aff.referralVisits = (aff.referralVisits || 0) + 1;
    
    // Check if traffic is from QR scan
    if (metadata.isQr || (metadata.referrer && metadata.referrer.includes('qr'))) {
      aff.qrScans = (aff.qrScans || 0) + 1;
    }

    this.save();
  }

  recordQrScan(affiliateId, metadata = {}) {
    const aff = this.affiliates.find(a => a.id === affiliateId);
    if (!aff) return;

    aff.qrScans = (aff.qrScans || 0) + 1;
    aff.referralClicks = (aff.referralClicks || 0) + 1;
    this.save();
  }

  regenerateReferralCode(affiliateId, customCode = null) {
    const aff = this.affiliates.find(a => a.id === affiliateId);
    if (!aff) return { success: false, message: 'Affiliate not found' };

    let candidateCode = '';
    if (customCode && customCode.trim()) {
      candidateCode = customCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    } else {
      // Auto-generate clean alphanumeric code: e.g. AFF + random 5 digits or initials
      const rand = Math.floor(10000 + Math.random() * 90000);
      const prefix = aff.name ? aff.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'REF') : 'AFF';
      candidateCode = `${prefix}${rand}`;
    }

    // Enforce uniqueness at store level
    const existing = this.affiliates.find(a => 
      a.id !== affiliateId && 
      ((a.referralCode && a.referralCode.toUpperCase() === candidateCode) || (a.id.toUpperCase() === candidateCode))
    );

    if (existing) {
      return { success: false, message: `Referral code "${candidateCode}" is already assigned to ${existing.name} (${existing.id}).` };
    }

    const oldCode = aff.referralCode || aff.id;
    aff.referralCode = candidateCode;
    aff.referralStatus = 'Active';

    this.logAudit(
      'Super Admin',
      'REFERRAL_CODE_REGENERATED',
      `Affiliate #${affiliateId}`,
      oldCode,
      candidateCode,
      `Regenerated unique referral code to ${candidateCode}`
    );

    this.save();
    return { success: true, referralCode: candidateCode, affiliate: aff };
  }

  toggleReferralStatus(affiliateId, newStatus) {
    const aff = this.affiliates.find(a => a.id === affiliateId);
    if (!aff) return { success: false, message: 'Affiliate not found' };

    const oldStatus = aff.referralStatus || 'Active';
    aff.referralStatus = newStatus; // 'Active' | 'Disabled'

    this.logAudit(
      'Super Admin',
      'REFERRAL_STATUS_CHANGE',
      `Affiliate #${affiliateId}`,
      oldStatus,
      newStatus,
      `Referral code status set to ${newStatus}`
    );

    this.save();
    return { success: true, status: newStatus };
  }

  getAffiliateReferralStats(affiliateId) {
    const aff = this.affiliates.find(a => a.id === affiliateId);
    if (!aff) return null;

    const leads = this.leads.filter(l => l.affiliateId === affiliateId);
    const sales = this.sales.filter(s => s.affiliateId === affiliateId);
    const comms = this.commissions.filter(c => c.affiliateId === affiliateId);

    const totalEarnedCommission = comms.reduce((sum, c) => sum + (c.netPayable || 0), 0);
    const clicks = aff.referralClicks || aff.totalReferrals * 6 || 100;
    const qrScans = aff.qrScans || Math.round(clicks * 0.35);

    return {
      affiliateId: aff.id,
      affiliateName: aff.name,
      referralCode: aff.referralCode || aff.id,
      referralStatus: aff.referralStatus || 'Active',
      qrScans: qrScans,
      totalClicks: clicks,
      totalVisits: aff.referralVisits || Math.round(clicks * 0.8),
      totalLeads: leads.length,
      qualifiedLeads: leads.filter(l => l.status === 'Qualified' || l.status === 'Contract Sent' || l.status === 'Closed Won').length,
      closedSales: sales.length,
      totalCommission: totalEarnedCommission,
      conversionRate: clicks > 0 ? ((sales.length / clicks) * 100).toFixed(1) + '%' : '0.0%'
    };
  }

  // ==========================================
  // PROJECT MANAGEMENT
  // ==========================================
  addProject(projectData) {
    const id = projectData.id || projectData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProj = {
      id,
      name: projectData.name,
      developer: projectData.developer || 'PropPartner Premier Developers',
      location: projectData.location || '',
      city: projectData.city || 'Karachi',
      country: projectData.country || 'Pakistan',
      type: projectData.type || 'Luxury Residential',
      description: projectData.description || '',
      status: projectData.status || 'Active',
      launchDate: projectData.launchDate || new Date().toISOString().split('T')[0],
      completionDate: projectData.completionDate || '2027-12-31',
      startingPrice: Number(projectData.startingPrice) || 35000000,
      commissionModel: projectData.commissionModel || 'Percentage',
      commissionRate: Number(projectData.commissionRate) || 3.5,
      commissionTiers: projectData.commissionTiers || [
        { minSales: 1, maxSales: 2, rate: 3.0 },
        { minSales: 3, maxSales: 5, rate: 3.5 },
        { minSales: 6, maxSales: 999, rate: 4.5 }
      ],
      unitsTotal: Number(projectData.unitsTotal) || 50,
      unitsAvailable: Number(projectData.unitsAvailable) || 50,
      image: projectData.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      website: projectData.website || '',
      brochureUrl: projectData.brochureUrl || '',
      contactPerson: projectData.contactPerson || 'Sales Desk',
      contactPhone: projectData.contactPhone || '+92 300 0000000'
    };

    this.projects.push(newProj);
    this.logAudit('Super Admin', 'PROJECT_CREATED', `Project #${id}`, 'None', 'Active', `Created new development: ${newProj.name}`);
    this.save();
    return { success: true, project: newProj };
  }

  updateProject(id, updates) {
    const proj = this.projects.find(p => p.id === id);
    if (!proj) return { success: false, message: 'Project not found' };

    // Check if commission rate changed
    if (updates.commissionRate && updates.commissionRate !== proj.commissionRate) {
      this.logAudit(
        'Super Admin',
        'COMMISSION_RULE_CHANGE',
        `Project #${id} (${proj.name})`,
        `${proj.commissionRate}%`,
        `${updates.commissionRate}%`,
        'Admin modified project commission rate. Historical commissions remain intact.'
      );
    }

    Object.assign(proj, updates);
    this.logAudit('Super Admin', 'PROJECT_UPDATED', `Project #${id}`, 'Active', proj.status, `Updated project details for ${proj.name}`);
    this.save();
    return { success: true, project: proj };
  }

  deleteProject(id) {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return { success: false };
    const projName = this.projects[idx].name;
    this.projects.splice(idx, 1);
    this.logAudit('Super Admin', 'PROJECT_DELETED', `Project #${id}`, projName, 'Deleted', `Deleted project ${projName}`);
    this.save();
    return { success: true };
  }

  // ==========================================
  // INVENTORY MANAGEMENT
  // ==========================================
  addInventoryUnit(unitData) {
    const unitId = unitData.unitId || `UNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUnit = {
      unitId,
      projectId: unitData.projectId,
      block: unitData.block || 'Main Tower',
      floor: unitData.floor || '1st Floor',
      unitNumber: unitData.unitNumber || unitId,
      type: unitData.type || '2-Bed Apartment',
      size: unitData.size || '1,500 sq.ft',
      price: Number(unitData.price) || 25000000,
      discount: Number(unitData.discount) || 0,
      finalPrice: Number(unitData.price) - (Number(unitData.discount) || 0),
      status: unitData.status || 'Available',
      buyer: unitData.buyer || null,
      affiliateId: unitData.affiliateId || null,
      bookingDate: unitData.bookingDate || null,
      saleDate: unitData.saleDate || null
    };

    this.inventory.push(newUnit);
    this.logAudit('Super Admin', 'INVENTORY_UNIT_ADDED', `Unit #${unitId}`, 'None', 'Available', `Added inventory unit to project ${unitData.projectId}`);
    this.save();
    return { success: true, unit: newUnit };
  }

  updateInventoryUnit(unitId, updates) {
    const unit = this.inventory.find(u => u.unitId === unitId);
    if (!unit) return { success: false };
    const oldStatus = unit.status;
    Object.assign(unit, updates);
    if (updates.status && updates.status !== oldStatus) {
      this.logAudit('Super Admin', 'INVENTORY_STATUS_CHANGE', `Unit #${unitId}`, oldStatus, updates.status, `Unit status updated`);
    }
    this.save();
    return { success: true, unit };
  }

  // ==========================================
  // LEAD / CRM ENGINE & DUPLICATE PROTECTION
  // ==========================================
  submitLead(leadData) {
    const cleanPhone = (leadData.phone || '').replace(/[^0-9+]/g, '');
    const cleanEmail = (leadData.email || '').trim().toLowerCase();

    // DUPLICATE COLLISION DETECTION
    const duplicateMatches = this.leads.filter(l => {
      const matchPhone = cleanPhone && l.phone.replace(/[^0-9+]/g, '') === cleanPhone;
      const matchEmail = cleanEmail && l.email.toLowerCase() === cleanEmail;
      return matchPhone || matchEmail;
    });

    const isDuplicate = duplicateMatches.length > 0;
    const leadId = `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLead = {
      id: leadId,
      name: leadData.name,
      phone: leadData.phone,
      whatsapp: leadData.whatsapp || leadData.phone,
      email: leadData.email,
      city: leadData.city || 'Karachi',
      country: leadData.country || 'Pakistan',
      projectId: leadData.projectId,
      unitInterested: leadData.unitInterested || 'General Inquiry',
      budget: Number(leadData.budget) || 30000000,
      affiliateId: leadData.affiliateId,
      source: leadData.source || 'Affiliate Referral Link',
      referralCode: `REF-${leadData.affiliateId}-${(leadData.projectId || 'GEN').substring(0, 3).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      salesRep: 'Unassigned',
      status: 'New',
      notes: leadData.notes || '',
      duplicateFlag: isDuplicate,
      duplicateMatches: duplicateMatches.map(m => m.id),
      attributionStatus: isDuplicate ? 'Under Admin Review' : 'Original Lead'
    };

    this.leads.unshift(newLead);

    if (isDuplicate) {
      this.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        targetRole: 'SUPER_ADMIN',
        targetUserId: 'USR-ADMIN-01',
        title: '⚠️ Duplicate Lead Collision Alert',
        message: `Lead ${newLead.name} (${cleanPhone}) matches existing Lead ${duplicateMatches[0].id}. Review attribution.`,
        timestamp: 'Just now',
        read: false,
        type: 'alert'
      });
      this.logAudit(
        'Lead Ingestion Engine',
        'DUPLICATE_LEAD_DETECTED',
        `Lead #${leadId} (${newLead.name})`,
        'None',
        'Flagged Duplicate',
        `Collision on ${cleanPhone} with ${duplicateMatches[0].id} (Affiliate: ${duplicateMatches[0].affiliateId})`
      );
    } else {
      this.logAudit(
        `Affiliate #${leadData.affiliateId}`,
        'LEAD_SUBMITTED',
        `Lead #${leadId} (${newLead.name})`,
        'None',
        'New',
        `New prospect submitted for project ${leadData.projectId}`
      );
    }

    this.save();
    return { success: true, lead: newLead, isDuplicate, duplicateMatches };
  }

  updateLeadStatus(leadId, newStatus, notes = '') {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return { success: false };
    const oldStatus = lead.status;
    lead.status = newStatus;
    if (notes) lead.notes = `${lead.notes ? lead.notes + ' | ' : ''}${notes}`;

    this.logAudit('Super Admin', 'LEAD_STATUS_UPDATED', `Lead #${leadId} (${lead.name})`, oldStatus, newStatus, notes || `Stage advanced to ${newStatus}`);
    this.save();
    return { success: true, lead };
  }

  resolveDuplicateAttribution(leadId, resolution, primaryAffiliateId, reason) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return { success: false };

    lead.duplicateFlag = false;
    lead.attributionStatus = resolution; // 'Attributed to Original' | 'Split Commission' | 'Approved Exception' | 'Rejected'
    lead.affiliateId = primaryAffiliateId;
    lead.notes = `${lead.notes} [Attribution Resolution: ${resolution} by Admin - ${reason}]`;

    this.logAudit(
      'Dilnawaz (Super Admin)',
      'DUPLICATE_ATTRIBUTION_RESOLVED',
      `Lead #${leadId}`,
      'Under Admin Review',
      resolution,
      `Primary attribution assigned to Affiliate #${primaryAffiliateId}. Reason: ${reason}`
    );

    this.save();
    return { success: true, lead };
  }

  // ==========================================
  // SALES & COMMISSION CALCULATION ENGINE
  // ==========================================
  recordSale(saleData) {
    const proj = this.projects.find(p => p.id === saleData.projectId);
    const affiliate = this.affiliates.find(a => a.id === saleData.affiliateId);
    const salePrice = Number(saleData.salePrice);

    // Calculate Rate based on project tiers or flat rate
    let effectiveRate = proj ? proj.commissionRate : 3.5;
    if (proj && proj.commissionTiers && proj.commissionTiers.length) {
      const affiliatePastSales = this.sales.filter(s => s.affiliateId === saleData.affiliateId && s.status === 'Completed').length + 1;
      const matchingTier = proj.commissionTiers.find(t => affiliatePastSales >= t.minSales && affiliatePastSales <= t.maxSales);
      if (matchingTier) effectiveRate = matchingTier.rate;
    }

    const grossCommission = Math.round((salePrice * effectiveRate) / 100);
    const saleId = `SALE-2024-${Math.floor(100 + Math.random() * 900)}`;

    const newSale = {
      id: saleId,
      customerId: saleData.customerId || 'LEAD-EXT',
      customerName: saleData.customerName,
      projectId: saleData.projectId,
      projectName: proj ? proj.name : saleData.projectId,
      unitId: saleData.unitId || 'UNIT-CUSTOM',
      unitNumber: saleData.unitNumber || 'Custom Unit',
      affiliateId: saleData.affiliateId,
      affiliateName: affiliate ? affiliate.name : saleData.affiliateId,
      salePrice,
      commissionRate: effectiveRate,
      grossCommission,
      bookingDate: saleData.bookingDate || new Date().toISOString().split('T')[0],
      saleDate: saleData.saleDate || null,
      status: saleData.status || 'Confirmed',
      salesRep: saleData.salesRep || 'Sales Desk',
      paymentStatus: 'Pending',
      notes: saleData.notes || 'Recorded verified sale.'
    };

    this.sales.unshift(newSale);

    // Automatically generate Commission Record
    const commId = `COM-2024-${Math.floor(100 + Math.random() * 900)}`;
    const newCommission = {
      id: commId,
      saleId: saleId,
      affiliateId: saleData.affiliateId,
      affiliateName: affiliate ? affiliate.name : saleData.affiliateId,
      projectId: saleData.projectId,
      projectName: proj ? proj.name : saleData.projectId,
      grossSale: salePrice,
      eligibleAmount: salePrice,
      rate: effectiveRate,
      grossCommission,
      adjustments: 0,
      netPayable: grossCommission,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
      approvedDate: null,
      paidDate: null,
      approvedBy: null,
      paymentReference: null
    };

    this.commissions.unshift(newCommission);

    // Add to Master & Project Ledgers
    this.ledger.unshift({
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      projectId: saleData.projectId,
      unitId: saleData.unitId || 'N/A',
      affiliateId: saleData.affiliateId,
      affiliateName: affiliate ? affiliate.name : saleData.affiliateId,
      customerName: saleData.customerName,
      type: 'Sale',
      amount: salePrice,
      commissionRate: effectiveRate,
      grossCommission,
      adjustment: 0,
      netCommission: grossCommission,
      status: 'Pending',
      reference: `SL-${saleId}`,
      notes: `Recorded sale transaction. Commission # ${commId} created.`,
      createdBy: 'Super Admin'
    });

    this.logAudit(
      'Super Admin',
      'SALE_RECORDED',
      `Sale #${saleId} (PKR ${salePrice.toLocaleString()})`,
      'None',
      'Confirmed',
      `Calculated commission of ${effectiveRate}% (PKR ${grossCommission.toLocaleString()}) for Affiliate #${saleData.affiliateId}`
    );

    this.save();
    return { success: true, sale: newSale, commission: newCommission };
  }

  // ==========================================
  // COMMISSION APPROVAL & DISBURSEMENT
  // ==========================================
  approveCommission(commId, approvedBy = 'Dilnawaz (Super Admin)') {
    const comm = this.commissions.find(c => c.id === commId);
    if (!comm) return { success: false };
    const oldStatus = comm.status;
    comm.status = 'Approved';
    comm.approvedDate = new Date().toISOString().split('T')[0];
    comm.approvedBy = approvedBy;

    // Update related sale
    const sale = this.sales.find(s => s.id === comm.saleId);
    if (sale) sale.paymentStatus = 'Approved';

    this.logAudit(
      approvedBy,
      'COMMISSION_APPROVED',
      `Commission #${commId} (Affiliate: ${comm.affiliateName})`,
      oldStatus,
      'Approved',
      `Approved net payable commission of PKR ${comm.netPayable.toLocaleString()}`
    );

    this.save();
    return { success: true, commission: comm };
  }

  markCommissionPayable(commId) {
    const comm = this.commissions.find(c => c.id === commId);
    if (!comm) return { success: false };
    comm.status = 'Payable';
    const sale = this.sales.find(s => s.id === comm.saleId);
    if (sale) sale.paymentStatus = 'Payable';

    this.logAudit('Super Admin', 'COMMISSION_MARKED_PAYABLE', `Commission #${commId}`, 'Approved', 'Payable', `Moved to active payout queue.`);
    this.save();
    return { success: true, commission: comm };
  }

  disbursePayment(paymentData) {
    const comm = this.commissions.find(c => c.id === paymentData.commissionId);
    const affiliate = this.affiliates.find(a => a.id === paymentData.affiliateId);
    const amount = Number(paymentData.amount);
    const payId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = {
      id: payId,
      affiliateId: paymentData.affiliateId,
      affiliateName: affiliate ? affiliate.name : paymentData.affiliateId,
      projectId: paymentData.projectId || (comm ? comm.projectId : 'General'),
      commissionIds: [paymentData.commissionId],
      amount,
      method: paymentData.method || 'Bank Transfer',
      reference: paymentData.reference || `REF-FT-${Date.now().toString().slice(-6)}`,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      proofUrl: paymentData.proofUrl || '/receipts/payout-voucher.pdf',
      status: 'Paid',
      approvedBy: 'Dilnawaz (Super Admin)',
      notes: paymentData.notes || 'Settled affiliate commission disbursement.'
    };

    this.payments.unshift(newPayment);

    // Update Commission record
    if (comm) {
      comm.status = 'Paid';
      comm.paidDate = newPayment.date;
      comm.paymentReference = newPayment.reference;
    }

    // Update Sale record
    if (comm && comm.saleId) {
      const sale = this.sales.find(s => s.id === comm.saleId);
      if (sale) sale.paymentStatus = 'Paid';
    }

    // Add Payment debit record to Ledgers
    this.ledger.unshift({
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: newPayment.date,
      projectId: newPayment.projectId,
      unitId: 'N/A',
      affiliateId: newPayment.affiliateId,
      affiliateName: newPayment.affiliateName,
      customerName: 'Payout Disbursement',
      type: 'Payment',
      amount,
      commissionRate: 0,
      grossCommission: 0,
      adjustment: 0,
      netCommission: -amount,
      status: 'Paid',
      reference: newPayment.reference,
      notes: `Disbursed payout via ${newPayment.method} (${newPayment.reference})`,
      createdBy: 'Super Admin'
    });

    this.logAudit(
      'Super Admin',
      'PAYMENT_DISBURSED',
      `Payment #${payId} (PKR ${amount.toLocaleString()})`,
      'Payable',
      'Paid',
      `Disbursed to Affiliate #${paymentData.affiliateId} (${newPayment.method}: ${newPayment.reference})`
    );

    this.save();
    return { success: true, payment: newPayment };
  }

  // ==========================================
  // LEDGER ADJUSTMENT TRANSACTIONS (IMMUTABLE AUDIT MODEL)
  // ==========================================
  addLedgerAdjustment(adjData) {
    const adjAmount = Number(adjData.amount);
    const txId = `ADJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx = {
      id: txId,
      date: adjData.date || new Date().toISOString().split('T')[0],
      projectId: adjData.projectId,
      unitId: adjData.unitId || 'N/A',
      affiliateId: adjData.affiliateId,
      affiliateName: adjData.affiliateName || adjData.affiliateId,
      customerName: 'Ledger Audit Adjustment',
      type: 'Adjustment',
      amount: Math.abs(adjAmount),
      commissionRate: 0,
      grossCommission: 0,
      adjustment: adjAmount,
      netCommission: adjAmount,
      status: 'Approved',
      reference: adjData.reference || `ADJ-REF-${Date.now().toString().slice(-4)}`,
      notes: adjData.reason || 'Administrative adjustment transaction.',
      createdBy: 'Dilnawaz (Super Admin)'
    };

    this.ledger.unshift(newTx);

    this.logAudit(
      'Dilnawaz (Super Admin)',
      'LEDGER_ADJUSTMENT_CREATED',
      `Adjustment #${txId}`,
      '0',
      `${adjAmount > 0 ? '+' : ''}${adjAmount}`,
      `Reason: ${adjData.reason} | Project: ${adjData.projectId} | Affiliate: ${adjData.affiliateId}`
    );

    this.save();
    return { success: true, transaction: newTx };
  }

  // ==========================================
  // SUPPORT TICKETS
  // ==========================================
  createTicket(ticketData) {
    const id = `TCK-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket = {
      id,
      affiliateId: ticketData.affiliateId,
      affiliateName: ticketData.affiliateName,
      subject: ticketData.subject,
      category: ticketData.category || 'General Inquiry',
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      messages: [
        {
          sender: ticketData.affiliateName,
          role: 'partner',
          text: ticketData.message,
          time: 'Just now'
        }
      ]
    };
    this.tickets.unshift(newTicket);
    this.save();
    return { success: true, ticket: newTicket };
  }

  replyTicket(ticketId, message, senderName, role = 'admin') {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false };
    ticket.messages.push({
      sender: senderName,
      role,
      text: message,
      time: 'Just now'
    });
    if (role === 'admin') ticket.status = 'In Progress';
    this.save();
    return { success: true, ticket };
  }

  // ==========================================
  // METRIC & AGGREGATE CALCULATORS
  // ==========================================
  getGlobalStats() {
    const totalAffiliates = this.affiliates.length;
    const activeAffiliates = this.affiliates.filter(a => a.status === 'Approved').length;
    const totalProjects = this.projects.length;
    const totalLeads = this.leads.length;
    const qualifiedLeads = this.leads.filter(l => ['Qualified', 'Site Visit', 'Negotiation', 'Booked', 'Converted'].includes(l.status)).length;
    const totalSales = this.sales.length;
    const grossSales = this.sales.reduce((sum, s) => sum + s.salePrice, 0);

    const pendingCommission = this.commissions.filter(c => ['Pending', 'Under Review'].includes(c.status)).reduce((sum, c) => sum + c.netPayable, 0);
    const approvedCommission = this.commissions.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.netPayable, 0);
    const payableCommission = this.commissions.filter(c => c.status === 'Payable').reduce((sum, c) => sum + c.netPayable, 0);
    const paidCommission = this.commissions.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.netPayable, 0);

    return {
      totalAffiliates,
      activeAffiliates,
      totalProjects,
      totalLeads,
      qualifiedLeads,
      totalSales,
      grossSales,
      pendingCommission,
      approvedCommission,
      payableCommission,
      paidCommission,
      totalCommissionsLiability: pendingCommission + approvedCommission + payableCommission + paidCommission
    };
  }

  getAffiliateStats(affiliateId) {
    const affLeads = this.leads.filter(l => l.affiliateId === affiliateId);
    const affSales = this.sales.filter(s => s.affiliateId === affiliateId);
    const affComms = this.commissions.filter(c => c.affiliateId === affiliateId);
    const affPayments = this.payments.filter(p => p.affiliateId === affiliateId);

    const totalReferrals = affLeads.length;
    const qualifiedLeads = affLeads.filter(l => ['Qualified', 'Site Visit', 'Negotiation', 'Booked', 'Converted'].includes(l.status)).length;
    const successfulSales = affSales.filter(s => s.status === 'Completed').length;

    const pendingCommission = affComms.filter(c => ['Pending', 'Under Review'].includes(c.status)).reduce((sum, c) => sum + c.netPayable, 0);
    const approvedCommission = affComms.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.netPayable, 0);
    const payableCommission = affComms.filter(c => c.status === 'Payable').reduce((sum, c) => sum + c.netPayable, 0);
    const paidCommission = affComms.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.netPayable, 0);
    const totalEarnings = paidCommission + payableCommission;

    const conversionRate = totalReferrals > 0 ? ((successfulSales / totalReferrals) * 100).toFixed(1) + '%' : '0.0%';

    return {
      totalReferrals,
      qualifiedLeads,
      successfulSales,
      pendingCommission,
      approvedCommission,
      payableCommission,
      paidCommission,
      totalEarnings,
      conversionRate
    };
  }

  getProjectStats(projectId) {
    const projLeads = this.leads.filter(l => l.projectId === projectId);
    const projSales = this.sales.filter(s => s.projectId === projectId);
    const projComms = this.commissions.filter(c => c.projectId === projectId);
    const projInventory = this.inventory.filter(u => u.projectId === projectId);

    const totalLeads = projLeads.length;
    const qualifiedLeads = projLeads.filter(l => ['Qualified', 'Site Visit', 'Negotiation', 'Booked', 'Converted'].includes(l.status)).length;
    const salesCount = projSales.filter(s => s.status === 'Completed').length;
    const grossSales = projSales.reduce((sum, s) => sum + s.salePrice, 0);

    const commissionPaid = projComms.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.netPayable, 0);
    const commissionPending = projComms.filter(c => ['Pending', 'Approved', 'Payable'].includes(c.status)).reduce((sum, c) => sum + c.netPayable, 0);

    return {
      totalLeads,
      qualifiedLeads,
      salesCount,
      grossSales,
      commissionPaid,
      commissionPending,
      totalUnits: projInventory.length || 20,
      soldUnits: projInventory.filter(u => u.status === 'Sold').length,
      availableUnits: projInventory.filter(u => u.status === 'Available').length
    };
  }
}

export const platformStore = new PlatformStore();
