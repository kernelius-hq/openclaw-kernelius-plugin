export interface KerneliusConfig {
  enabled?: boolean;
  apiUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
  accounts?: Record<string, KerneliusAccountConfig>;
}

export interface KerneliusAccountConfig {
  enabled?: boolean;
  apiUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
}

export interface KerneliusResolvedAccount {
  accountId: string;
  enabled: boolean;
  apiUrl: string;
  apiKey?: string;
  webhookSecret?: string;
}

// Forge webhook payload types
export interface ForgeWebhookPayload {
  source: "forge";
  event: string;
  timestamp: string;
  repository: {
    id: string;
    name: string;
    fullName: string;
    visibility: string;
  };
  sender: {
    id: string;
    username: string;
  };
  issue?: {
    id: string;
    number: number;
    title: string;
    body?: string;
    state?: string;
  };
  pullRequest?: {
    id: string;
    number: number;
    title: string;
    body?: string;
    headBranch?: string;
    baseBranch?: string;
  };
  comment?: {
    id: string;
    body: string;
  };
  [key: string]: unknown;
}
