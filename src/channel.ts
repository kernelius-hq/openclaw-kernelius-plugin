import type {
  ChannelPlugin,
  ChannelConfigAdapter,
} from "openclaw/plugin-sdk";
import {
  getChatChannelMeta,
  DEFAULT_ACCOUNT_ID,
} from "openclaw/plugin-sdk";
import { getKerneliusRuntime } from "./runtime.js";
import type { KerneliusConfig, KerneliusResolvedAccount } from "./types.js";
import {
  handleWebhookRequest,
  resolveKerneliusWebhookPath,
} from "./inbound.js";

const meta = getChatChannelMeta("kernelius");

// Resolve Kernelius account configuration
function resolveKerneliusAccount(cfg: any, accountId?: string): KerneliusResolvedAccount {
  const effectiveAccountId = accountId || DEFAULT_ACCOUNT_ID;
  const channelConfig = cfg.channels?.kernelius || {};

  // Support both top-level config and accounts structure
  const accountConfig = channelConfig.accounts?.[effectiveAccountId] || channelConfig;

  return {
    accountId: effectiveAccountId,
    enabled: accountConfig.enabled !== false,
    apiUrl: accountConfig.apiUrl || "https://forge-api.kernelius.com",
    apiKey: accountConfig.apiKey,
    webhookSecret: accountConfig.webhookSecret,
    webhookPath: accountConfig.webhookPath,
    webhookUrl: accountConfig.webhookUrl,
  };
}

