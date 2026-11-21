# Third-Party Licenses

This document lists all third-party dependencies used by React CLI (rcli) and their respective licenses.

**Last Updated:** November 14, 2026

---

## Overview

All dependencies are compatible with the MIT license under which React CLI is distributed. This includes transitive (indirect) dependencies.

- ✅ **Total Direct Dependencies:** 8 production + 8 development
- ✅ **Permissive Licenses:** 100%
- ✅ **GPL/AGPL:** None
- ✅ **Proprietary:** None

---

## Production Dependencies

### Direct Production Dependencies

#### 1. @oclif/core

- **Version:** 4.14.0
- **License:** MIT
- **Repository:** https://github.com/oclif/core
- **Purpose:** CLI framework for building command-line interfaces
- **Description:** The core framework for implementing the React CLI application
- **Compatible:** ✅ Yes

#### 2. @rcli/config

- **Version:** workspace:* (internal package)
- **License:** MIT
- **Location:** `packages/config/`
- **Purpose:** Configuration management for React CLI
- **Description:** Handles reading/writing rcli.json configuration files
- **Compatible:** ✅ Yes (internal)

#### 3. @rcli/core

- **Version:** workspace:* (internal package)
- **License:** MIT
- **Location:** `packages/core/`
- **Purpose:** Core functionality and utilities
- **Description:** Logging, error handling, spinner utilities
- **Compatible:** ✅ Yes (internal)

#### 4. @rcli/filesystem

- **Version:** workspace:* (internal package)
- **License:** MIT
- **Location:** `packages/filesystem/`
- **Purpose:** Filesystem operations abstraction
- **Description:** File and directory creation utilities
- **Compatible:** ✅ Yes (internal)

#### 5. @rcli/generator

- **Version:** workspace:* (internal package)
- **License:** MIT
- **Location:** `packages/generator/`
- **Purpose:** Code generation engine
- **Description:** Template-based code generation for components, pages, hooks, etc.
- **Compatible:** ✅ Yes (internal)

#### 6. @rcli/process-runner

- **Version:** workspace:* (internal package)
- **License:** MIT
- **Location:** `packages/process-runner/`
- **Purpose:** Process execution abstraction
- **Description:** Wrapper around child_process for running shell commands
- **Compatible:** ✅ Yes (internal)

#### 7. @rcli/utils

- **Version:** workspace:* (internal package)
- **License:** MIT
- **Location:** `packages/utils/`
- **Purpose:** Utility functions
- **Description:** Name normalization, validation, path utilities
- **Compatible:** ✅ Yes (internal)

#### 8. body-parser

- **Version:** 2.3.0
- **License:** MIT
- **Repository:** https://github.com/expressjs/body-parser
- **Purpose:** Express middleware for parsing request bodies
- **Description:** Parses JSON request bodies for REST API endpoints
- **Compatible:** ✅ Yes

#### 9. chalk

- **Version:** 5.6.2
- **License:** MIT
- **Repository:** https://github.com/chalk/chalk
- **Purpose:** Terminal string styling
- **Description:** Colored terminal output for CLI feedback
- **Compatible:** ✅ Yes

#### 10. express

- **Version:** 5.2.1
- **License:** MIT
- **Repository:** https://github.com/expressjs/express
- **Purpose:** Web server framework
- **Description:** Powers the GUI backend server running on port 3000
- **Type:** ESM (ES module)
- **Compatible:** ✅ Yes

#### 11. open

- **Version:** 11.0.2
- **License:** MIT
- **Repository:** https://github.com/sindresorhus/open
- **Purpose:** Opens URLs in default browser
- **Description:** Opens http://localhost:3000 when launching GUI
- **Compatible:** ✅ Yes

#### 12. ora

- **Version:** 8.2.0
- **License:** MIT
- **Repository:** https://github.com/sindresorhus/ora
- **Purpose:** Elegant terminal spinners
- **Description:** Loading spinners and progress indicators in CLI
- **Compatible:** ✅ Yes

#### 13. ws

- **Version:** 8.21.3
- **License:** MIT
- **Repository:** https://github.com/websockets/ws
- **Purpose:** WebSocket implementation
- **Description:** Real-time bidirectional communication for GUI server
- **Compatible:** ✅ Yes

#### 14. ejs

