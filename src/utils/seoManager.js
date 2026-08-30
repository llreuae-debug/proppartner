// SEO, GEO (Generative Engine Optimization) & AEO (Answer Engine Optimization) Manager
// PropPartner Real Estate Affiliate Network

const BASE_URL = 'https://proppartner.pro';
const ORG_NAME = 'PropPartner';
const DEFAULT_OG_IMAGE = 'https://proppartner.pro/assets/proppartner-logo.jpg';

export const seoRoutes = {
  home: {
    title: 'PropPartner | Real Estate Affiliate & Referral Partner Program',
    description: 'Join PropPartner\'s premier 3D real estate affiliate partner network. Refer qualified property buyers to verified flagship developments and track referrals, sales, and weekly commissions through your partner dashboard.',
    canonical: `${BASE_URL}/`,
    ogType: 'website',
    schemaType: 'Organization',
    keywords: 'real estate affiliate program, property referral program, real estate commission, earn commission from property referrals, real estate partner program'
  },
  affiliateProgram: {
    title: 'Real Estate Affiliate Program | PropPartner Partner Network',
    description: 'Discover how the PropPartner real estate affiliate program works. Connect clients with luxury residential towers and commercial hubs, track leads transparently, and earn up to 5.5% milestone commission.',
    canonical: `${BASE_URL}/affiliate-program`,
    ogType: 'article',
    schemaType: 'WebPage',
    keywords: 'real estate affiliate program, become property affiliate, real estate referral partner, property sales affiliate, real estate partner program'
  },
  projects: {
    title: 'Flagship Real Estate Developments | PropPartner Affiliate Inventory',
    description: 'Explore verified luxury residential towers, beachfront villas, and commercial hubs open for affiliate partner referrals with high-yield milestone commission tiers.',
    canonical: `${BASE_URL}/projects`,
    ogType: 'website',
    schemaType: 'CollectionPage',
    keywords: 'real estate projects, luxury property affiliate, commercial real estate referral, high yield property projects'
  },
  howItWorks: {
    title: 'How It Works | PropPartner Real Estate Referral Process',
    description: 'Step-by-step guide to the PropPartner real estate referral process: register as a partner, submit buyer leads, track developer sales in real time, and receive weekly bank wire disbursements.',
    canonical: `${BASE_URL}/how-it-works`,
    ogType: 'article',
    schemaType: 'HowTo',
    keywords: 'how real estate referral programs work, property lead referral, real estate affiliate tracking, duplicate lead policy'
  },
  commission: {
    title: 'Real Estate Affiliate Commission & Milestone Policy | PropPartner',
    description: 'Transparent guide to PropPartner property referral commission rates (3.0% - 5.5%), 4-stage milestone disbursements, Friday settlement schedules, and verified escrow criteria.',
    canonical: `${BASE_URL}/commission`,
    ogType: 'article',
    schemaType: 'WebPage',
    keywords: 'real estate commission, property referral commission, affiliate commission rates, real estate sales commission schedule'
  },
  resources: {
    title: 'Real Estate Affiliate Resource Center & Knowledge Hub | PropPartner',
    description: 'Expert guides, referral marketing frameworks, lead qualification playbooks, and commission guides for real estate affiliate partners and property consultants.',
    canonical: `${BASE_URL}/resources`,
    ogType: 'website',
    schemaType: 'CollectionPage',
    keywords: 'real estate affiliate marketing, property referral guide, real estate lead generation, affiliate success guides'
  },
  about: {
    title: 'About PropPartner | Verified Real Estate Affiliate & Tech Network',
    description: 'Learn about PropPartner\'s mission, architectural 3D visualization technology, developer network, compliance framework, and headquarters in Faisalabad.',
    canonical: `${BASE_URL}/about`,
    ogType: 'website',
    schemaType: 'AboutPage',
    keywords: 'about proppartner, real estate affiliate network, property tech platform, verified real estate partners'
  },
  contact: {
    title: 'Contact Affiliate Desk & Regional HQ | PropPartner',
    description: 'Get in touch with the PropPartner Affiliate Desk. Direct helpline +92 322 865 4411, 24/7 WhatsApp support, and physical headquarters at Gatwala Chowk, Faisalabad.',
    canonical: `${BASE_URL}/contact`,
    ogType: 'website',
    schemaType: 'ContactPage',
    keywords: 'contact proppartner, real estate affiliate desk, affiliate support, proppartner faisalabad'
  },
  terms: {
    title: 'Terms & Conditions | PropPartner Compliance & Legal',
    description: 'Official Terms and Conditions governing access to and usage of the PropPartner 3D real estate platform, partner portal, and affiliate referral network.',
    canonical: `${BASE_URL}/terms-and-conditions`,
    ogType: 'article',
    schemaType: 'WebPage'
  },
  agreement: {
    title: 'Affiliate Partner Master Agreement | PropPartner Legal',
    description: 'The official Master Affiliate Agreement establishing partner terms, lead attribution criteria, 4-stage milestone payouts, marketing standards, and payment conditions.',
    canonical: `${BASE_URL}/affiliate-agreement`,
    ogType: 'article',
    schemaType: 'WebPage'
  },
  privacy: {
    title: 'Privacy & Data Governance Policy | PropPartner Security',
    description: 'Data protection principles, PBKDF2 cryptographic authentication security, cookie usage, data retention schedules, and user privacy rights at PropPartner.',
    canonical: `${BASE_URL}/privacy-policy`,
    ogType: 'article',
    schemaType: 'WebPage'
  },
  commissionPolicy: {
    title: 'Commission Calculation & Settlement Policy | PropPartner',
    description: 'Guidelines on property referral commission rate tiers, non-guarantee notices, 7-stage verification lifecycle, Friday wire payouts, and escrow rules.',
    canonical: `${BASE_URL}/commission-policy`,
    ogType: 'article',
    schemaType: 'WebPage'
  },
  referralPolicy: {
    title: 'Referral Attribution & Duplicate Policy | PropPartner',
    description: 'Rules governing referral link tracking, prospective buyer registration, automated CRM duplicate detection, and lead attribution dispute resolution.',
    canonical: `${BASE_URL}/referral-policy`,
    ogType: 'article',
    schemaType: 'WebPage'
  },
  disclaimer: {
    title: 'Legal, Financial & Risk Disclaimer | PropPartner',
    description: 'Important legal notices regarding real estate market risks, illustrative simulation calculations, third-party developer representations, and financial advice disclaimers.',
    canonical: `${BASE_URL}/disclaimer`,
    ogType: 'article',
    schemaType: 'WebPage'
  },
  notFound: {
    title: 'Page Not Found (404) | PropPartner Real Estate Network',
    description: 'The requested page could not be found. Return to PropPartner homepage or explore our real estate developments and affiliate partner program.',
    canonical: `${BASE_URL}/404`,
    ogType: 'website',
    noindex: true
  }
};