export const kerneliusPlugin: ChannelPlugin = {
  id: "kernelius",
  meta: {
    ...meta,
    name: "Kernelius Forge",
    emoji: "🔥",
    description: "Git platform for human-agent collaboration",
  },
  capabilities: {
    chatTypes: ["direct", "channel", "thread"],
    reactions: true,
    threads: true,
    media: false,
    nativeCommands: false,
  },
  reload: { configPrefixes: ["channels.kernelius"] },
  config: {
    listAccountIds: (cfg) => {
      const channelConfig = cfg.channels?.kernelius;
      if (!channelConfig) return [];
      if (channelConfig.accounts) {
        return Object.keys(channelConfig.accounts);
      }
      return [DEFAULT_ACCOUNT_ID];
    },
    resolveAccount: (cfg, accountId) => resolveKerneliusAccount(cfg, accountId),
    defaultAccountId: () => DEFAULT_ACCOUNT_ID,
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const effectiveAccountId = accountId || DEFAULT_ACCOUNT_ID;
      if (!cfg.channels) cfg.channels = {};
      if (!cfg.channels.kernelius) cfg.channels.kernelius = {};

      if (cfg.channels.kernelius.accounts?.[effectiveAccountId]) {
        cfg.channels.kernelius.accounts[effectiveAccountId].enabled = enabled;
      } else {
        cfg.channels.kernelius.enabled = enabled;
      }
      return cfg;
    },
    deleteAccount: ({ cfg, accountId }) => {
      if (accountId && accountId !== DEFAULT_ACCOUNT_ID) {
        delete cfg.channels?.kernelius?.accounts?.[accountId];
      }
      return cfg;
    },
    isConfigured: (account: any) => Boolean(account.apiKey),
    describeAccount: (account: any) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: Boolean(account.apiKey),
      apiUrl: account.apiUrl,
    }),
    resolveAllowFrom: () => [],
    formatAllowFrom: ({ allowFrom }) => allowFrom,
  },
  messaging: {
    // Send message to Forge (comment on issue/PR)
    send: async (ctx, action) => {
      const runtime = getKerneliusRuntime();
      const account = resolveKerneliusAccount(runtime.config.loadConfig(), action.accountId);

      if (!account.apiKey) {
        throw new Error("Kernelius API key not configured");
      }

      // Parse target: repo:owner/name:issue:42 or repo:owner/name:pr:10
      const target = action.to;
      const match = target.match(/^repo:([^/]+)\/([^:]+):(issue|pr):(\d+)$/);

      if (!match) {
        throw new Error(`Invalid Kernelius target format: ${target}. Expected: repo:owner/name:issue:42 or repo:owner/name:pr:10`);
      }

      const [, owner, repo, type, number] = match;
      const endpoint = type === "issue"
        ? `/api/repositories/${owner}/${repo}/issues/${number}/comments`
        : `/api/pulls/${number}/comments`;

      const response = await fetch(`${account.apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${account.apiKey}`,
        },
        body: JSON.stringify({
          body: action.body,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send message to Kernelius: ${response.status} ${error}`);
      }

      const result = await response.json();

      return {
        messageId: result.id,
        timestamp: new Date(result.createdAt),
      };
    },

    // React to message (not implemented for Forge yet)
    react: async () => {
      throw new Error("Reactions not yet implemented for Kernelius Forge");
    },
  },
  actions: {
    listActions: () => ["send"],
    extractToolSend: ({ args }) => {
      const action = typeof args.action === "string" ? args.action.trim() : "";
      if (action !== "sendMessage") {
        return null;
      }
      const to = typeof args.to === "string" ? args.to : undefined;
      if (!to) {
        return null;
      }
      const accountId = typeof args.accountId === "string" ? args.accountId.trim() : undefined;
      return { to, accountId };
    },
    handleAction: async ({ action, params, cfg, accountId }) => {
      if (action !== "send") {
        throw new Error(`Unknown action: ${action}`);
      }

      const to = typeof params.to === "string" ? params.to : undefined;
      const message = typeof params.message === "string" ? params.message : undefined;

      if (!to || !message) {
        throw new Error("Missing required parameters: to, message");
      }

      const account = resolveKerneliusAccount(cfg, accountId);

      if (!account.apiKey) {
        throw new Error("Kernelius API key not configured");
      }

      // Parse target and send
      const match = to.match(/^repo:([^/]+)\/([^:]+):(issue|pr):(\d+)$/);
      if (!match) {
        throw new Error(`Invalid target format: ${to}`);
      }

      const [, owner, repo, type, number] = match;
      const endpoint = type === "issue"
        ? `/api/repositories/${owner}/${repo}/issues/${number}/comments`
        : `/api/pulls/${number}/comments`;

      const response = await fetch(`${account.apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${account.apiKey}`,
        },
        body: JSON.stringify({ body: message }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send: ${response.status}`);
      }

      return { success: true };
    },
  },
  gateway: {
    start: async (ctx) => {
      const runtime = getKerneliusRuntime();
      const config = runtime.config.loadConfig();
      const account = resolveKerneliusAccount(config, ctx.accountId);

      // Only start gateway if webhook path/url is configured
      if (!account.webhookPath && !account.webhookUrl) {
        console.log("[kernelius] No webhook path configured, skipping gateway start");
        return;
      }

      const webhookPath = resolveKerneliusWebhookPath(
        account.webhookPath,
        account.webhookUrl
      );

      console.log(`[kernelius] Starting gateway for account ${account.accountId} at ${webhookPath}`);

      // Register HTTP handler for webhooks
      ctx.registerHttpHandler({
        path: webhookPath,
        method: "POST",
        handler: async (req, res) => {
          try {
            const inbound = await handleWebhookRequest(req, res, {
              account,
              runtime,
              statusSink: ctx.statusSink,
            });

            if (inbound) {
              // Queue message for agent processing
              await ctx.queueInbound(inbound);
            }
          } catch (error) {
            console.error("[kernelius] Webhook handler error:", error);
            if (!res.headersSent) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Internal server error" }));
            }
          }
        },
      });

      console.log(`[kernelius] Gateway started successfully at ${webhookPath}`);
    },
    stop: async (ctx) => {
      console.log(`[kernelius] Stopping gateway for account ${ctx.accountId}`);
      // Cleanup is handled by OpenClaw when unregistering handlers
    },
  },
};