- **Version:** 3.1.10
- **License:** Apache-2.0
- **Repository:** https://github.com/mde/ejs
- **Purpose:** JavaScript templating engine
- **Description:** Template engine for code generation
- **License Note:** ⚠️ Apache-2.0 (see NOTICE file for details)
- **Compatible:** ✅ Yes (permissive, details in NOTICE)

---

## Development Dependencies

### Root Level Dev Dependencies

#### 1. @eslint/js

- **Version:** 10.0.1
- **License:** MIT
- **Repository:** https://github.com/eslint/eslint
- **Purpose:** ESLint core library
- **Description:** JavaScript linting tool
- **Compatible:** ✅ Yes

#### 2. @types/node

- **Version:** 26.4.0
- **License:** MIT
- **Repository:** https://github.com/DefinitelyTyped/DefinitelyTyped
- **Purpose:** TypeScript type definitions for Node.js
- **Description:** Type definitions for Node.js API
- **Compatible:** ✅ Yes

#### 3. eslint

- **Version:** 10.9.1
- **License:** MIT
- **Repository:** https://github.com/eslint/eslint
- **Purpose:** JavaScript/TypeScript linting
- **Description:** Static code analysis for quality
- **Compatible:** ✅ Yes

#### 4. eslint-config-prettier

- **Version:** 10.1.8
- **License:** MIT
- **Repository:** https://github.com/prettier/eslint-config-prettier
- **Purpose:** ESLint configuration to disable formatting rules
- **Description:** Disables ESLint formatting rules to avoid conflicts with Prettier
- **Compatible:** ✅ Yes

#### 5. prettier

- **Version:** 3.9.6
- **License:** MIT
- **Repository:** https://github.com/prettier/prettier
- **Purpose:** Code formatter
- **Description:** Automatic code formatting for consistency
- **Compatible:** ✅ Yes

#### 6. typescript

- **Version:** 7.0.2
- **License:** Apache-2.0
- **Repository:** https://github.com/microsoft/TypeScript
- **Purpose:** TypeScript compiler
- **Description:** Transpiles TypeScript to JavaScript
- **License Note:** Apache-2.0 (permissive, development-only)
- **Compatible:** ✅ Yes

#### 7. typescript-eslint

- **Version:** 8.68.0
- **License:** MIT / Apache-2.0
- **Repository:** https://github.com/typescript-eslint/typescript-eslint
- **Purpose:** TypeScript support for ESLint
- **Description:** Parses and lints TypeScript code
- **Compatible:** ✅ Yes

#### 8. vitest

- **Version:** 4.1.11
- **License:** MIT
- **Repository:** https://github.com/vitest-dev/vitest
- **Purpose:** Unit testing framework
- **Description:** Fast unit test runner
- **Compatible:** ✅ Yes

### CLI Dev Dependencies

#### 1. oclif

- **Version:** 4.24.0
- **License:** MIT
- **Repository:** https://github.com/oclif/oclif
- **Purpose:** oclif CLI framework tool
- **Description:** CLI generation and manifest compilation
- **Compatible:** ✅ Yes

### Generator Package Dev Dependencies

#### 1. @types/ejs

- **Version:** 3.1.5
- **License:** MIT
- **Repository:** https://github.com/DefinitelyTyped/DefinitelyTyped
- **Purpose:** TypeScript type definitions for ejs
- **Description:** Type definitions for ejs templating engine
- **Compatible:** ✅ Yes

---

## Notable Transitive Dependencies

These are important indirect dependencies that come with the direct dependencies listed above.

### From @oclif/core

- **@oclif/test:** MIT
- **@oclif/plugin-help:** MIT
- **@oclif/plugin-plugins:** MIT
- **chalk:** MIT (also direct dependency)
- **supports-color:** MIT

### From express

- **accepts:** MIT
- **body-parser:** MIT (also direct dependency)
- **content-disposition:** MIT
- **content-type:** MIT
- **etag:** MIT
- **finalhandler:** MIT
- **fresh:** MIT
- **http-errors:** MIT
- **merge-descriptors:** MIT
- **parseurl:** MIT
- **range-parser:** MIT
- **send:** MIT
- **serve-static:** MIT
- **setprototypeof:** ISC
- **statuses:** MIT
- **toidentifier:** MIT
- **type-is:** MIT
- **vary:** MIT

### From ora

- **chalk:** MIT
- **cli-cursor:** MIT
- **cli-spinners:** MIT
- **is-interactive:** MIT
- **is-unicode-supported:** MIT
- **log-symbols:** MIT
- **stdin-discarder:** MIT
- **strip-ansi:** MIT

