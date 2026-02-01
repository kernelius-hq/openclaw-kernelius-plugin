---
name: forge-issue-triager
description: "Triage Kernelius Forge issues automatically. Triggered by issue.created webhooks. Analyze issues, suggest priority/labels, assign to teams, and respond with actionable guidance. Use when receiving new issue notifications from Forge."
metadata:
  {
    "openclaw":
      {
        "emoji": "🏷️",
        "requires": { "channels": ["kernelius"] },
      },
  }
---

# Forge Issue Triager

Automatically triage issues from Kernelius Forge webhooks. Analyze content, determine priority, suggest labels, and respond with helpful guidance.

## Webhook Trigger

This skill activates when you receive an `issue.created` webhook from Forge. The inbound message contains:

- Issue title and body
- Repository context
- Author information
- Conversation target for replies

## Triage Workflow

### 1. Analyze the Issue

Extract key information:
- **Type**: Bug report, feature request, question, documentation
- **Severity**: Critical (production down), high (major functionality), medium (workflow impact), low (minor/cosmetic)
- **Component**: Which part of the system is affected
- **Reproducibility**: Can it be reproduced? Steps provided?

### 2. Determine Priority

| Priority | Criteria |
|----------|----------|
| P0 | Production outage, security vulnerability, data loss |
| P1 | Major feature broken, no workaround |
| P2 | Feature degraded, workaround exists |
| P3 | Minor issue, cosmetic, enhancement |

### 3. Suggest Labels

Common label categories:
- Type: `bug`, `feature`, `question`, `docs`
- Priority: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- Status: `needs-triage`, `needs-info`, `confirmed`, `wontfix`
- Component: `api`, `web`, `mobile`, `database`, `auth`

### 4. Respond to the Issue

Use the channel's messaging to comment on the issue:

```
action: send
to: repo:owner/name:issue:42
message: |
  ## Triage Summary

  **Type:** Bug Report
  **Priority:** P2 (Medium)
  **Component:** Authentication

  ### Analysis
  [Your analysis of the issue]

  ### Suggested Labels
  - `bug`
  - `priority:medium`
  - `auth`

  ### Next Steps
  - [ ] Reproduce the issue
  - [ ] Identify root cause
  - [ ] Propose fix

  ---
  🤖 Auto-triaged by OpenClaw
```

## Response Templates

### Bug Report Response

```markdown
## Triage Summary

**Type:** 🐛 Bug Report
**Priority:** {P0|P1|P2|P3}
**Component:** {component}

### Analysis
{Brief analysis of the bug and its impact}

### Information Needed
{If applicable, what additional info is needed}

### Suggested Labels
- `bug`
- `priority:{level}`
- `{component}`

---
🤖 Auto-triaged by OpenClaw
```

### Feature Request Response

```markdown
## Triage Summary

**Type:** ✨ Feature Request
**Priority:** {P2|P3}

### Analysis
{Brief analysis of the feature request}

### Considerations
- Use case validity
- Implementation complexity
- Alignment with roadmap

### Suggested Labels
- `feature`
- `priority:{level}`
- `needs-discussion`

---
🤖 Auto-triaged by OpenClaw
```

### Question Response

```markdown
## Response

{Direct answer to the question if possible}

### Resources
- [Link to relevant docs]
- [Related issues]

### Suggested Labels
- `question`
- `{topic}`

---
🤖 Answered by OpenClaw
```

## Reactions

Add a reaction to acknowledge you've seen the issue:

```
action: react
messageId: issue:{issue-id}
emoji: eyes
```

After triaging:

```
action: react
messageId: issue:{issue-id}
emoji: +1
```

## Best Practices

1. **Be helpful, not bureaucratic** - Focus on moving the issue forward
2. **Ask clarifying questions** - If info is missing, ask specifically what's needed
3. **Provide context** - Explain why you assigned the priority/labels
4. **Link related issues** - Help identify duplicates or related work
5. **Set expectations** - Give a realistic sense of timeline if known
