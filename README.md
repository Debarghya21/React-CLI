# React CLI (`mycli`)

> A Developer CLI for React Applications — inspired by Angular CLI.

## Overview

`mycli` is a command-line interface that provides a standardized, extensible and developer-friendly experience for creating, generating, configuring, testing and building React applications.

## Quick Start

```bash
# Install globally
npm install -g mycli

# Create a new project
mycli new my-app

# Navigate to the project
cd my-app

# Generate components, pages, hooks, services
mycli generate component UserCard
mycli generate page Dashboard
mycli generate hook useAuth
mycli generate service user

# Start the GUI (visual project creator)
mycli gui

# Start development server
mycli serve

# Run tests
mycli test

# Lint code
mycli lint

# Build for production
mycli build
```

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `mycli new <name>` | | Create a new React application |
| `mycli generate component <name>` | `mycli g component <name>` | Generate a component |
| `mycli generate page <name>` | `mycli g page <name>` | Generate a page |
| `mycli generate hook <name>` | `mycli g hook <name>` | Generate a hook |
| `mycli generate service <name>` | `mycli g service <name>` | Generate a service |
| `mycli generate context <name>` | `mycli g context <name>` | Generate a context |
| `mycli generate layout <name>` | `mycli g layout <name>` | Generate a layout |
| `mycli generate type <name>` | `mycli g type <name>` | Generate a type definition |
| `mycli serve` | | Start the development server |
| `mycli build` | | Build for production |
| `mycli test` | | Run tests |
| `mycli lint` | | Lint source code |
| `mycli format` | | Format source code |
| `mycli info` | | Display environment info |
| `mycli version` | | Display CLI version |
| `mycli gui` | | Launch the web-based GUI for project creation |

## Generator Options

```bash
--test / --no-test    Generate or skip test files
--directory, -d       Override the output directory
--force, -f           Overwrite existing files
--dry-run             Preview what would be generated
--skip-export         Skip updating barrel exports
```

## Configuration

Every rcli project includes an `rcli.json` configuration file:

```json
{
  "$schema": "https://rcli.dev/schema.json",
  "project": {
    "name": "my-app",
    "type": "react"
  },
  "generators": {
    "component": {
      "directory": "src/components",
      "test": true,
      "index": true
    },
    "page": {
      "directory": "src/pages"
    }
  },
  "targets": {
    "serve": { "command": "vite" },
    "build": { "command": "vite build" },
    "test": { "command": "vitest" },
    "lint": { "command": "eslint ." },
    "format": { "command": "prettier --write ." }
  }
}
```

## Technology Stack

- **CLI Framework:** [oclif](https://oclif.io)
- **Language:** TypeScript
- **Runtime:** Node.js (>=18)
- **Package Manager:** pnpm
- **Generated Projects:** React + TypeScript + Vite

## Development

```bash
# Clone the repository
git clone <repo-url>
cd ReactCLI

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Link the CLI for local development
cd apps/cli
npm link
```

## Architecture

```
rcli/
├── apps/
│   └── cli/              # Main CLI application (oclif)
├── packages/
│   ├── core/             # Logging, errors, spinner
│   ├── config/           # rcli.json management
│   ├── utils/            # Name normalization, validation, paths
│   ├── filesystem/       # File/directory operations
│   └── process-runner/   # External command execution
├── .github/workflows/    # CI/CD
├── pnpm-workspace.yaml   # Monorepo config
└── vitest.config.ts      # Test configuration
```

## License

MIT
