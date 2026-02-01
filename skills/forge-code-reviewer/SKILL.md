---
name: forge-code-reviewer
description: "Review pull requests on Kernelius Forge. Triggered by pr.review_requested or pr.created webhooks. Analyze code changes, check for issues, and submit reviews. Use when receiving PR review requests from Forge."
metadata:
  {
    "openclaw":
      {
        "emoji": "🔍",
        "requires": { "channels": ["kernelius"], "bins": ["forge"] },
      },
  }
---

# Forge Code Reviewer

Automatically review pull requests from Kernelius Forge. Analyze diffs, identify issues, and submit constructive reviews.

## Webhook Triggers

- `pr.review_requested` - Someone requested your review
- `pr.created` - New PR opened (if configured to auto-review)

## Review Workflow

### 1. Gather PR Information

Use the forge CLI to get details:

```bash
# View PR details
forge prs view --repo @owner/repo --number 10

# View the diff
forge prs diff --repo @owner/repo --number 10

# List commits
forge prs commits --repo @owner/repo --number 10
```

### 2. Analyze the Changes

Check for:

**Code Quality**
- Clear, readable code
- Appropriate naming conventions
- No unnecessary complexity
- Proper error handling

**Correctness**
- Logic errors
- Edge cases handled
- Type safety
- Null/undefined checks

**Security**
- Input validation
- SQL injection risks
- XSS vulnerabilities
- Sensitive data exposure
- Authentication/authorization

**Performance**
- Unnecessary loops/iterations
- N+1 query patterns
- Memory leaks
- Blocking operations

**Tests**
- Test coverage for new code
- Edge cases tested
- Tests are meaningful

**Documentation**
- Comments for complex logic
- API documentation updated
- README updated if needed

### 3. Submit Review

Use the forge CLI to submit:

```bash
# Approve
forge prs review --repo @owner/repo --number 10 \
  --state approve \
  --body "LGTM! Code looks good."

# Request changes
forge prs review --repo @owner/repo --number 10 \
  --state request_changes \
  --body "Please address the issues below."

# Comment only
forge prs review --repo @owner/repo --number 10 \
  --state comment \
  --body "Some observations..."
```

Or comment via the channel:

```
action: send
to: repo:owner/name:pr:10
message: |
  ## Code Review

  ### Summary
  {Overall assessment}

  ### Issues Found
  {List of issues}

  ### Suggestions
  {Improvements}
```

## Review Templates

### Approval

```markdown
## ✅ Code Review: Approved

### Summary
Clean implementation of {feature}. Code is well-structured and follows project conventions.

### Highlights
- Good error handling in {file}
- Clear separation of concerns
- Tests cover the main scenarios

### Minor Suggestions (non-blocking)
- Consider extracting {function} for reusability
- Could add a comment explaining {complex logic}

---
🤖 Reviewed by OpenClaw
```

### Request Changes

```markdown
## 🔄 Code Review: Changes Requested

### Summary
Good progress on {feature}, but some issues need addressing before merge.

### Required Changes

#### 1. {Issue Title}
**File:** `{path/to/file.ts}`
**Line:** {line number}

{Description of the issue and why it matters}

**Suggested fix:**
```{language}
{code suggestion}
```

#### 2. {Issue Title}
...

### Questions
- {Any clarifying questions}

---
🤖 Reviewed by OpenClaw
```

### Comment Only

```markdown
## 💬 Code Review Notes

### Observations
{General observations about the PR}

### Questions
- {Questions about approach or implementation}

### Suggestions
- {Non-blocking suggestions}

I'll wait for clarification before making a final decision.

---
🤖 Reviewed by OpenClaw
```

## Common Issues to Flag

### Security
- `// TODO: validate input` - Flag incomplete validation
- Hardcoded credentials or secrets
- SQL string concatenation
- `dangerouslySetInnerHTML` without sanitization
- Missing authentication checks

### Performance
- `await` inside loops (could be `Promise.all`)
- Fetching all records without pagination
- Missing database indexes for queried fields
- Synchronous file operations

### Code Quality
- Functions over 50 lines
- Deeply nested conditionals (>3 levels)
- Magic numbers without constants
- Inconsistent error handling
- Dead code or unused imports

## Reactions

Acknowledge the review request:
```
action: react
messageId: pr:{pr-id}
emoji: eyes
```

After reviewing:
```
action: react
messageId: pr:{pr-id}
emoji: +1  # or -1 if changes needed
```

## Best Practices

1. **Be constructive** - Explain *why*, not just *what*
2. **Prioritize feedback** - Distinguish blocking vs nice-to-have
3. **Provide examples** - Show the suggested fix when possible
4. **Acknowledge good work** - Mention things done well
5. **Ask questions** - If unsure, ask rather than assume
6. **Be timely** - Review promptly to unblock the author
