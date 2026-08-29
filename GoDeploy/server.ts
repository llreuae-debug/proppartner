import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in server environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function isPrivateIpOrHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }
  // Check private IPv4 ranges: 10.x.x.x, 172.16.x.x - 172.31.x.x, 192.168.x.x, 169.254.x.x
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, o1, o2] = ipv4Match.map(Number);
    if (o1 === 10) return true;
    if (o1 === 127) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 169 && o2 === 254) return true;
  }
  return false;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // URL Proxy for snapshot import with SSRF protection
  app.post("/api/proxy-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing url parameter" });
      }

      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return res.status(400).json({ error: "Only http and https protocols are supported" });
      }

      if (isPrivateIpOrHost(parsed.hostname)) {
        return res.status(403).json({ error: "Access to private or local network hosts is restricted." });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GoDeploy-Converter/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Remote server responded with status ${response.status} (${response.statusText})`,
        });
      }

      const text = await response.text();
      res.json({
        success: true,
        url: parsed.toString(),
        contentType: response.headers.get("content-type") || "text/html",
        content: text,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch URL content" });
    }
  });

  // Direct GitHub Repository Import Route
  app.post("/api/github-import", async (req, res) => {
    try {
      const { repoUrl, branch, subpath, token } = req.body;
      if (!repoUrl || typeof repoUrl !== "string") {
        return res.status(400).json({ error: "Missing repository URL" });
      }

      // Parse owner and repo from various url formats
      let owner = "";
      let repo = "";
      let detectedBranch = branch || "";
      let detectedSubpath = subpath || "";

      const cleanInput = repoUrl.trim().replace(/\/$/, "");
      const match = cleanInput.match(/(?:https?:\/\/github\.com\/|^)([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/tree\/([^\/]+)(?:\/(.*))?)?/);
      if (!match) {
        return res.status(400).json({
          error: "Invalid GitHub repository URL format. Please use 'owner/repo' or 'https://github.com/owner/repo'",
        });
      }

      owner = match[1];
      repo = match[2].replace(/\.git$/, "");
      if (match[3] && !detectedBranch) detectedBranch = match[3];
      if (match[4] && !detectedSubpath) detectedSubpath = match[4];

      const headers: Record<string, string> = {
        "User-Agent": "GoDeploy-Hostinger-Converter",
        Accept: "application/vnd.github.v3+json",
      };
      if (token && typeof token === "string" && token.trim()) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
      }

      // 1. Fetch Repository Metadata
      const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoInfoRes.ok) {
        if (repoInfoRes.status === 404) {
          return res.status(404).json({
            error: `GitHub repository '${owner}/${repo}' not found. If this is a private repository, please supply a GitHub Personal Access Token (PAT).`,
          });
        }
        if (repoInfoRes.status === 403) {
          return res.status(403).json({
            error: "GitHub API rate limit reached. Please provide a Personal Access Token or try again in a few minutes.",
          });
        }
        return res.status(repoInfoRes.status).json({
          error: `GitHub API error: ${repoInfoRes.statusText}`,
        });
      }

      const repoInfo = await repoInfoRes.json();
      const targetBranch = detectedBranch || repoInfo.default_branch || "main";

      // 2. Download zipball archive from GitHub
      const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${encodeURIComponent(targetBranch)}`;
      const zipRes = await fetch(zipUrl, {
        headers: {
          ...headers,
          Accept: "application/vnd.github.v3.raw",
        },
        redirect: "follow",
      });

      if (!zipRes.ok) {
        return res.status(zipRes.status).json({
          error: `Failed to download repository archive for branch '${targetBranch}' (${zipRes.statusText})`,
        });
      }

      const arrayBuffer = await zipRes.arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);

      const files: Record<string, { content: string | null; bin?: Uint8Array }> = {};
      let fileCount = 0;

      // GitHub zipball has root directory format 'owner-repo-commitSha/'
      const entries = Object.values(zip.files).filter((f) => !f.dir);
      for (const entry of entries) {
        const rawName = entry.name;
        const slashIdx = rawName.indexOf("/");
        if (slashIdx === -1) continue;
        let pathInRepo = rawName.substring(slashIdx + 1);

        // Subpath filter
        if (detectedSubpath) {
          const cleanSub = detectedSubpath.replace(/^\/+|\/+$/g, "");
          if (!pathInRepo.startsWith(cleanSub + "/") && pathInRepo !== cleanSub) {
            continue;
          }
          pathInRepo = pathInRepo.substring(cleanSub.length).replace(/^\/+/, "");
        }

        if (!pathInRepo || /(__MACOSX|\.DS_Store|node_modules\/|\.git\/)/.test(pathInRepo)) continue;

        const ext = (pathInRepo.split(".").pop() || "").toLowerCase();
        const textExts = [
          "html", "htm", "css", "js", "jsx", "ts", "tsx", "vue", "svelte", "json",
          "md", "txt", "env", "example", "yml", "yaml", "xml", "svg", "htaccess",
          "gitignore", "php", "py", "rb", "sql", "mjs", "cjs", "ini", "sh", "toml",
        ];

        if (textExts.includes(ext)) {
          try {
            const txt = await entry.async("string");
            files[pathInRepo] = { content: txt };
          } catch {
            const bin = await entry.async("uint8array");
            files[pathInRepo] = { content: null, bin };
          }
        } else {
          try {
            const bin = await entry.async("uint8array");
            files[pathInRepo] = { content: null, bin };
          } catch {
            // ignore
          }
        }
        fileCount++;
      }

      if (fileCount === 0) {
        return res.status(400).json({
          error: `No files found in repository '${owner}/${repo}'${detectedSubpath ? ` under subpath '${detectedSubpath}'` : ""}.`,
        });
      }

      res.json({
        success: true,
        repo: {
          owner,
          name: repo,
          fullName: `${owner}/${repo}`,
          description: repoInfo.description || "",
          stars: repoInfo.stargazers_count || 0,
          defaultBranch: repoInfo.default_branch || "main",
          branch: targetBranch,
          avatar: repoInfo.owner?.avatar_url || "",
          isPrivate: repoInfo.private || false,
          subpath: detectedSubpath,
        },
        fileCount,
        files,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to import GitHub repository" });
    }
  });

  // Gemini AI Deep Audit Route
  app.post("/api/ai-audit", async (req, res) => {
    try {
      const { projectSummary } = req.body;
      if (!projectSummary) {
        return res.status(400).json({ error: "Missing project summary" });
      }

      const ai = getGeminiClient();
      const prompt = `You are a senior DevOps and Web Hosting Architect specialized in Hostinger infrastructure (Hostinger Shared Web Hosting with hPanel, Cloud Hosting, Hostinger VPS, and Hostinger Node.js application hosting).

Review the following web project profile and produce actionable, expert deployment guidance for the developer:

Project Details:
- Name: ${projectSummary.name}
- Framework: ${projectSummary.framework}
- Languages: ${projectSummary.language?.join(", ") || "Unknown"}
- Frontend: ${projectSummary.frontend ? "Yes" : "No"}
- Backend: ${projectSummary.backend ? "Yes" : "No"}
- Database: ${projectSummary.database || "None"}
- Build Output: ${projectSummary.hasBuildOutput ? projectSummary.buildOutputDir : "Missing build output"}
- Detected Environment Variables: ${projectSummary.environmentVariables?.join(", ") || "None"}
- External Services: ${projectSummary.externalServices?.join(", ") || "None"}
- Routing: ${projectSummary.routing || "Static"}

Provide a structured JSON response with:
1. "recommendedHostingerPlan": "Shared Web Hosting" | "Cloud Startup" | "Hostinger VPS (Ubuntu / CyberPanel)" | "Node.js Hosting"
2. "hostingerPlanReason": 1-2 sentence explanation
3. "crucialSteps": array of 4-6 concise, sequential deployment steps for Hostinger hPanel
4. "potentialPitfalls": array of 2-4 critical things to watch out for (e.g. Node port binding, database host strings 'localhost' vs remote IP, SPA 404 rewrite rules, PHP version compatibility)
5. "recommendedHtaccessNotes": short tip about .htaccess configuration`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const jsonText = response.text || "{}";
      const parsed = JSON.parse(jsonText);
      res.json({ success: true, audit: parsed });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "AI Audit failed" });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GoDeploy server running on http://localhost:${PORT}`);
  });
}

startServer();
