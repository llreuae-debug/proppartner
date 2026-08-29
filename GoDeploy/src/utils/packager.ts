import JSZip from 'jszip';
import { AnalysisResult, AppliedFix, BuiltPackageResult, DeploymentMode, EnvVariableConfig, ProjectData } from '../types';

export function autoSelectMode(analysis: AnalysisResult): DeploymentMode {
  if (analysis.backend && analysis.framework.includes('Node')) return 'node';
  if (analysis.framework.includes('PHP') || analysis.framework.includes('WordPress') || analysis.framework.includes('Laravel')) return 'php';
  return 'static';
}

export async function buildHostingerPackage(
  project: ProjectData,
  analysis: AnalysisResult,
  mode: DeploymentMode,
  envVars: EnvVariableConfig[],
  fixes: AppliedFix[]
): Promise<BuiltPackageResult> {
  const zip = new JSZip();
  const files = project.files;
  const effectiveMode = mode === 'auto' ? autoSelectMode(analysis) : mode;

  let prefix = '';
  if (effectiveMode === 'static') {
    prefix = 'public_html/';
  } else if (effectiveMode === 'node') {
    prefix = 'app/';
  } else if (effectiveMode === 'php') {
    prefix = 'public_html/';
  } else if (effectiveMode === 'fullstack') {
    prefix = 'public_html/';
  }

  // 1. Add all project files into target directory
  for (const [filePath, file] of Object.entries(files)) {
    const outPath = `${prefix}${filePath}`;
    if (file.bin) {
      zip.file(outPath, file.bin);
    } else if (file.content !== null && file.content !== undefined) {
      zip.file(outPath, file.content);
    }
  }

  // 2. Add HOSTINGER_DEPLOYMENT.md at root
  const readmeContent = generateHostingerReadme(effectiveMode, analysis, envVars);
  zip.file('HOSTINGER_DEPLOYMENT.md', readmeContent);

  // 3. Add conversion-report.html at root
  const reportHtml = generateConversionReportHtml(project, analysis, fixes, effectiveMode);
  zip.file('conversion-report.html', reportHtml);

  // 4. Add .env.example if env vars exist
  if (envVars.length > 0) {
    const envContent = `# Hostinger Environment Variables Template
# Set these in Hostinger hPanel -> File Manager -> .env or Node.js settings
${envVars.map((v) => `${v.name}=${v.value || ''}`).join('\n')}
`;
    zip.file('.env.example', envContent);
    if (effectiveMode === 'node') {
      zip.file('app/.env.example', envContent);
    }
  }

  // 5. Add Database Migration helper folder if applicable
  if (analysis.database) {
    const dbFolder = zip.folder('database-migration');
    if (dbFolder) {
      dbFolder.file(
        'README.md',
        `# Hostinger Database Setup Guide (${analysis.database})

## Step 1: Create Database in Hostinger hPanel
1. Navigate to **hPanel -> Databases -> Management / MySQL Databases**.
2. Click **Create MySQL Database & User**.
3. Set your Database Name, Username, and strong Password.
4. Note the **MySQL Host** (usually \`localhost\` or \`127.0.0.1\` on Hostinger).

## Step 2: Configure Environment Variables
Update your \`.env\` file on Hostinger:
\`\`\`env
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_dbuser
DB_PASSWORD=your_secure_password
DB_NAME=u123456789_dbname
DATABASE_URL="mysql://u123456789_dbuser:your_secure_password@localhost:3306/u123456789_dbname"
\`\`\`

## Step 3: Run Database Migrations
- If using **Prisma**: Open SSH terminal in hPanel and run \`npx prisma migrate deploy\`.
- If using **PHP / WordPress**: Import SQL dump via **phpMyAdmin** in hPanel.
`
      );
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const packageName = `${sanitizeFilename(project.name || 'website')}-hostinger-ready.zip`;

  return {
    blob,
    name: packageName,
    size: blob.size,
    mode: effectiveMode,
    createdAt: new Date().toISOString(),
  };
}

function sanitizeFilename(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 30);
}

function generateHostingerReadme(mode: DeploymentMode, analysis: AnalysisResult, envVars: EnvVariableConfig[]): string {
  const lines: string[] = [];
  lines.push('# Hostinger Deployment Guide');
  lines.push('Generated automatically by **GoDeploy** — AI Website to Hostinger Converter');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Project Architecture');
  lines.push(`- **Framework:** ${analysis.framework}`);
  lines.push(`- **Languages:** ${analysis.language.join(', ') || 'N/A'}`);
  lines.push(`- **Frontend:** ${analysis.frontend ? 'Yes' : 'No'}`);
  lines.push(`- **Backend:** ${analysis.backend ? 'Yes' : 'No'}`);
  lines.push(`- **Database:** ${analysis.database || 'None detected'}`);
  lines.push(`- **Compatibility Score:** ${analysis.score}% Production Ready`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`## Step-by-Step Deployment Instructions (Mode: ${mode.toUpperCase()})`);
  lines.push('');

  if (mode === 'static') {
    lines.push('### 📦 Static Web Hosting (Hostinger Shared / Cloud)');
    lines.push('1. Log in to your **Hostinger hPanel** account.');
    lines.push('2. Select your hosting plan and click **Manage**.');
    lines.push('3. Navigate to **Files -> File Manager**.');
    lines.push('4. Open the `public_html` directory.');
    lines.push('5. Click **Upload** and upload `website-hostinger-ready.zip`.');
    lines.push('6. Right-click the uploaded zip file and select **Extract**.');
    lines.push('7. Ensure that `index.html` and `.htaccess` reside directly in `public_html`.');
    lines.push('8. Navigate to **Security -> SSL** in hPanel to verify your free Let\'s Encrypt SSL certificate is active.');
    lines.push('9. Visit your domain name in your browser — your application is live!');
  } else if (mode === 'node') {
    lines.push('### ⬢ Node.js Application Hosting');
    lines.push('1. Log in to your **Hostinger hPanel** account.');
    lines.push('2. Navigate to **Advanced -> Node.js** (or use Hostinger Cloud / VPS with Node).');
    lines.push('3. Click **Create Application**:');
    lines.push('   - **Node.js Version:** Select Node 18.x or 20.x');
    lines.push('   - **Application Root:** `/app`');
    lines.push('   - **Application Startup File:** `server.js` or `index.js`');
    lines.push('4. Upload files from the `app/` folder into your application root.');
    lines.push('5. Open the **SSH Terminal** or hPanel terminal.');
    lines.push('6. Run `npm install --omit=dev` to install production dependencies.');
    lines.push('7. Configure environment variables in the Node.js settings or in `.env`.');
    lines.push('8. Click **Start / Restart Application**.');
  } else if (mode === 'php') {
    lines.push('### 🐘 PHP / WordPress Hosting');
    lines.push('1. Log in to **Hostinger hPanel** -> **File Manager**.');
    lines.push('2. Extract files into `public_html`.');
    lines.push('3. Go to **Databases -> MySQL Databases** and create a new database.');
    lines.push('4. Edit `config.php` (or `.env`) with your MySQL host, username, and password.');
    lines.push('5. Open **phpMyAdmin** in hPanel to import any database `.sql` files if needed.');
    lines.push('6. Ensure PHP version is set to 8.2 or 8.3 under **Advanced -> PHP Configuration**.');
  } else if (mode === 'fullstack') {
    lines.push('### ◈ Full-Stack Deployment');
    lines.push('1. Deploy frontend static assets to `public_html/`.');
    lines.push('2. Deploy Node.js server to `app/` via Hostinger Node.js manager.');
    lines.push('3. Connect frontend API calls through relative `/api` reverse proxy or domain endpoint.');
  }

  if (envVars.length > 0) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 🔑 Required Environment Variables');
    lines.push('Create a `.env` file in your root with the following keys:');
    lines.push('```env');
    envVars.forEach((v) => {
      lines.push(`${v.name}=`);
    });
    lines.push('```');
  }

  if (analysis.externalServices.length > 0 || analysis.paymentIntegrations.length > 0) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 🌐 External Services & APIs');
    [...analysis.externalServices, ...analysis.paymentIntegrations].forEach((s) => {
      lines.push(`- **${s}**: Verify authorized domain names / CORS settings in their developer dashboard.`);
    });
  }

  lines.push('');
  lines.push('---');
  lines.push('Generated by GoDeploy • Production-Ready Deployment Converter');
  return lines.join('\n');
}

