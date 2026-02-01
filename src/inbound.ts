import type { IncomingMessage, ServerResponse } from "node:http";
import type { WebInboundMessage } from "openclaw/plugin-sdk";
import type { ForgeWebhookPayload, KerneliusResolvedAccount } from "./types.js";
import crypto from "node:crypto";

export interface InboundHandlerContext {
  account: KerneliusResolvedAccount;
  runtime: any;
  statusSink?: (patch: { lastInboundAt?: number }) => void;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    return true; // No secret configured, skip verification
  }

  const expectedSignature = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Convert Forge webhook payload to WebInboundMessage
 */
export function forgePayloadToInbound(
  payload: ForgeWebhookPayload,
  accountId: string
): WebInboundMessage | null {
  const { event, repository, sender, issue, pullRequest, comment } = payload;

  // Determine conversation ID and messageId based on event type
  let conversationId: string;
  let body: string;
  let messageId: string | undefined;
  let chatType: "direct" | "group" = "channel";

  if (issue) {
    conversationId = `repo:${repository.fullName}:issue:${issue.number}`;

    if (event === "issue.created") {
      body = `**New Issue #${issue.number}**: ${issue.title}\n\n${issue.body || ""}`;
      messageId = `issue:${issue.id}`;
    } else if (event === "issue.commented" && comment) {
      body = `**Comment on Issue #${issue.number}** by @${sender.username}:\n\n${comment.body}`;
      messageId = `issue_comment:${comment.id}`;
    } else if (event === "issue.closed") {
      body = `**Issue #${issue.number} closed** by @${sender.username}`;
      messageId = `issue:${issue.id}`;
    } else if (event === "issue.reopened") {
      body = `**Issue #${issue.number} reopened** by @${sender.username}`;
      messageId = `issue:${issue.id}`;
    } else if (event === "issue.updated") {
      body = `**Issue #${issue.number} updated** by @${sender.username}: ${issue.title}`;
      messageId = `issue:${issue.id}`;
    } else {
      body = `Issue #${issue.number} event: ${event}`;
      messageId = `issue:${issue.id}`;
    }
  } else if (pullRequest) {
    conversationId = `repo:${repository.fullName}:pr:${pullRequest.number}`;

    if (event === "pr.created") {
      body = `**New Pull Request #${pullRequest.number}**: ${pullRequest.title}\n\n${pullRequest.body || ""}`;
      messageId = `pr:${pullRequest.id}`;
    } else if (event === "pr.review_requested") {
      body = `**Review Requested on PR #${pullRequest.number}**: ${pullRequest.title}\n\nPlease review this pull request.`;
      messageId = `pr:${pullRequest.id}`;
    } else if (event === "pr.reviewed") {
      body = `**PR #${pullRequest.number} reviewed** by @${sender.username}`;
      messageId = `pr:${pullRequest.id}`;
    } else if (event === "pr.merged") {
      body = `**PR #${pullRequest.number} merged** by @${sender.username}`;
      messageId = `pr:${pullRequest.id}`;
    } else if (event === "pr.commented" && comment) {
      body = `**Comment on PR #${pullRequest.number}** by @${sender.username}:\n\n${comment.body}`;
      messageId = `pr_comment:${comment.id}`;
    } else if (event === "pr.closed") {
      body = `**PR #${pullRequest.number} closed** by @${sender.username}`;
      messageId = `pr:${pullRequest.id}`;
    } else if (event === "pr.reopened") {
      body = `**PR #${pullRequest.number} reopened** by @${sender.username}`;
      messageId = `pr:${pullRequest.id}`;
    } else {
      body = `Pull Request #${pullRequest.number} event: ${event}`;
      messageId = `pr:${pullRequest.id}`;
    }
  } else {
    // Repository-level event
    conversationId = `repo:${repository.fullName}`;
    body = `Repository event: ${event}`;
  }

  const timestamp = new Date(payload.timestamp).getTime();

  return {
    id: crypto.randomUUID(),
    from: conversationId,
    conversationId,
    to: accountId,
    accountId,
    body,
    pushName: sender.username,
    timestamp,
    chatType,
    chatId: conversationId,
    senderName: sender.username,
    selfJid: accountId,
    selfE164: null,
    messageId, // For reactions support
    // Helpers (simplified for webhook-based channel)
    sendComposing: async () => {},
    reply: async (text: string) => {
      // Would send back to Forge, but we handle that via messaging adapter
      console.log(`[kernelius] Reply queued: ${text}`);
    },
    sendMedia: async () => {
      throw new Error("Media not supported for Forge webhooks");
    },
  };
}

/**
 * Handle incoming webhook request
 */
export async function handleWebhookRequest(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: InboundHandlerContext
): Promise<WebInboundMessage | null> {
  // Read request body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const rawBody = Buffer.concat(chunks).toString("utf-8");

  // Verify signature if secret is configured
  const signature = req.headers["x-forge-signature"] as string;
  if (ctx.account.webhookSecret) {
    if (!signature) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing X-Forge-Signature header" }));
      return null;
    }

    if (!verifyWebhookSignature(rawBody, signature, ctx.account.webhookSecret)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid signature" }));
      return null;
    }
  }

  // Parse payload
  let payload: ForgeWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid JSON payload" }));
    return null;
  }

  // Verify source is from Forge
  if (payload.source !== "forge") {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid source" }));
    return null;
  }

  // Update status
  ctx.statusSink?.({ lastInboundAt: Date.now() });

  // Convert to WebInboundMessage
  const inbound = forgePayloadToInbound(payload, ctx.account.accountId);

  if (!inbound) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Could not process event" }));
    return null;
  }

  // Respond success
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, event: payload.event }));

  return inbound;
}

/**
 * Resolve webhook path from config
 */
export function resolveKerneliusWebhookPath(
  webhookPath?: string,
  webhookUrl?: string
): string {
  if (webhookPath?.trim()) {
    const path = webhookPath.trim();
    return path.startsWith("/") ? path : `/${path}`;
  }

  if (webhookUrl?.trim()) {
    try {
      const parsed = new URL(webhookUrl);
      return parsed.pathname || "/kernelius";
    } catch {
      return "/kernelius";
    }
  }

  return "/kernelius";
}
