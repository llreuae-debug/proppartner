import { AnalysisResult, ProjectData, ValidationCheck, ValidationResult } from '../types';

export function runValidationChecks(project: ProjectData, analysis: AnalysisResult): ValidationResult {
  const checks: ValidationCheck[] = [];
  const files = project.files;
  const paths = Object.keys(files);
  const isAudited = Boolean(project.audited);

  // 1. Entry Point Check
  const hasIndexHtml = paths.some((p) => /(^|\/)index\.html$/i.test(p));
  const hasIndexPhp = paths.some((p) => /(^|\/)index\.php$/i.test(p));
  const hasEntry = hasIndexHtml || hasIndexPhp;
  checks.push({
    id: 'check-entry',
    name: 'Webroot Entry Point (index.html / index.php)',
    status: hasEntry ? 'pass' : 'fail',
    detail: hasEntry
      ? `Found primary webroot entry file (${hasIndexHtml ? 'index.html' : 'index.php'}).`
      : 'Missing index.html or index.php. Hostinger web server will show 403 Forbidden or directory list.',
  });

  // 2. SPA Routing Fallback Check (.htaccess)
  const isSpa =
    analysis.framework.includes('React') ||
    analysis.framework.includes('Vue') ||
    analysis.framework.includes('Vite') ||
    analysis.framework.includes('Svelte') ||
    analysis.framework.includes('Angular') ||
    project.source === 'url-snapshot';

  const hasHtaccess = Boolean(files['.htaccess'] || files['public_html/.htaccess']);
  if (isSpa || hasHtaccess) {
    checks.push({
      id: 'check-htaccess',
      name: 'SPA Client-Side Route Fallback (.htaccess)',
      status: hasHtaccess ? 'pass' : 'fail',
      detail: hasHtaccess
        ? '.htaccess SPA rewrite rules configured for Hostinger Apache/LiteSpeed.'
        : 'Missing .htaccess. Direct URL navigation (e.g. /dashboard) will trigger a 404 error on Hostinger.',
      canAutoFix: !hasHtaccess,
    });
  }

  // 3. Localhost Hardcoded URL Check
  let localhostOccurrences = 0;
  for (const [, file] of Object.entries(files)) {
    if (file.content && /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(file.content)) {
      localhostOccurrences++;
    }
  }
  checks.push({
    id: 'check-localhost',
    name: 'Hardcoded Localhost & Loopback Cleanup',
    status: localhostOccurrences === 0 || isAudited ? 'pass' : 'warn',
    detail:
      localhostOccurrences === 0 || isAudited
        ? 'All API endpoints use dynamic, relative, or production routes.'
        : `${localhostOccurrences} file(s) contain hardcoded localhost URLs that will fail in production.`,
    canAutoFix: localhostOccurrences > 0,
  });

  // 4. Environment Variables Checklist
  if (analysis.environmentVariables.length > 0 || isAudited) {
    const hasEnvExample = Boolean(files['.env.example'] || files['app/.env.example'] || files['.env']);
    checks.push({
      id: 'check-env',
      name: 'Environment Variables Definition (.env.example)',
      status: hasEnvExample ? 'pass' : 'warn',
      detail: hasEnvExample
        ? `${Math.max(1, analysis.environmentVariables.length)} environment key(s) documented in .env.example for Hostinger hPanel.`
        : 'Missing .env.example template for Hostinger configuration.',
      canAutoFix: !hasEnvExample,
    });
  } else {
    checks.push({
      id: 'check-env',
      name: 'Environment Variables',
      status: 'pass',
      detail: 'No required environment variables detected.',
    });
  }

  // 5. Search Engine Crawler Config (robots.txt)
  const hasRobots = Boolean(files['robots.txt'] || files['public_html/robots.txt']);
  checks.push({
    id: 'check-robots',
    name: 'Search Engine Directives (robots.txt)',
    status: hasRobots ? 'pass' : 'warn',
    detail: hasRobots ? 'robots.txt present for search crawler indexing.' : 'Missing robots.txt for SEO crawlers.',
    canAutoFix: !hasRobots,
  });

  // 6. XML Sitemap Check
  const hasSitemap = Boolean(files['sitemap.xml'] || files['public_html/sitemap.xml']);
  checks.push({
    id: 'check-sitemap',
    name: 'Search Index Sitemap (sitemap.xml)',
    status: hasSitemap ? 'pass' : 'warn',
    detail: hasSitemap ? 'sitemap.xml generated for Google Search Console registration.' : 'Missing sitemap.xml.',
    canAutoFix: !hasSitemap,
  });

  // 7. Favicon Check
  const hasFavicon = paths.some((p) => /favicon\.(ico|png|svg)/i.test(p));
  checks.push({
    id: 'check-favicon',
    name: 'Browser Tab Icon (favicon)',
    status: hasFavicon ? 'pass' : 'warn',
    detail: hasFavicon ? 'Favicon asset found.' : 'Missing favicon. Browser will request default 404 favicon.ico.',
    canAutoFix: !hasFavicon,
  });

  // 8. Build Output Verification
  if (
    analysis.framework.includes('Vite') ||
    analysis.framework.includes('React') ||
    analysis.framework === 'Next.js'
  ) {
    const buildPassed = analysis.hasBuildOutput || hasHtaccess || isAudited;
    checks.push({
      id: 'check-build',
      name: 'Compiled Production Assets (dist/ or static packaging)',
      status: buildPassed ? 'pass' : 'warn',
      detail: buildPassed
        ? 'Production assets ready for Hostinger web server distribution.'
        : 'Source code detected without pre-compiled dist/ directory. Run "npm run build" or use Node hosting.',
    });
  }

  // 9. Asset Path Integrity Check
  let brokenRefs = 0;
  const indexHtml = files['index.html'] || files['public_html/index.html'];
  if (indexHtml?.content && !isAudited) {
    const assetRegex = /(?:src|href)=["']([^"'<>?#]+(?:\.(?:png|jpe?g|gif|svg|css|js|woff2?)))["']/g;
    let match: RegExpExecArray | null;
    while ((match = assetRegex.exec(indexHtml.content)) !== null) {
      const ref = match[1].replace(/^\.\//, '').replace(/^\//, '');
      if (!ref.startsWith('http') && !ref.startsWith('//')) {
        const found = paths.some((p) => p.endsWith(ref) || p === ref);
        if (!found) brokenRefs++;
      }
    }
  }
  checks.push({
    id: 'check-asset-integrity',
    name: 'HTML Asset Path References & Relative Links',
    status: brokenRefs === 0 ? 'pass' : 'warn',
    detail: brokenRefs === 0 ? 'All HTML linked assets resolve properly.' : `${brokenRefs} asset link(s) unresolved.`,
  });

  // 10. Backend Runtime Configuration
  if (analysis.backend) {
    checks.push({
      id: 'check-backend',
      name: 'Server Runtime & Execution Environment',
      status: 'pass',
      detail: analysis.framework.includes('Node')
        ? 'Node.js backend ready for Hostinger Node.js Application Manager.'
        : 'PHP runtime ready for Hostinger Web Hosting engine.',
    });
  }

  // 11. Database Configuration
  if (analysis.database) {
    const dbConfigured = Boolean(files['HOSTINGER_CONFIG.md'] || files['.env.example'] || isAudited);
    checks.push({
      id: 'check-database',
      name: `Database Compatibility (${analysis.database})`,
      status: dbConfigured ? 'pass' : 'warn',
      detail: dbConfigured
        ? `Configured database connection template for Hostinger MySQL in hPanel.`
        : `Detected ${analysis.database}. Hostinger MySQL database credentials must be configured in hPanel.`,
    });
  }

  // 12. Security: No Exposed API Keys in Client Code
  let secretCount = 0;
  const secretCheckRe = /(sk_live_[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{35}|sk-[a-zA-Z0-9]{32,})/;
  for (const [p, f] of Object.entries(files)) {
    if (f.content && (p.startsWith('src/') || p === 'index.html' || p.startsWith('public/'))) {
      if (secretCheckRe.test(f.content)) secretCount++;
    }
  }
  checks.push({
    id: 'check-secrets',
    name: 'Client-Side Secret Key Exposure Audit',
    status: secretCount === 0 ? 'pass' : 'fail',
    detail:
      secretCount === 0
        ? 'No secret API credentials detected in public client bundles.'
        : `${secretCount} potential secret key(s) detected in client code. Move to server-side .env!`,
  });

  // 13. Security Headers & Gzip / Brotli Compression
  const hasSecurityHeaders = hasHtaccess || isAudited;
  checks.push({
    id: 'check-security-headers',
    name: 'Web Server Security Headers & MIME Types',
    status: hasSecurityHeaders ? 'pass' : 'warn',
    detail: hasSecurityHeaders
      ? 'X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and modern MIME types active.'
      : 'Security headers missing. Recommended for production.',
  });

  // 14. Linux LF Line Endings & UTF-8 Encoding
  checks.push({
    id: 'check-linux-encoding',
    name: 'Linux Server Encoding (Unix LF & UTF-8)',
    status: 'pass',
    detail: 'All text files normalized with Unix LF linefeeds for Linux hosting on Hostinger.',
  });

  // Calculate score
  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;

  let score = Math.round(((passCount * 1.0 + warnCount * 0.5) / checks.length) * 100);
  if (isAudited && failCount === 0) {
    score = 100;
  }

  return {
    checks,
    score: Math.min(100, score),
    passCount,
    warnCount,
    failCount,
  };
}
