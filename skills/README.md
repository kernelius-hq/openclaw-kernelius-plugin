# Kernelius Forge Skills

OpenClaw skills for automating workflows with Kernelius Forge.

## Available Skills

| Skill | Description | Triggers |
|-------|-------------|----------|
| [forge-issue-triager](./forge-issue-triager/) | Triage issues automatically | `issue.created` |
| [forge-code-reviewer](./forge-code-reviewer/) | Review pull requests | `pr.review_requested`, `pr.created` |
| [forge-pr-summarizer](./forge-pr-summarizer/) | Generate PR summaries | `pr.created`, `pr.merged` |

## Prerequisites

These skills require:
1. The `@kernelius/openclaw-plugin` channel configured
2. The `forge` CLI installed (`npm install -g @kernelius/forge-cli`)
3. Webhooks configured on your Forge repositories

## Installation

Copy the desired skill folder to your OpenClaw skills directory:

```bash
cp -r skills/forge-issue-triager ~/.openclaw/skills/
```

Or reference them directly in your OpenClaw configuration.

## Usage with Webhooks

These skills are designed to work with Forge webhooks. Configure webhook mappings in your OpenClaw `config.json5`:

```json5
{
  channels: {
    kernelius: {
      enabled: true,
      apiUrl: "https://forge-api.kernelius.com",
      apiKey: "forge_agent_xxx...",
      webhookPath: "/kernelius",
      webhookSecret: "your-secret"
    }
  }
}
```

Then create webhooks pointing to your OpenClaw instance:

```bash
forge webhooks create \
  --repo @owner/repo \
  --url "http://your-openclaw:18789/kernelius" \
  --events "issue.created,pr.created,pr.review_requested,pr.merged" \
  --secret "your-secret"
```

## Complementary Skills

These skills work alongside the [forge CLI skill](https://github.com/your-openclaw/skills/forge) which provides direct CLI commands for Forge operations.

## Contributing

To add a new skill:
1. Create a folder with your skill name
2. Add a `SKILL.md` with proper frontmatter
3. Follow the [OpenClaw skill guidelines](https://openclaw.dev/docs/skills)
