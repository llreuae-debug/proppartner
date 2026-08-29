import { ProjectData } from '../types';

export function getSampleProjects(): { id: string; title: string; desc: string; framework: string; icon: string; getProject: () => ProjectData }[] {
  return [
    {
      id: 'vite-saas',
      title: 'AI SaaS Dashboard',
      desc: 'Vite + React 18 SPA with React Router, Supabase Auth, Stripe checkout, and environment variables.',
      framework: 'Vite + React',
      icon: '⚡',
      getProject: createViteSaasProject,
    },
    {
      id: 'next-portal',
      title: 'Fullstack Next.js App',
      desc: 'Next.js App Router with Prisma ORM database, NextAuth authentication, and Gemini AI integration.',
      framework: 'Next.js + Node',
      icon: '▲',
      getProject: createNextPortalProject,
    },
    {
      id: 'php-blog',
      title: 'PHP & MySQL Blog',
      desc: 'Native PHP application with PDO database connection, contact API, and dynamic templates.',
      framework: 'PHP / MySQL',
      icon: '🐘',
      getProject: createPhpBlogProject,
    },
    {
      id: 'static-portfolio',
      title: 'Modern Static Website',
      desc: 'High-performance HTML5, CSS custom properties, responsive grid layout, and interactive JS.',
      framework: 'Static HTML/CSS/JS',
      icon: '✨',
      getProject: createStaticPortfolioProject,
    },
  ];
}

function createViteSaasProject(): ProjectData {
  const files = {
    'package.json': {
      content: JSON.stringify(
        {
          name: 'aurora-ai-saas',
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            'react-router-dom': '^6.26.0',
            '@supabase/supabase-js': '^2.45.0',
            stripe: '^16.8.0',
            'lucide-react': '^0.436.0',
          },
          devDependencies: {
            vite: '^5.4.2',
            '@vitejs/plugin-react': '^4.3.1',
            tailwindcss: '^3.4.10',
          },
        },
        null,
        2
      ),
    },
    'index.html': {
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aurora AI — Next-Gen Intelligence</title>
  </head>
  <body>
    <div id="root">
      <div style="font-family:system-ui,sans-serif;background:#090910;color:#fff;min-height:100vh;padding:40px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
        <div style="width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#5b8cff,#7c5cff);display:grid;place-items:center;font-weight:bold;font-size:20px;margin-bottom:20px;">A</div>
        <h1 style="font-size:36px;font-weight:800;letter-spacing:-1px;margin-bottom:12px;">Aurora AI Platform</h1>
        <p style="color:#9da4b8;max-width:520px;font-size:16px;line-height:1.6;margin-bottom:24px;">Transform unstructured workflows into real-time collaborative knowledge.</p>
        <div style="display:flex;gap:12px;">
          <a href="#demo" style="background:#5b8cff;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;">Get Started Free</a>
          <a href="#docs" style="background:rgba(255,255,255,0.08);color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;">View Documentation</a>
        </div>
      </div>
    </div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
    },
    'src/main.jsx': {
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)`,
    },
    'src/App.jsx': {
      content: `import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

// Localhost API reference (will be detected and repaired by fix engine)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLIC_KEY

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="p-4 border-b border-slate-800 flex justify-between">
        <Link to="/" className="font-bold text-lg">Aurora AI</Link>
        <div className="space-x-4">
          <Link to="/" className="text-slate-400 hover:text-white">Home</Link>
          <Link to="/pricing" className="text-slate-400 hover:text-white">Pricing</Link>
          <Link to="/dashboard" className="text-slate-400 hover:text-white">Dashboard</Link>
        </div>
      </nav>
      <main className="p-8 max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome to Aurora AI</h1>
      <p className="mt-2 text-slate-400">Powered by next-generation neural agents.</p>
    </div>
  )
}