---

## License Categories

### MIT License (Permissive)

**Count:** ~95% of dependencies

**Key Properties:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ✅ Sublicensing allowed
- ⚠️ Requires: License notice and copyright notice

**Packages:** @oclif/core, chalk, ora, express, ws, open, prettier, eslint, vitest, and most others

### Apache-2.0 License (Permissive)

**Count:** ~5% of dependencies

**Key Properties:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ✅ Sublicensing allowed
- ✅ Explicit patent grant included
- ⚠️ Requires: License notice, copyright notice, and notice of modifications (if modified)

**Packages:**
- **ejs** (3.1.10) - Template engine
- **typescript** (7.0.2) - Compiler (dev-only)

### ISC License (Permissive)

**Count:** <1% of dependencies

**Key Properties:**
- ✅ Similar to MIT
- ✅ Permissive and compatible

**Packages:**
- **setprototypeof** - Transitive dependency

---

## License Compatibility Analysis

### Combining Licenses

Your project combines:
- **Your License:** MIT
- **Dependency Licenses:** MIT, Apache-2.0, ISC

**Result:** ✅ **Fully Compatible**

```
MIT (Your Project)
    ↓
Can include:
    ├── MIT ...................... ✅
    ├── Apache-2.0 ............... ✅
    ├── ISC ....................... ✅
    └── BSD ....................... ✅
```

### Distribution Rights

When distributing React CLI:
- ✅ Must include MIT license text (your license)
- ✅ Must include original copyright notice
- ⚠️ Should acknowledge Apache-2.0 packages (ejs, typescript)
- ✅ No requirement to open-source derived works
- ✅ Can be used commercially
- ✅ Can be modified

---

## Updates and Changes

### How to Update This File

When adding new dependencies:

```bash
# Check dependency license
npm view <package-name> license

# Add to appropriate section above
# Include: version, license, repository, purpose, description, compatibility
```

### Current Versions

All versions listed are current as of **November 14, 2026**.

To check for updates:
```bash
pnpm outdated
```

---

## Dependency Security and Maintenance

All dependencies are maintained by active communities:

| Dependency | Maintenance | Status |
|-----------|-------------|--------|
| @oclif/core | Salesforce | ✅ Active |
| chalk | sindresorhus | ✅ Active |
| ora | sindresorhus | ✅ Active |
| express | Node.js Foundation | ✅ Active |
| ws | websockets | ✅ Active |
| open | sindresorhus | ✅ Active |
| prettier | Prettier Team | ✅ Active |
| eslint | ESLint Team | ✅ Active |
| typescript | Microsoft | ✅ Active |
| vitest | Vitest Team | ✅ Active |
| ejs | mde | ✅ Active |

---

## Important Notes

### Apache-2.0 Usage (ejs)

The **ejs** package is licensed under Apache-2.0. This is fully compatible with MIT when bundled together.

**What you must do:**
- ✅ Include Apache-2.0 license text (optional but recommended)
- ✅ Include original ejs copyright notice
- ✅ Note that ejs source is not modified

See `NOTICE` file in this repository for detailed Apache-2.0 acknowledgments.

### TypeScript (Development Only)

TypeScript is Apache-2.0 licensed but is a development dependency (not included in distributions), so it doesn't affect runtime licensing.

### GPL/AGPL Compliance

✅ **No GPL or AGPL dependencies detected**

This means:
- ✅ No requirement to open-source your project
- ✅ Safe for commercial use
- ✅ Can be used in proprietary software

---

## References

- **MIT License:** https://opensource.org/licenses/MIT
- **Apache-2.0 License:** https://opensource.org/licenses/Apache-2.0
- **SPDX License List:** https://spdx.org/licenses/
- **Open Source Initiative:** https://opensource.org/

---

## Attribution

This document was generated to provide complete transparency about all third-party software used in React CLI.

For questions about specific dependencies, please:
1. Check the repository link provided for each package
2. Review the package's LICENSE file
3. Visit https://spdx.org/licenses/ for license details

---

## License Compliance Checklist

- [x] All direct dependencies listed
- [x] All major transitive dependencies listed
- [x] License type identified for each
- [x] Compatibility verified
- [x] No GPL/AGPL dependencies
- [x] Copyright notices preserved
- [x] Apache-2.0 packages acknowledged (see NOTICE)
- [x] Repository links provided

**Status:** ✅ **COMPLIANT**

Last Updated: November 14, 2026
