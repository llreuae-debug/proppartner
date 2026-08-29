import { ProjectData, ProjectFilesMap } from '../types';

export interface GitHubRepoDetails {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  defaultBranch: string;
  branch: string;
  avatar: string;
  isPrivate: boolean;
  subpath?: string;
}

export interface GitHubImportResult {
  project: ProjectData;
  details: GitHubRepoDetails;
}

export interface GitHubQuickTemplate {
  name: string;
  repo: string;
  branch: string;
  subpath?: string;
  desc: string;
  category: string;
  stars: string;
}

export const POPULAR_GITHUB_STARTERS: GitHubQuickTemplate[] = [
  {
    name: 'Vite React + Tailwind',
    repo: 'vitejs/vite',
    branch: 'main',
    subpath: 'packages/create-vite/template-react-ts',
    desc: 'Ultra-fast React + TypeScript starter for client-side web applications',
    category: 'React / Vite',
    stars: '69k',
  },
  {
    name: 'Next.js Static Export App',
    repo: 'vercel/next.js',
    branch: 'canary',
    subpath: 'examples/with-tailwindcss',
    desc: 'Static-ready Next.js layout optimized for Hostinger static hosting',
    category: 'Next.js',
    stars: '128k',
  },
  {
    name: 'Vue 3 + Vite Starter',
    repo: 'vuejs/create-vue',
    branch: 'main',
    subpath: 'template/base',
    desc: 'Lightweight modern Vue 3 composition app ready for hPanel deployment',
    category: 'Vue.js',
    stars: '4.8k',
  },
  {
    name: 'Vanilla HTML5 + JS Showcase',
    repo: 'h5bp/html5-boilerplate',
    branch: 'main',
    subpath: 'dist',
    desc: 'Production-ready HTML5 Boilerplate with modern web standards',
    category: 'Static HTML',
    stars: '55k',
  },
];

export async function fetchGitHubRepo(
  repoInput: string,
  options?: {
    branch?: string;
    subpath?: string;
    token?: string;
    onProgress?: (step: string) => void;
  }
): Promise<GitHubImportResult> {
  const { branch = '', subpath = '', token = '', onProgress } = options || {};

  onProgress?.('Resolving repository information...');

  // Try Server API first
  try {
    const res = await fetch('/api/github-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoUrl: repoInput,
        branch,
        subpath,
        token,
      }),
    });

    if (res.ok) {
      onProgress?.('Extracting file tree and structure...');
      const data = await res.json();
      if (data.success && data.files) {
        return {
          details: data.repo,
          project: {
            name: data.repo.name || 'github-project',
            source: 'github',
            githubRepo: data.repo.fullName,
            githubBranch: data.repo.branch,
            originUrl: `https://github.com/${data.repo.fullName}`,
            files: data.files,
            fileCount: data.fileCount || Object.keys(data.files).length,
            importedAt: new Date().toISOString(),
          },
        };
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) {
        throw new Error(errData.error);
      }
    }
  } catch (serverErr: any) {
    // If backend route gave explicit error (e.g. 404 or rate limit), rethrow it
    if (serverErr.message && !serverErr.message.includes('fetch')) {
      throw serverErr;
    }
  }

  // Client-side fallback fetching
  onProgress?.('Connecting directly to GitHub API...');

  const cleanInput = repoInput.trim().replace(/\/$/, '');
  const match = cleanInput.match(/(?:https?:\/\/github\.com\/|^)([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/tree\/([^\/]+)(?:\/(.*))?)?/);
  if (!match) {
    throw new Error("Invalid GitHub repository format. Use 'owner/repo' or 'https://github.com/owner/repo'");
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');
  const targetBranch = branch || match[3] || 'main';
  const targetSubpath = subpath || match[4] || '';

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 1. Fetch metadata
  const infoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!infoRes.ok) {
    if (infoRes.status === 404) {
      throw new Error(`Repository '${owner}/${repo}' not found. For private repositories, please provide a Personal Access Token (PAT).`);
    }
    if (infoRes.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please provide a Personal Access Token or wait a few minutes.');
    }
    throw new Error(`GitHub error: ${infoRes.statusText}`);
  }
  const info = await infoRes.json();
  const selectedBranch = branch || match[3] || info.default_branch || 'main';

  // 2. Fetch Zipball
  onProgress?.(`Downloading ${owner}/${repo} archive (${selectedBranch})...`);
  const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${encodeURIComponent(selectedBranch)}`;
  const zipRes = await fetch(zipUrl, {
    headers: { ...headers, Accept: 'application/vnd.github.v3.raw' },
  });

  if (!zipRes.ok) {
    throw new Error(`Failed to download repository zipball: ${zipRes.statusText}`);
  }

  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await zipRes.arrayBuffer();
  onProgress?.('Decompressing and parsing project files...');
  const zip = await JSZip.loadAsync(arrayBuffer);

  const files: ProjectFilesMap = {};
  let fileCount = 0;

  const entries = Object.values(zip.files).filter((f) => !f.dir);
  for (const entry of entries) {
    const rawName = entry.name;
    const slashIdx = rawName.indexOf('/');
    if (slashIdx === -1) continue;
    let pathInRepo = rawName.substring(slashIdx + 1);

    if (targetSubpath) {
      const cleanSub = targetSubpath.replace(/^\/+|\/+$/g, '');
      if (!pathInRepo.startsWith(cleanSub + '/') && pathInRepo !== cleanSub) {
        continue;
      }
      pathInRepo = pathInRepo.substring(cleanSub.length).replace(/^\/+/, '');
    }

    if (!pathInRepo || /(__MACOSX|\.DS_Store|node_modules\/|\.git\/)/.test(pathInRepo)) continue;

    const ext = (pathInRepo.split('.').pop() || '').toLowerCase();
    const textExts = [
      'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'json',
      'md', 'txt', 'env', 'example', 'yml', 'yaml', 'xml', 'svg', 'htaccess',
      'gitignore', 'php', 'py', 'rb', 'sql', 'mjs', 'cjs', 'ini', 'sh', 'toml',
    ];

    if (textExts.includes(ext)) {
      try {
        const txt = await entry.async('string');
        files[pathInRepo] = { content: txt };
      } catch {
        const bin = await entry.async('uint8array');
        files[pathInRepo] = { content: null, bin };
      }
    } else {
      try {
        const bin = await entry.async('uint8array');
        files[pathInRepo] = { content: null, bin };
      } catch {
        // ignore
      }
    }
    fileCount++;
  }

  if (fileCount === 0) {
    throw new Error(`No compatible source files found in repository '${owner}/${repo}'.`);
  }

  return {
    details: {
      owner,
      name: repo,
      fullName: `${owner}/${repo}`,
      description: info.description || '',
      stars: info.stargazers_count || 0,
      defaultBranch: info.default_branch || 'main',
      branch: selectedBranch,
      avatar: info.owner?.avatar_url || '',
      isPrivate: info.private || false,
      subpath: targetSubpath,
    },
    project: {
      name: repo,
      source: 'github',
      githubRepo: `${owner}/${repo}`,
      githubBranch: selectedBranch,
      originUrl: `https://github.com/${owner}/${repo}`,
      files,
      fileCount,
      importedAt: new Date().toISOString(),
    },
  };
}
