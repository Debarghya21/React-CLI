#!/usr/bin/env node

// Development runner — uses ts-node / tsx for direct TypeScript execution
import { execute } from '@oclif/core';

await execute({ development: true, dir: import.meta.url });
