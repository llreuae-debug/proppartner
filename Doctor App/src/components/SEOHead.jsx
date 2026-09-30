import React, { useEffect } from 'react';

/**
 * SEOHead - Dynamic Meta & JSON-LD Structured Data Manager
 * Injects Title, Meta Description, Canonical URLs, Open Graph, Twitter Cards,
 * and Schema.org structured data (Physician, FAQPage, BreadcrumbList, WebSite).
 */
export default function SEOHead({
  title = 'DocCare | Find Doctors & Book Appointments in Pakistan',
  description = 'Find doctors in Pakistan by city and specialty. View profiles, fees and availability, then book your doctor appointment with DocCare.',
  canonicalUrl = 'https://doccare.pk',
  ogImage = 'https://doccare.pk/brand/doccare-logo.png',
  ogType = 'website',
  schemaData = null,
  breadcrumbs = null,
  lang = 'en'
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or update meta tag
    const setMetaTag = (selector, attribute, attrValue, content) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', 'description', description);
    setMetaTag('name', 'robots', 'robots', 'index, follow, max-image-preview:large');

    // OpenGraph Meta Tags
    setMetaTag('property', 'og:title', 'og:title', title);
    setMetaTag('property', 'og:description', 'og:description', description);
    setMetaTag('property', 'og:type', 'og:type', ogType);
    setMetaTag('property', 'og:url', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'og:site_name', 'DocCare Pakistan');
    setMetaTag('property', 'og:locale', 'og:locale', lang === 'ur' ? 'ur_PK' : 'en_PK');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', 'twitter:image', ogImage);

    // Canonical Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Dynamic JSON-LD Structured Data
    const scriptId = 'doccare-seo-schema';
    let scriptElement = document.getElementById(scriptId);
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const schemas = [];

    // Base WebSite Schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'DocCare Pakistan',
      'url': 'https://doccare.pk',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://doccare.pk/find-doctors?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    });

    // Optional BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': crumb.name,
          'item': crumb.url
        }))
      });
    }

    // Custom Schema (e.g. Physician, FAQPage, MedicalBusiness)
    if (schemaData) {
      if (Array.isArray(schemaData)) {
        schemas.push(...schemaData);
      } else {
        schemas.push(schemaData);
      }
    }

    scriptElement.textContent = JSON.stringify(schemas);

  }, [title, description, canonicalUrl, ogImage, ogType, schemaData, breadcrumbs, lang]);

  return null;
}