export function generateConversionReportHtml(
  project: ProjectData,
  analysis: AnalysisResult,
  fixes: AppliedFix[],
  mode: DeploymentMode
): string {
  const fixesHtml = fixes
    .map(
      (f) => `
    <div class="fix-card ${f.type}">
      <div class="fix-header">
        <span class="badge ${f.type}">${f.type.toUpperCase()}</span>
        <span class="fix-category">${f.category.toUpperCase()}</span>
        <span class="fix-title">${escapeHtml(f.msg)}</span>
      </div>
      ${f.detail ? `<div class="fix-detail">${escapeHtml(f.detail)}</div>` : ''}
      ${
        f.diff
          ? `<div class="diff-block">
              <div class="diff-title">${escapeHtml(f.targetFile || 'Code Change')}</div>
              <pre class="diff-code">${escapeHtml(f.diff.after)}</pre>
            </div>`
          : ''
      }
    </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoDeploy Conversion Report — ${escapeHtml(project.name)}</title>
  <style>
    :root {
      --bg: #09090e;
      --card: #12121c;
      --border: rgba(255,255,255,0.08);
      --text: #f0f0f8;
      --text-muted: #9494ad;
      --accent: #5b8cff;
      --success: #3ddc8c;
      --warn: #ffb547;
      --danger: #ff5d6c;
      --mono: 'JetBrains Mono', ui-monospace, monospace;
      --sans: 'Inter', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      font-size: 14px;
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header {
      padding: 30px;
      background: linear-gradient(180deg, #161626 0%, #0d0d16 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .brand-title { font-size: 22px; font-weight: 800; }
    .brand-sub { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
    .score-badge {
      text-align: center;
      background: rgba(91,140,255,0.1);
      border: 1px solid rgba(91,140,255,0.3);
      padding: 16px 24px;
      border-radius: 12px;
    }
    .score-num { font-size: 38px; font-weight: 900; color: var(--accent); }
    .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 20px;
    }
    h2 { font-size: 17px; font-weight: 700; margin-bottom: 16px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
    .prop-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed var(--border);
      font-size: 13px;
    }
    .prop-label { color: var(--text-muted); }
    .prop-val { font-family: var(--mono); font-weight: 600; color: var(--text); }
    .tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-family: var(--mono);
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      margin: 3px;
    }
    .fix-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .fix-card.fix { border-left: 4px solid var(--success); }
    .fix-card.warn { border-left: 4px solid var(--warn); }
    .fix-card.info { border-left: 4px solid var(--accent); }
    .fix-header { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; }
    .badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-family: var(--mono);
    }
    .badge.fix { background: rgba(61,220,140,0.2); color: var(--success); }
    .badge.warn { background: rgba(255,181,71,0.2); color: var(--warn); }
    .badge.info { background: rgba(91,140,255,0.2); color: var(--accent); }
    .fix-category { font-size: 10px; color: var(--text-muted); font-family: var(--mono); }
    .fix-title { flex: 1; }
    .fix-detail { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
    .diff-block {
      margin-top: 10px;
      background: #08080c;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
      font-family: var(--mono);
      font-size: 11px;
      overflow-x: auto;
    }
    .diff-title { font-weight: bold; color: var(--accent); margin-bottom: 4px; }
    .footer { text-align: center; color: var(--text-muted); font-size: 12px; font-family: var(--mono); margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand-title">GoDeploy Conversion Report</div>
        <div class="brand-sub">Project: <strong>${escapeHtml(project.name)}</strong> · Source: ${escapeHtml(
    project.source
  )} · Generated: ${new Date().toLocaleString()}</div>
      </div>
      <div class="score-badge">
        <div class="score-num">${analysis.score}%</div>
        <div class="score-label">Hostinger Ready</div>
      </div>
    </div>

    <div class="card">
      <h2>Project Architecture</h2>
      <div class="grid-2">
        <div>
          <div class="prop-row"><span class="prop-label">Framework</span><span class="prop-val">${escapeHtml(
            analysis.framework
          )}</span></div>
          <div class="prop-row"><span class="prop-label">Languages</span><span class="prop-val">${escapeHtml(
            analysis.language.join(', ') || 'N/A'
          )}</span></div>
          <div class="prop-row"><span class="prop-label">Package Manager</span><span class="prop-val">${escapeHtml(
            analysis.packageManager || 'None'
          )}</span></div>
          <div class="prop-row"><span class="prop-label">Deployment Target</span><span class="prop-val">${escapeHtml(
            mode.toUpperCase()
          )}</span></div>
        </div>
        <div>
          <div class="prop-row"><span class="prop-label">Frontend</span><span class="prop-val">${
            analysis.frontend ? 'Yes' : 'No'
          }</span></div>
          <div class="prop-row"><span class="prop-label">Backend Runtime</span><span class="prop-val">${
            analysis.backend ? 'Yes' : 'No'
          }</span></div>
          <div class="prop-row"><span class="prop-label">Database</span><span class="prop-val">${escapeHtml(
            analysis.database || 'None'
          )}</span></div>
          <div class="prop-row"><span class="prop-label">Total Files</span><span class="prop-val">${
            project.fileCount
          }</span></div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Environment Variables (${analysis.environmentVariables.length})</h2>
      <div>
        ${
          analysis.environmentVariables.length > 0
            ? analysis.environmentVariables.map((v) => `<span class="tag">${escapeHtml(v)}</span>`).join('')
            : '<span style="color:var(--text-muted)">No environment variables detected</span>'
        }
      </div>
    </div>

    <div class="card">
      <h2>Applied Repairs & Audit Findings (${fixes.length})</h2>
      <div>
        ${fixesHtml || '<div style="color:var(--text-muted)">No repairs needed — project is clean.</div>'}
      </div>
    </div>

    <div class="footer">
      Generated by GoDeploy • AI Website to Hostinger Converter
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (match) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[match] || match;
  });
}
