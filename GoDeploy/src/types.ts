export type StepKey = 'import' | 'analyze' | 'repair' | 'build' | 'validate' | 'download';
export type ViewKey = StepKey | 'preview' | 'history';

export interface ProjectFile {
  content: string | null;
  bin?: Uint8Array;
}

export type ProjectFilesMap = Record<string, ProjectFile>;

export interface ProjectData {
  name: string;
  source: 'zip' | 'folder' | 'files' | 'url-snapshot' | 'sample' | 'github';
  files: ProjectFilesMap;
  fileCount: number;
  originUrl?: string;
  githubRepo?: string;
  githubBranch?: string;
  importedAt: string;
  audited?: boolean;
}

export type CompatStatus = 'ok' | 'warn' | 'err';

export interface AnalysisResult {
  framework: string;
  language: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm' | null;
  buildSystem: string | null;
  entryPoint: string | null;
  frontend: boolean;
  backend: boolean;
  database: string | null;
  apiDependencies: string[];
  environmentVariables: string[];
  externalServices: string[];
  authentication: string[];
  paymentIntegrations: string[];
  storage: string[];
  routing: string;
  serverRequirements: string[];
  assets: {
    count: number;
    types: string[];
  };
  routes: string[];
  hasBuildOutput: boolean;
  buildOutputDir: string | null;
  compatibility: {
    frontend: CompatStatus;
    build: CompatStatus;
    assets: CompatStatus;
    routing: CompatStatus;
    backend: CompatStatus;
    database: CompatStatus;
    env: CompatStatus;
    apis: CompatStatus;
  };
  score: number;
}

export interface AppliedFix {
  id: string;
  type: 'fix' | 'warn' | 'info';
  icon: 'check' | 'warn' | 'info';
  category: 'routing' | 'assets' | 'security' | 'env' | 'seo' | 'database' | 'code';
  msg: string;
  detail?: string;
  targetFile?: string;
  diff?: {
    before: string;
    after: string;
  };
}

export type DeploymentMode = 'auto' | 'static' | 'node' | 'php' | 'fullstack';

export interface EnvVariableConfig {
  name: string;
  value: string;
}

export interface ValidationCheck {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  canAutoFix?: boolean;
}

export interface ValidationResult {
  checks: ValidationCheck[];
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
}

export interface BuiltPackageResult {
  blob: Blob;
  name: string;
  size: number;
  mode: DeploymentMode;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  source: string;
  framework: string;
  score: number;
  mode: string;
  fileCount: number;
  date: string;
}

export interface AiAuditResult {
  recommendedHostingerPlan: string;
  hostingerPlanReason: string;
  crucialSteps: string[];
  potentialPitfalls: string[];
  recommendedHtaccessNotes?: string;
}
