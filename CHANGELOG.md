# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-02-01

### Added
- Comprehensive Getting Started guide for the full integration
- Docs folder included in npm package

## [0.3.0] - 2026-02-01

### Added
- Bundled OpenClaw skills for Forge workflows:
  - `forge-issue-triager` - Auto-triage incoming issues
  - `forge-code-reviewer` - Review pull requests
  - `forge-pr-summarizer` - Generate PR summaries
- Skills directory included in npm package

### Changed
- Updated README with skills documentation

## [0.2.4] - 2026-02-01

### Changed
- Updated README with reactions documentation and examples
- Added `pr.reopened` to webhook events table

## [0.2.3] - 2026-02-01

### Fixed
- TypeScript type errors in messaging.send and inbound handler
- chatType now correctly uses "group" instead of invalid "channel"

## [0.2.2] - 2026-02-01

### Added
- Reactions support for issues, PRs, and comments
  - New `react` action available via actions system
  - Valid emojis: +1, -1, laugh, hooray, confused, heart, rocket, eyes
  - messageId format: `issue:<id>`, `pr:<id>`, `issue_comment:<id>`, `pr_comment:<id>`
- Inbound messages now include `messageId` for reaction targeting
- Support for `pr.closed` and `pr.reopened` webhook events

## [0.2.1] - 2026-02-01

### Fixed
- PR comments endpoint now uses repo-scoped path (`/api/repositories/:owner/:name/pulls/:number/comments`) instead of ID-based path that required internal PR ID

## [0.2.0] - 2026-02-01

### Added
- Gateway mode for persistent sessions (Option 2)
- Inbound webhook handler with HMAC-SHA256 signature verification
- Gateway adapter for stateful conversations per issue/PR
- `webhookPath` and `webhookUrl` configuration options
- ForgeWebhookPayload to WebInboundMessage conversion
- Comprehensive documentation for both integration modes

### Changed
- README now documents both Option 1 (simple) and Option 2 (gateway) modes
- Types extended to support gateway configuration

## [0.1.0] - 2026-02-01

### Added
- Initial release of Kernelius OpenClaw plugin
- Channel plugin for Kernelius Forge integration
- Support for sending messages to issues and pull requests
- Webhook event handling for real-time notifications
- Configuration support for API key and webhook secrets
- Target format: `repo:owner/name:issue:42` and `repo:owner/name:pr:10`
- Support for all Forge webhook events (issue.*, pr.*)
- Documentation and examples

[0.3.1]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.3.1
[0.3.0]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.3.0
[0.2.4]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.2.4
[0.2.3]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.2.3
[0.2.2]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.2.2
[0.2.1]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.2.1
[0.2.0]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.2.0
[0.1.0]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.1.0