/**
 * Updates document head with unique title, meta tags, canonical link, Open Graph, Twitter Cards, and JSON-LD schema
 */
export function updateSEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  keywords,
  noindex = false,
  schemas = []
}) {
  // 1. Document Title
  document.title = title || seoRoutes.home.title;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description || seoRoutes.home.description;

  // 3. Meta Keywords
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;
  }

  // 4. Robots Noindex
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    document.head.appendChild(metaRobots);
  }
  metaRobots.content = noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  // 5. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonical || BASE_URL;

  // 6. Open Graph Tags
  setMetaProperty('og:title', title || seoRoutes.home.title);
  setMetaProperty('og:description', description || seoRoutes.home.description);
  setMetaProperty('og:url', canonical || BASE_URL);
  setMetaProperty('og:type', ogType);
  setMetaProperty('og:image', ogImage);
  setMetaProperty('og:site_name', ORG_NAME);

  // 7. Twitter Card Tags
  setMetaProperty('twitter:card', 'summary_large_image', 'name');
  setMetaProperty('twitter:title', title || seoRoutes.home.title, 'name');
  setMetaProperty('twitter:description', description || seoRoutes.home.description, 'name');
  setMetaProperty('twitter:image', ogImage, 'name');

  // 8. Inject Structured Data (JSON-LD)
  injectStructuredData(schemas, { title, description, canonical, ogImage });
}

