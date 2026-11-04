# Security Policy

Thank you for helping keep React CLI (`mycli`) and its users safe! 🔒

---

## Supported Versions

| Package              | Version | Supported          |
| -------------------- | ------- | ------------------ |
| `rcli` (CLI app)     | 0.1.0   | ✅ Currently supported |
| `@rcli/core`         | 0.1.0   | ✅ Currently supported |
| `@rcli/config`       | 0.1.0   | ✅ Currently supported |
| `@rcli/filesystem`   | 0.1.0   | ✅ Currently supported |
| `@rcli/generator`    | 0.1.0   | ✅ Currently supported |
| `@rcli/process-runner` | 0.1.0 | ✅ Currently supported |
| `@rcli/utils`        | 0.1.0   | ✅ Currently supported |

> All packages are currently in **pre-release** (`0.x`). Security patches will be applied to the latest version only. As the project matures and stable releases are published, this table will be updated to reflect which versions receive security patches.

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, **please do not open a public GitHub issue.**

Instead, report it privately using one of the following methods:

1. **GitHub Private Vulnerability Reporting:**
   Go to the [Security Advisories](https://github.com/Debarghya21/React-CLI/security/advisories/new) page and submit a new advisory.

2. **Email:**
   Send details to the maintainer directly (include "SECURITY" in the subject line). You can find contact information on the [maintainer's GitHub profile](https://github.com/Debarghya21).

### What to include in your report:

- A clear description of the vulnerability.
- Steps to reproduce the issue.
- The potential impact (e.g., code execution, data exposure, privilege escalation).
- Any suggested fixes or patches (optional but appreciated).

### What to expect:

- **Acknowledgment** within **48 hours** of your report.
- A follow-up with an assessment and timeline within **5 business days**.
- Credit in the release notes (unless you prefer to remain anonymous).

---

## Security Best Practices for Contributors

### 🔑 Authentication & Credentials

- **Never** embed Personal Access Tokens (PATs), passwords, or API keys in git remote URLs, code, or config files.
- Use **SSH keys** or the **GitHub CLI (`gh auth login`)** for authentication.
- If you accidentally commit a secret, **revoke it immediately** and notify the maintainers.

```bash
# ✅ Safe — SSH
git remote set-url origin git@github.com:Debarghya21/React-CLI.git

# ✅ Safe — HTTPS (credentials managed by gh CLI or credential manager)
git remote set-url origin https://github.com/Debarghya21/React-CLI.git

# ❌ NEVER do this — token exposed in plaintext
git remote set-url origin https://username:ghp_xxxx@github.com/Debarghya21/React-CLI.git
```

### 🔒 Secrets & Environment Variables

- Never commit `.env`, `.env.local`, or any files containing secrets (these are already in `.gitignore`).
- Use GitHub Actions secrets (`Settings → Secrets and variables → Actions`) for CI/CD credentials.
- Rotate tokens and credentials periodically.

### 📦 Dependencies

- Only add new dependencies after discussion — [open an issue](https://github.com/Debarghya21/React-CLI/issues/new) first.
- Use `pnpm install --frozen-lockfile` in CI to ensure deterministic, untampered installs.
- Regularly audit dependencies for known vulnerabilities:

```bash
pnpm audit
```

### 🛡️ Code Review

- All changes go through pull requests — direct pushes to `main` are restricted.
- Review PRs for injection vulnerabilities, especially in:
  - Template rendering (EJS in `@rcli/generator`)
  - Process execution (`@rcli/process-runner`)
  - Filesystem operations (`@rcli/filesystem`)
- Be cautious with user-supplied input passed to `child_process`, `fs`, or template engines.

### 🏗️ CI/CD Security

- Never print secrets or tokens in CI logs.
- Pin GitHub Actions to specific commit SHAs or major versions (e.g., `actions/checkout@v4`).
- Use least-privilege permissions for workflow tokens:

```yaml
permissions:
  contents: read
```

---

## Known Security Considerations

### Template Injection

The `@rcli/generator` package uses [EJS](https://ejs.co/) for template rendering. User-provided names (component names, project names, etc.) are passed into templates. The `@rcli/utils` package validates and sanitizes these inputs, but contributors should be mindful of:

- Ensuring all user input is validated before passing to templates.
- Avoiding raw `<%-` (unescaped) EJS tags with untrusted input.

### Process Execution

The `@rcli/process-runner` package executes shell commands (e.g., `npm install`, `vite`, `eslint`). Contributors should:

- Never pass unsanitized user input directly to shell commands.
- Use parameterized arguments instead of string interpolation.
- Prefer `execFile` over `exec` where possible to avoid shell injection.

### Filesystem Operations

The `@rcli/filesystem` package reads and writes files. Contributors should:

- Validate and resolve file paths to prevent path traversal attacks.
- Never write to locations outside the intended project directory.

---

## Disclosure Policy

- We follow [Coordinated Vulnerability Disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure).
- We aim to release a patch within **30 days** of confirming a vulnerability.
- We will publicly disclose the vulnerability after a fix is available, crediting the reporter.

---

## Security Updates

Security patches will be released as part of regular version updates. Watch the [releases page](https://github.com/Debarghya21/React-CLI/releases) and enable GitHub notifications to stay informed.

---

**Thank you for helping keep React CLI secure!** 🙏
If you have any questions about this policy, feel free to [open an issue](https://github.com/Debarghya21/React-CLI/issues).