function Pricing() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
      <p className="mt-2 text-slate-400">$29/month per workspace member.</p>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics & Workspaces</h1>
      <p className="mt-2 text-slate-400">Manage real-time models and integrations.</p>
    </div>
  )
}`,
    },
    'src/index.css': {
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #020617;
  color: #f8fafc;
}`,
    },
    'vite.config.js': {
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})`,
    },
  };

  return {
    name: 'aurora-ai-saas',
    source: 'sample',
    files,
    fileCount: Object.keys(files).length,
    importedAt: new Date().toISOString(),
  };
}

function createNextPortalProject(): ProjectData {
  const files = {
    'package.json': {
      content: JSON.stringify(
        {
          name: 'nexus-workspace-portal',
          private: true,
          version: '0.1.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '14.2.5',
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            '@prisma/client': '^5.18.0',
            'next-auth': '^4.24.7',
            '@google/genai': '^2.4.0',
            dotenv: '^16.4.5',
          },
          devDependencies: {
            prisma: '^5.18.0',
            typescript: '^5.5.4',
            '@types/node': '^20.14.10',
            '@types/react': '^18.3.3',
          },
        },
        null,
        2
      ),
    },
    'app/layout.tsx': {
      content: `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nexus Portal',
  description: 'Enterprise Intelligence Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
    },
    'app/page.tsx': {
      content: `export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">Nexus Enterprise Portal</h1>
      <p className="text-gray-400 mt-2">Connected to PostgreSQL Database via Prisma ORM.</p>
    </main>
  )
}`,
    },
    'app/api/generate/route.ts': {
      content: `import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const apiKey = process.env.GEMINI_API_KEY
  return NextResponse.json({ success: true, message: 'Processed prompt', timestamp: Date.now() })
}`,
    },
    'prisma/schema.prisma': {
      content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
    },
  };

  return {
    name: 'nexus-workspace-portal',
    source: 'sample',
    files,
    fileCount: Object.keys(files).length,
    importedAt: new Date().toISOString(),
  };
}

function createPhpBlogProject(): ProjectData {
  const files = {
    'index.php': {
      content: `<?php
require_once 'config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veritas Insights — Tech & Design Journal</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <header class="header">
    <div class="logo">Veritas.</div>
    <nav>
      <a href="index.php">Home</a>
      <a href="about.php">About</a>
      <a href="contact.php">Contact</a>
    </nav>
  </header>
  <main class="container">
    <h1>Latest Publications</h1>
    <p class="subtitle">Curated perspectives on systems architecture and aesthetic engineering.</p>
    <article class="post-card">
      <h2>Deploying Modern Web Stacks to Hostinger Cloud</h2>
      <div class="meta">Published August 2026 • 6 min read</div>
      <p>A comprehensive guide on leveraging Hostinger hPanel, MySQL databases, and automated PHP routing.</p>
    </article>
  </main>
</body>
</html>`,
    },
    'config.php': {
      content: `<?php
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_NAME', getenv('DB_NAME') ?: 'veritas_db');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Graceful fallback for preview
    $db_connected = false;
}
?>`,
    },
    'assets/style.css': {
      content: `body {
  font-family: -apple-system, system-ui, sans-serif;
  background: #0f0f14;
  color: #e5e5f0;
  margin: 0;
  padding: 0;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo { font-size: 20px; font-weight: bold; color: #5b8cff; }
.container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
.post-card {
  background: #171722;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}`,
    },
  };

  return {
    name: 'veritas-php-journal',
    source: 'sample',
    files,
    fileCount: Object.keys(files).length,
    importedAt: new Date().toISOString(),
  };
}

function createStaticPortfolioProject(): ProjectData {
  const files = {
    'index.html': {
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elena Rostova — Architectural Designer</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hero">
    <div class="badge">Architecture & Spatial Systems</div>
    <h1>Designing resilient digital & physical environments.</h1>
    <p>Senior creative technologist focusing on computational form and high-load web architectures.</p>
    <div class="cta-row">
      <a href="#works" class="btn btn-primary">Explore Selected Works</a>
      <a href="#contact" class="btn btn-secondary">Get in Touch</a>
    </div>
  </div>
</body>
</html>`,
    },
    'style.css': {
      content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #09090d;
  color: #efeff8;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}
.hero {
  max-width: 680px;
  text-align: center;
}
.badge {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #7c5cff;
  background: rgba(124,92,255,0.12);
  border: 1px solid rgba(124,92,255,0.25);
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
}
h1 {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.25;
  margin-bottom: 16px;
}
p {
  color: #9090a8;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 28px;
}
.cta-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.btn {
  padding: 12px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s;
}
.btn-primary { background: #5b8cff; color: #fff; }
.btn-secondary { background: rgba(255,255,255,0.06); color: #efeff8; border: 1px solid rgba(255,255,255,0.12); }`,
    },
  };

  return {
    name: 'elena-architectural-portfolio',
    source: 'sample',
    files,
    fileCount: Object.keys(files).length,
    importedAt: new Date().toISOString(),
  };
}
