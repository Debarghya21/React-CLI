# Contributing to React CLI (`mycli`)

First off, **thank you** for considering contributing to React CLI! 🎉
Every contribution — whether it's a bug fix, new feature, documentation improvement, or just a question — helps make this project better for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [License](#license)

---

## Code of Conduct

By participating in this project, you agree to uphold a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and constructive in all interactions.

---

## How Can I Contribute?

### Reporting Bugs

Found a bug? Please [open an issue](https://github.com/Debarghya21/React-CLI/issues/new) and include:

- A clear, descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Your environment details (OS, Node.js version, pnpm version).
- Any relevant logs or screenshots.

### Suggesting Features

Have an idea? [Open a feature request](https://github.com/Debarghya21/React-CLI/issues/new) and describe:

- The problem you're trying to solve.
- Your proposed solution or API.
- Any alternatives you've considered.

### Improving Documentation

Documentation improvements are always welcome — fixing typos, adding examples, improving inline comments, or expanding guides.

### Submitting Code Changes

Ready to write code? Jump to [Getting Started](#getting-started) below.

---

## Getting Started

### Prerequisites

| Tool        | Minimum Version | Check Command    |
| ----------- | --------------- | ---------------- |
| **Node.js** | `>= 18.0.0`    | `node --version` |
| **pnpm**    | `>= 9.0.0`     | `pnpm --version` |
| **Git**     | any recent      | `git --version`  |

> **Note:** This project uses **pnpm** as its package manager. Do not use npm or yarn.

### Development Setup

```bash
# 1. Fork the repository
#    https://github.com/Debarghya21/React-CLI/fork

# 2. Clone your fork
git clone https://github.com/<your-username>/React-CLI.git
cd React-CLI

# 3. Add the upstream remote
git remote add upstream https://github.com/Debarghya21/React-CLI.git

# 4. Install dependencies
pnpm install

# 5. Build all packages
pnpm build

# 6. Run tests to verify everything works
pnpm test
```

### Project Structure

This is a **pnpm monorepo** with the following layout:

```
React-CLI/
├── apps/
│   └── cli/                  # Main CLI application (oclif)
│       ├── src/commands/     # CLI commands (new, generate/*, serve, build…)
│       ├── src/gui/          # Web-based GUI for project creation
│       └── src/helpers/      # Shared command helpers
├── packages/
│   ├── core/                 # Logging, errors, spinner utilities
│   ├── config/               # rcli.json configuration management
│   ├── utils/                # Name normalization, validation, paths
│   ├── filesystem/           # File and directory operations
│   ├── generator/            # Code generation engine
│   └── process-runner/       # External command execution wrapper
├── eslint.config.mjs         # ESLint flat config
├── .prettierrc               # Prettier configuration
├── tsconfig.base.json        # Shared TypeScript compiler options
├── vitest.config.ts          # Vitest test configuration
├── pnpm-workspace.yaml       # Monorepo workspace definition
└── package.json              # Root scripts & devDependencies
```

Each package under `packages/` is published under the `@rcli` scope. The `apps/cli` package consumes them.

---

## Development Workflow

### Branching Strategy

| Type          | Pattern                        | Example                         |
| ------------- | ------------------------------ | ------------------------------- |
| Feature       | `feature/<short-description>`  | `feature/add-store-generator`   |
| Bug fix       | `fix/<short-description>`      | `fix/component-path-resolution` |
| Documentation | `docs/<short-description>`     | `docs/improve-contributing`     |
| Refactor      | `refactor/<short-description>` | `refactor/simplify-config-load` |

```bash
git checkout main
git pull upstream main
git checkout -b feature/my-awesome-feature
```

### Running the CLI Locally

```bash
cd apps/cli
npm link

# Now test anywhere
mycli --version
mycli new test-app
mycli generate component MyComponent
```

### Testing

This project uses **[Vitest](https://vitest.dev/)**.

```bash
pnpm test              # Run all tests once
pnpm test:watch        # Watch mode
```

- Place test files alongside the source or in a `tests/` directory within the package.
- Name test files with the `.test.ts` suffix (e.g., `name.test.ts`).
- Tests run in a **Node.js** environment.
- Focus on edge cases and critical paths.

### Linting & Formatting

```bash
pnpm lint              # Lint all files
pnpm lint:fix          # Lint and auto-fix
pnpm format:check      # Check formatting
pnpm format            # Auto-format all files
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Scopes:** `cli`, `core`, `config`, `utils`, `filesystem`, `generator`, `process-runner`

**Examples:**

```
feat(cli): add store generator command
fix(utils): handle kebab-case names with numbers
docs(readme): add GUI section to quick start
test(config): add tests for rcli.json parsing
chore(deps): bump vitest to v4.2.0
```

---

## Pull Request Process

1. **Rebase on latest `main`:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks before pushing:**
   ```bash
   pnpm build && pnpm test && pnpm lint && pnpm format:check
   ```

3. **Push and open a PR:**
   ```bash
   git push origin feature/my-awesome-feature
   ```

4. **In the PR description, include:**
   - A clear summary of what changed and why.
   - Related issue number(s) (e.g., `Closes #42`).
   - Screenshots if the change is visual (e.g., GUI changes).
   - Any breaking changes or migration notes.

5. Address review feedback promptly. Once approved, a maintainer will merge. 🚀

---

## Coding Standards

### TypeScript

- **Strict mode** is enabled (`strict: true`).
- Target: **ES2022** · Module: **Node16**.
- Avoid `any` where possible (ESLint warns on `@typescript-eslint/no-explicit-any`).
- Prefix unused parameters with `_` (e.g., `_req`).

### Code Style (Prettier)

| Setting         | Value        |
| --------------- | ------------ |
| Semicolons      | ✅ Always     |
| Quotes          | Single (`'`) |
| Trailing Commas | All          |
| Print Width     | 80           |
| Tab Width       | 2 spaces     |
| Arrow Parens    | Always       |
| End of Line     | LF           |

### General Best Practices

- Keep functions small and focused.
- Prefer composition over inheritance.
- Write self-documenting code with clear naming.
- Add JSDoc comments for public APIs and exported functions.
- Avoid introducing new dependencies without discussion — open an issue first.

---

## License

By contributing to React CLI, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

**Thank you for helping make React CLI better!** 💪
If you have questions, feel free to [open an issue](https://github.com/Debarghya21/React-CLI/issues) or start a discussion.
