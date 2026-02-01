# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.1]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.2.1
[0.2.0]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.2.0
[0.1.0]: https://github.com/kernelius-hq/openclaw-kernelius-plugin/releases/tag/v0.1.0
