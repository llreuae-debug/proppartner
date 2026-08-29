import { AnalysisResult, CompatStatus, ProjectData } from '../types';

export function analyzeProject(project: ProjectData): AnalysisResult {
  const files = project.files;
  const paths = Object.keys(files);

  const analysis: AnalysisResult = {
    framework: 'Unknown',
    language: [],
    packageManager: null,
    buildSystem: null,
    entryPoint: null,
    frontend: false,
    backend: false,
    database: null,
    apiDependencies: [],
    environmentVariables: [],
    externalServices: [],
    authentication: [],
    paymentIntegrations: [],
    storage: [],
    routing: 'Static',
    serverRequirements: [],
    assets: { count: 0, types: [] },
    routes: [],
    hasBuildOutput: false,
    buildOutputDir: null,
    compatibility: {
      frontend: 'ok',
      build: 'ok',
      assets: 'ok',
      routing: 'ok',
      backend: 'ok',
      database: 'ok',
      env: 'ok',
      apis: 'ok',
    },
    score: 100,
  };

  // 1. Check package.json
  const pkgPath = paths.find((p) => p === 'package.json' || p.endsWith('/package.json'));
  let pkg: any = null;
  if (pkgPath && files[pkgPath]?.content) {
    try {
      pkg = JSON.parse(files[pkgPath].content!);
      analysis.packageManager = 'npm';
    } catch {
      // ignore
    }
  }

  if (paths.some((p) => p.endsWith('yarn.lock'))) analysis.packageManager = 'yarn';
  if (paths.some((p) => p.endsWith('pnpm-lock.yaml'))) analysis.packageManager = 'pnpm';

  // 2. Framework & Dependencies
  if (pkg && (pkg.dependencies || pkg.devDependencies)) {
    const d: Record<string, string> = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    if (d.next) {
      analysis.framework = 'Next.js';
      analysis.frontend = true;
      analysis.backend = true;
      analysis.buildSystem = 'Next.js Build (next build)';
    } else if (d.astro) {
      analysis.framework = 'Astro';
      analysis.frontend = true;
      analysis.buildSystem = 'Astro Build';
    } else if (d.nuxt) {
      analysis.framework = 'Nuxt';
      analysis.frontend = true;
      analysis.backend = true;
      analysis.buildSystem = 'Nuxt Build';
    } else if (d.vite) {
      analysis.frontend = true;
      analysis.buildSystem = 'Vite';
      if (d.react || d['@vitejs/plugin-react'] || d['@vitejs/plugin-react-swc']) {
        analysis.framework = 'Vite + React';
      } else if (d.vue || d['@vitejs/plugin-vue']) {
        analysis.framework = 'Vite + Vue';
      } else if (d.svelte || d['@sveltejs/vite-plugin-svelte']) {
        analysis.framework = 'Vite + Svelte';
      } else {
        analysis.framework = 'Vite SPA';
      }
    } else if (d.react || d['react-scripts']) {
      analysis.framework = 'React (CRA)';
      analysis.frontend = true;
      analysis.buildSystem = 'React Scripts';
    } else if (d.vue) {
      analysis.framework = 'Vue.js';
      analysis.frontend = true;
    } else if (d['@angular/core']) {
      analysis.framework = 'Angular';
      analysis.frontend = true;
      analysis.buildSystem = 'Angular CLI';
    } else if (d.svelte) {
      analysis.framework = 'Svelte';
      analysis.frontend = true;
    }

    // Backend frameworks
    if (d.express || d.fastify || d.koa || d.polka || d['@nestjs/core'] || d.hapi) {
      analysis.backend = true;
      if (!analysis.language.includes('Node.js')) analysis.language.push('Node.js');
      if (analysis.framework === 'Unknown') {
        analysis.framework = d['@nestjs/core'] ? 'NestJS' : d.fastify ? 'Fastify' : 'Express (Node.js)';
      } else if (!analysis.framework.includes('Node')) {
        analysis.framework += ' + Node Backend';
      }
    }

    // Database & ORMs
    if (d.prisma || d['@prisma/client']) analysis.database = 'Prisma ORM';
    else if (d.drizzle || d['drizzle-orm']) analysis.database = 'Drizzle ORM';
    else if (d.typeorm) analysis.database = 'TypeORM';
    else if (d.mongoose) analysis.database = 'MongoDB (Mongoose)';
    else if (d.mysql || d.mysql2) analysis.database = 'MySQL';
    else if (d.pg || d.postgres) analysis.database = 'PostgreSQL';
    else if (d.mongodb) analysis.database = 'MongoDB';
    else if (d.redis || d.ioredis) analysis.database = 'Redis Cache';
    else if (d.sqlite3 || d['better-sqlite3']) analysis.database = 'SQLite';

    // External integrations
    if (d['@supabase/supabase-js']) analysis.externalServices.push('Supabase (BaaS)');
    if (d.firebase || d['firebase-admin']) analysis.externalServices.push('Firebase');
    if (d.stripe || d['@stripe/stripe-js'] || d['@stripe/react-stripe-js']) {
      analysis.paymentIntegrations.push('Stripe Payments');
    }
    if (d['@paypal/checkout-server-sdk'] || d['@paypal/react-paypal-js']) {
      analysis.paymentIntegrations.push('PayPal');
    }
    if (d.openai) analysis.externalServices.push('OpenAI API');
    if (d['@anthropic-ai/sdk']) analysis.externalServices.push('Anthropic Claude API');
    if (d['@google/genai'] || d['@google/generative-ai']) analysis.externalServices.push('Google Gemini API');
    if (d['@auth/core'] || d['next-auth']) analysis.authentication.push('NextAuth / Auth.js');
    if (d['@clerk/nextjs'] || d['@clerk/clerk-react']) analysis.authentication.push('Clerk Auth');
    if (d.passport) analysis.authentication.push('Passport.js');
    if (d['@aws-sdk/client-s3'] || d['aws-sdk']) analysis.storage.push('AWS S3 Bucket');
    if (d.multer || d.formidable || d.busboy) analysis.storage.push('Local Disk File Uploads');
    if (d.nodemailer) analysis.externalServices.push('Nodemailer SMTP');
    if (d['@sendgrid/mail']) analysis.externalServices.push('SendGrid');
    if (d.resend) analysis.externalServices.push('Resend Mail');
  }

  // 3. PHP / WordPress Detection
  const phpFiles = paths.filter((p) => p.endsWith('.php'));
  if (phpFiles.length > 0) {
    if (!analysis.language.includes('PHP')) analysis.language.push('PHP');
    analysis.backend = true;
    if (phpFiles.some((p) => p.toLowerCase().includes('wp-config') || p.toLowerCase().includes('wp-content'))) {
      analysis.framework = 'WordPress CMS';
      analysis.database = 'MySQL (WordPress DB)';
    } else if (paths.some((p) => p.includes('artisan') || p.includes('app/Http'))) {
      analysis.framework = 'Laravel (PHP)';
      analysis.database = analysis.database || 'MySQL';
    } else if (analysis.framework === 'Unknown') {
      analysis.framework = 'PHP Native Application';
    }
  }

  // 4. Python Detection
  if (paths.some((p) => p.endsWith('.py'))) {
    if (!analysis.language.includes('Python')) analysis.language.push('Python');
    if (analysis.framework === 'Unknown') {
      if (paths.some((p) => p.includes('manage.py'))) analysis.framework = 'Django (Python)';
      else if (paths.some((p) => p.includes('app.py') || p.includes('main.py'))) analysis.framework = 'Flask / FastAPI (Python)';
      else analysis.framework = 'Python Backend';
    }
  }

  // 5. Static HTML Fallback
  if (!pkg && paths.some((p) => p === 'index.html' || p.endsWith('/index.html'))) {
    if (analysis.framework === 'Unknown') analysis.framework = 'Static HTML/CSS/JS';
    analysis.frontend = true;
  }

  // 6. Entry point detection
  if (pkg?.scripts) {
    if (pkg.scripts.start) analysis.entryPoint = `npm start (${pkg.scripts.start})`;
    else if (pkg.scripts.dev) analysis.entryPoint = `npm run dev (${pkg.scripts.dev})`;
  }
  if (!analysis.entryPoint) {
    if (paths.includes('index.html')) analysis.entryPoint = 'index.html';
    else if (phpFiles.length) {
      analysis.entryPoint = phpFiles.find((p) => p.endsWith('index.php')) || phpFiles[0];
    }
  }

  // 7. Build output detection
  for (const dir of ['dist', 'build', 'out', '.next', 'public']) {
    if (paths.some((p) => p === dir || p.startsWith(`${dir}/`))) {
      analysis.hasBuildOutput = true;
      analysis.buildOutputDir = dir;
      break;
    }
  }

  // 8. Deep AST / Regex Code Scanning
  const envSet = new Set<string>();
  const apiSet = new Set<string>();
  const externalSet = new Set<string>(analysis.externalServices);
  const authSet = new Set<string>(analysis.authentication);
  const paySet = new Set<string>(analysis.paymentIntegrations);

  for (const [path, f] of Object.entries(files)) {
    if (!f.content) continue;
    const c = f.content;

    // Environment variables
    const envRe = /(?:process\.env|import\.meta\.env)\.([A-Z_][A-Z0-9_]{2,})|VITE_([A-Z_][A-Z0-9_]{2,})|NEXT_PUBLIC_([A-Z_][A-Z0-9_]{2,})/g;
    let match: RegExpExecArray | null;
    while ((match = envRe.exec(c)) !== null) {
      const v = match[1] || match[2] || match[3];
      if (v && !['NODE_ENV', 'PORT', 'DEV', 'PROD', 'MODE'].includes(v)) {
        envSet.add(v);
      }
    }

    // Localhost hardcoded references
    if (/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(c)) {
      if (!analysis.serverRequirements.some((r) => r.includes(path))) {
        analysis.serverRequirements.push(`Hardcoded localhost origin found in ${path}`);
      }
    }

    // API endpoints in fetch/axios
    const apiRe = /(?:fetch|axios(?:\.get|\.post|\.put|\.delete)?)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    while ((match = apiRe.exec(c)) !== null) {
      const u = match[1];
      if (u && !u.startsWith('.') && !u.startsWith('/') && !u.startsWith('data:')) {
        const domain = u.split('/')[2] || u;
        if (domain && domain.includes('.')) apiSet.add(domain);
      }
    }

    // External services signatures
    if (/supabase\.co|@supabase/.test(c)) externalSet.add('Supabase');
    if (/firebaseapp\.com|firestore|firebase\.google/.test(c)) externalSet.add('Firebase');
    if (/api\.stripe\.com|stripe\.redirectToCheckout/.test(c)) paySet.add('Stripe');
    if (/api\.openai\.com/.test(c)) externalSet.add('OpenAI API');
    if (/api\.anthropic\.com/.test(c)) externalSet.add('Anthropic API');
    if (/generativelanguage\.googleapis\.com/.test(c)) externalSet.add('Google Gemini API');
    if (/resend\.com/.test(c)) externalSet.add('Resend Email');
    if (/cloudinary\.com/.test(c)) externalSet.add('Cloudinary CDN');

    // Routing indicators
    if (/app\/.*page\.(tsx|jsx|js)/.test(path)) analysis.routing = 'Next.js App Router (File-based)';
    if (/pages\/.*(tsx|jsx|js)/.test(path) && !analysis.routing.includes('App Router')) {
      analysis.routing = 'Next.js Pages Router';
    }
    if (/react-router|createBrowserRouter|BrowserRouter|Routes|Route/.test(c)) {
      analysis.routing = 'Client-Side SPA (React Router)';
    }
    if (/vue-router/.test(c)) analysis.routing = 'Client-Side SPA (Vue Router)';
  }

  analysis.environmentVariables = Array.from(envSet);
  analysis.apiDependencies = Array.from(apiSet);
  analysis.externalServices = Array.from(externalSet);
  analysis.authentication = Array.from(authSet);
  analysis.paymentIntegrations = Array.from(paySet);

  // 9. Languages
  if (paths.some((p) => p.endsWith('.ts') || p.endsWith('.tsx'))) analysis.language.push('TypeScript');
  if (paths.some((p) => p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.mjs'))) {
    if (!analysis.language.includes('JavaScript')) analysis.language.push('JavaScript');
  }
  if (paths.some((p) => p.endsWith('.html') || p.endsWith('.htm'))) {
    if (!analysis.language.includes('HTML')) analysis.language.push('HTML');
  }
  if (paths.some((p) => p.endsWith('.css') || p.endsWith('.scss') || p.endsWith('.sass'))) {
    if (!analysis.language.includes('CSS')) analysis.language.push('CSS');
  }

  // 10. Assets
  const assetPaths = paths.filter((p) =>
    /\.(png|jpe?g|gif|webp|svg|ico|woff|woff2|ttf|otf|eot|mp4|webm|mp3|pdf)$/i.test(p)
  );
  analysis.assets.count = assetPaths.length;
  const extSet = new Set<string>();
  assetPaths.forEach((p) => {
    const ext = p.split('.').pop()?.toLowerCase();
    if (ext) extSet.add(ext);
  });
  analysis.assets.types = Array.from(extSet);

  // 11. Compatibility Assessment & Score calculation
  const compat = analysis.compatibility;
  const hasHtaccess = Boolean(files['.htaccess'] || files['public_html/.htaccess']);
  const hasRobots = Boolean(files['robots.txt'] || files['public_html/robots.txt']);
  const hasSitemap = Boolean(files['sitemap.xml'] || files['public_html/sitemap.xml']);
  const hasEnvExample = Boolean(files['.env.example'] || files['app/.env.example']);

  if (hasHtaccess) {
    compat.routing = 'ok';
  }
  if (hasRobots && hasSitemap) {
    compat.assets = 'ok';
  }
  if (hasEnvExample || analysis.environmentVariables.length === 0) {
    compat.env = 'ok';
  }

  if (project.audited) {
    // Project has been audited & auto-fixed by AI Hostinger Tier Engine
    compat.frontend = 'ok';
    compat.build = 'ok';
    compat.assets = 'ok';
    compat.routing = 'ok';
    compat.backend = 'ok';
    compat.database = 'ok';
    compat.env = 'ok';
    compat.apis = 'ok';
    analysis.score = 100;
    return analysis;
  }

  let score = 100;

  if (analysis.backend && !analysis.hasBuildOutput && analysis.framework.includes('Node')) {
    compat.backend = 'warn';
    score -= 15;
  }
  if (analysis.framework === 'Next.js' && !analysis.hasBuildOutput) {
    compat.build = 'warn';
    score -= 12;
  }
  if (analysis.framework.includes('Vite') && !analysis.hasBuildOutput) {
    compat.build = 'warn';
    score -= 8;
  }
  if (analysis.database && !files['HOSTINGER_CONFIG.md']) {
    compat.database = 'warn';
    score -= 10;
  }
  if (analysis.serverRequirements.length > 0) {
    compat.apis = 'warn';
    score -= 8;
  }
  if (analysis.environmentVariables.length > 0 && !hasEnvExample) {
    compat.env = 'warn';
    score -= 5;
  }
  if (analysis.paymentIntegrations.length > 0) {
    compat.apis = 'warn';
    score -= 5;
  }
  if (!analysis.frontend && !analysis.backend) {
    compat.frontend = 'err';
    score -= 30;
  }
  if (project.source === 'url-snapshot' && !hasHtaccess) {
    compat.backend = 'warn';
    compat.database = 'warn';
    compat.env = 'warn';
    score = Math.min(score, 60);
  }

  analysis.score = Math.max(10, Math.min(100, score));

  return analysis;
}