function setMetaProperty(property, content, attribute = 'property') {
  let meta = document.querySelector(`meta[${attribute}="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

/**
 * Builds and injects Schema.org JSON-LD objects
 */
function injectStructuredData(customSchemas = [], pageContext = {}) {
  // Remove existing dynamic json-ld scripts
  document.querySelectorAll('script[data-schema-dynamic="true"]').forEach(el => el.remove());

  // Default Organization & LocalBusiness Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${BASE_URL}/#organization`,
    'name': 'PropPartner',
    'legalName': 'PropPartner Real Estate Affiliate Network',
    'url': BASE_URL,
    'logo': `${BASE_URL}/assets/proppartner-logo.jpg`,
    'image': `${BASE_URL}/assets/proppartner-logo.jpg`,
    'description': 'The premier 3D real estate partner network connecting high-performing affiliates with verified high-yield residential towers and commercial developments.',
    'telephone': '+923228654411',
    'email': 'llre.uae@gmail.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Gatwala Chowk, Canal Expressway, Sheikhupura Road',
      'addressLocality': 'Faisalabad',
      'addressRegion': 'Punjab',
      'postalCode': '38000',
      'addressCountry': 'PK'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '31.4504',
      'longitude': '73.1350'
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '09:00',
        'closes': '19:00'
      }
    ],
    'sameAs': [
      'https://www.linkedin.com',
      'https://www.youtube.com',
      'https://wa.me/923228654411'
    ]
  };

  // WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    'url': BASE_URL,
    'name': 'PropPartner Real Estate Platform',
    'description': 'Real Estate Affiliate & Referral Management Network',
    'publisher': {
      '@id': `${BASE_URL}/#organization`
    }
  };

  const allSchemas = [organizationSchema, websiteSchema, ...customSchemas];

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema-dynamic', 'true');
  script.textContent = JSON.stringify(allSchemas.length === 1 ? allSchemas[0] : allSchemas, null, 2);
  document.head.appendChild(script);
}

/**
 * Builds FAQPage JSON-LD schema
 */
export function buildFAQSchema(faqList) {
  if (!faqList || !faqList.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqList.map(item => ({
      '@type': 'Question',
      'name': item.q || item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a || item.answer
      }
    }))
  };
}

/**
 * Builds BreadcrumbList JSON-LD schema
 */
export function buildBreadcrumbSchema(items) {
  if (!items || !items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

/**
 * Builds Article JSON-LD schema
 */
export function buildArticleSchema({ title, description, url, image, datePublished, dateModified, author = 'PropPartner Research & Editorial Team' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'url': url.startsWith('http') ? url : `${BASE_URL}${url}`,
    'image': image || DEFAULT_OG_IMAGE,
    'datePublished': datePublished || '2026-08-30T00:00:00+05:00',
    'dateModified': dateModified || '2026-08-30T00:00:00+05:00',
    'author': {
      '@type': 'Organization',
      'name': author,
      'url': BASE_URL
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'PropPartner',
      'logo': {
        '@type': 'ImageObject',
        'url': `${BASE_URL}/assets/proppartner-logo.jpg`
      }
    }
  };
}

/**
 * Builds RealEstateListing / SingleFamilyResidence JSON-LD schema
 */
export function buildProjectSchema(project) {
  if (!project) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    'name': project.name,
    'description': project.tagline || project.name,
    'image': project.image,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': project.location,
      'addressLocality': project.city || 'Karachi / Gwadar / Islamabad',
      'addressCountry': 'PK'
    },
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'PKR',
      'lowPrice': project.startingPrice,
      'offerCount': project.availableUnits || 10
    }
  };
}
