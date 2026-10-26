import express from 'express';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { createProject } from '@rcli/generator';
import { getGenerator, getAvailableGenerators } from '@rcli/generator';
import { validateProjectName, validateGeneratorName, normalizeName } from '@rcli/utils';
import { configExists, readConfig, writeConfig } from '@rcli/config';
import { runCommand } from '@rcli/process-runner';
import os from 'os';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// ── Command history store (in-memory) ────────────────────────
const commandHistory = [];

function addHistory(entry) {
  commandHistory.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    ...entry,
  });
  // Keep last 100 entries
  if (commandHistory.length > 100) commandHistory.pop();
}

// ── Active processes tracker ─────────────────────────────────
const activeProcesses = new Map();

// ── Rollback tracker (generated files) ───────────────────────
const rollbackRegistry = new Map(); // id -> { files: string[], type, name, createdAt }

app.use(bodyParser.json());
app.use(express.static(__dirname));

// ── New Project ──────────────────────────────────────────────
app.post('/api/new-project', async (req, res) => {
  const { name, pm } = req.body;
  const validation = validateProjectName(name);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  try {
    const startTime = Date.now();
    await createProject({
      name,
      parentDir: process.cwd(),
      packageManager: pm || 'npm',
    });
    addHistory({
      command: `mycli new ${name}${pm && pm !== 'npm' ? ` --pm ${pm}` : ''}`,
      status: 'success',
      duration: Date.now() - startTime,
      type: 'new-project',
    });
    res.json({ success: true, message: `Project "${name}" created successfully!` });
  } catch (err) {
    addHistory({
      command: `mycli new ${name}`,
      status: 'error',
      error: err.message,
      type: 'new-project',
    });
    res.status(500).json({ error: err.message });
  }
});

// ── Generate (component, page, hook, service, context, layout, type) ──
app.post('/api/generate', async (req, res) => {
  const { type, name, test, directory, force, dryRun, skipExport } = req.body;

  if (!type || !name) {
    return res.status(400).json({ error: 'Both "type" and "name" are required.' });
  }

  const nameValidation = validateGeneratorName(name);
  if (!nameValidation.valid) {
    return res.status(400).json({ error: nameValidation.error });
  }

  if (!configExists()) {
    return res.status(400).json({
      error: 'rcli.json not found. Run this inside an rcli project or create one first.',
    });
  }

  try {
    const startTime = Date.now();
    const config = readConfig();
    const genConfig = config.generators[type];
    const names = normalizeName(name);
    const projectRoot = process.cwd();

    const outputDir = directory
      ? path.resolve(projectRoot, directory)
      : path.resolve(projectRoot, genConfig?.directory ?? `src/${type}s`);

    const testEnabled = test !== undefined ? test : (genConfig?.test ?? false);
    const indexEnabled = genConfig?.index ?? false;

    const generator = getGenerator(type);
    const result = await generator.generate({
      name,
      names,
      outputDir,
      test: testEnabled,
      index: indexEnabled,
      force: force ?? false,
      dryRun: dryRun ?? false,
      skipExport: skipExport ?? false,
      projectRoot,
    });

    // Build CLI command equivalent
    const flags = [];
    if (directory) flags.push(`--directory ${directory}`);
    if (test === true) flags.push('--test');
    if (test === false) flags.push('--no-test');
    if (force) flags.push('--force');
    if (dryRun) flags.push('--dry-run');
    if (skipExport) flags.push('--skip-export');
    const cliCommand = `mycli generate ${type} ${name}${flags.length ? ' ' + flags.join(' ') : ''}`;

    if (!dryRun) {
      addHistory({
        command: cliCommand,
        status: 'success',
        duration: Date.now() - startTime,
        type: 'generate',
        files: result.files.map(f => path.relative(projectRoot, f)),
      });

      // Track generated files for rollback
      const rollbackId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      rollbackRegistry.set(rollbackId, {
        files: [...result.files],
        type,
        name: names.pascalName,
        createdAt: new Date().toISOString(),
      });
      // Auto-expire rollback entries after 30 minutes
      setTimeout(() => rollbackRegistry.delete(rollbackId), 30 * 60 * 1000);

      res.json({
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} "${names.pascalName}" created!`,
        files: result.files,
        relativeFiles: result.files.map(f => path.relative(projectRoot, f)),
        dryRun: false,
        cliCommand,
        rollbackId,
      });
    } else {
      res.json({
        success: true,
        message: `Preview: ${type.charAt(0).toUpperCase() + type.slice(1)} "${names.pascalName}"`,
        files: result.files,
        relativeFiles: result.files.map(f => path.relative(projectRoot, f)),
        dryRun: true,
        cliCommand,
      });
    }
  } catch (err) {
    addHistory({
      command: `mycli generate ${type} ${name}`,
      status: 'error',
      error: err.message,
      type: 'generate',
    });
    res.status(500).json({ error: err.message });
  }
});

// ── Environment Info ─────────────────────────────────────────
app.get('/api/info', (req, res) => {
  const info = {
    cliVersion: '0.1.0',
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    cwd: process.cwd(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    memory: `${(os.totalmem() / 1073741824).toFixed(1)} GB`,
    uptime: `${(os.uptime() / 3600).toFixed(1)} hrs`,
    hasProject: configExists(),
    generators: getAvailableGenerators(),
  };

  if (configExists()) {
    try {
      const config = readConfig();
      info.project = {
        name: config.project.name,
        type: config.project.type,
        targets: Object.keys(config.targets),
        generators: Object.entries(config.generators).map(([k, v]) => ({
          type: k,
          directory: v?.directory,
          test: v?.test ?? false,
          index: v?.index ?? false,
        })),
      };
      info.config = config;
    } catch { /* ignore */ }
  }
  res.json(info);
});

// ── Available generators list ────────────────────────────────
app.get('/api/generators', (req, res) => {
  const meta = {
    component: { icon: '🧩', label: 'Component', description: 'React component with props' },
    hook: { icon: '🪝', label: 'Hook', description: 'Custom React hook' },
    page: { icon: '📄', label: 'Page', description: 'Route page component' },
    service: { icon: '🌐', label: 'API Service', description: 'API client module' },
    context: { icon: '📦', label: 'Context', description: 'React Context provider' },
    layout: { icon: '🗂', label: 'Layout', description: 'Layout component' },
    type: { icon: '📘', label: 'Type', description: 'TypeScript type definition' },
    storybook: { icon: '📖', label: 'Storybook Story', description: 'Storybook story file for a component' },
  };
  const generators = getAvailableGenerators().map(g => ({
    type: g, ...(meta[g] || { icon: '📁', label: g, description: `Generate a ${g}` }),
  }));
  res.json({ generators });
});

// ── Read config ──────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  if (!configExists()) return res.status(404).json({ error: 'No rcli.json found.' });
  try { res.json(readConfig()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Update config ────────────────────────────────────────────
app.put('/api/config', (req, res) => {
  try {
    writeConfig(req.body, process.cwd());
    addHistory({ command: 'mycli config (updated via GUI)', status: 'success', type: 'config' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Command history ──────────────────────────────────────────
app.get('/api/history', (req, res) => { res.json({ history: commandHistory }); });
app.delete('/api/history', (req, res) => { commandHistory.length = 0; res.json({ success: true }); });

// ── Run target command ───────────────────────────────────────
app.post('/api/run', async (req, res) => {
  const { target, extraFlags, command: rawCommand } = req.body;

  // Direct command execution (for packages page, etc.)
  if (rawCommand && !target) {
    // Only allow known safe commands for security
    const allowed = /^(npm|pnpm|yarn|npx)\s/;
    if (!allowed.test(rawCommand)) {
      return res.status(400).json({ error: 'Only package manager commands are allowed via direct execution.' });
    }
    const t0 = Date.now();
    try {
      const result = await runCommand(rawCommand, { cwd: process.cwd() });
      addHistory({ command: rawCommand, status: result.success ? 'success' : 'error', duration: Date.now() - t0, type: 'exec' });
      return res.json({ success: result.success, exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr, cliCommand: rawCommand });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  // Target-based execution
  if (!configExists()) return res.status(400).json({ error: 'No rcli.json found.' });
  try {
    const config = readConfig();
    const tc = config.targets[target];
    if (!tc) return res.status(400).json({ error: `No "${target}" target configured.` });
    let command = tc.command;
    if (extraFlags) command += ` ${extraFlags}`;
    const cliCmd = `mycli ${target}${extraFlags ? ` ${extraFlags}` : ''}`;
    const t0 = Date.now();
    const result = await runCommand(command, { cwd: process.cwd() });
    addHistory({ command: cliCmd, status: result.success ? 'success' : 'error', duration: Date.now() - t0, type: 'run' });
    res.json({ success: result.success, exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr, cliCommand: cliCmd, actualCommand: command });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Rollback generated files ─────────────────────────────────
app.post('/api/rollback/:id', (req, res) => {
  const entry = rollbackRegistry.get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'Rollback entry not found or expired.' });
  const deleted = [];
  const failed = [];
  for (const filePath of entry.files) {
    try {
      if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); deleted.push(filePath); }
    } catch (e) { failed.push({ file: filePath, error: e.message }); }
  }
  // Try to remove empty parent directories
  const dirs = new Set(entry.files.map(f => path.dirname(f)));
  for (const dir of dirs) {
    try {
      const items = fs.readdirSync(dir);
      if (items.length === 0) fs.rmdirSync(dir);
    } catch { /* dir not empty or doesn't exist */ }
  }
  rollbackRegistry.delete(req.params.id);
  addHistory({ command: `Undo: ${entry.type} "${entry.name}"`, status: 'success', type: 'rollback' });
  res.json({ success: true, deleted, failed, message: `Rolled back ${entry.type} "${entry.name}" (${deleted.length} files removed)` });
});

// ── Project structure scanner ────────────────────────────────
app.get('/api/structure', (req, res) => {
  const root = process.cwd();
  const srcDir = path.join(root, 'src');
  if (!fs.existsSync(srcDir)) return res.json({ tree: [] });
  function scan(dir, depth) {
    if (depth > 4) return [];
    const entries = [];
    try {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;
        const fp = path.join(dir, item.name);
        const rp = path.relative(root, fp);
        if (item.isDirectory()) entries.push({ name: item.name, path: rp, type: 'directory', children: scan(fp, depth + 1) });
        else entries.push({ name: item.name, path: rp, type: 'file', ext: path.extname(item.name) });
      }
    } catch { /* skip */ }
    return entries;
  }
  res.json({ root: 'src', tree: scan(srcDir, 0) });
});

// ── Active processes ─────────────────────────────────────────
app.get('/api/processes', (req, res) => {
  const procs = [];
  for (const [id, info] of activeProcesses) procs.push({ id, target: info.target, command: info.command, startedAt: info.startedAt });
  res.json({ processes: procs });
});
app.post('/api/processes/:id/stop', (req, res) => {
  const proc = activeProcesses.get(req.params.id);
  if (!proc?.child) return res.status(404).json({ error: 'Process not found.' });
  proc.child.kill('SIGTERM');
  activeProcesses.delete(req.params.id);
  res.json({ success: true });
});

// ── Serve HTML ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Create HTTP server and attach WebSocket ──────────────────
const server = createServer(app);
let wss;
try { wss = new WebSocketServer({ server }); } catch { wss = null; }

if (wss) {
  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.action === 'run') handleWsRun(ws, msg);
      } catch { ws.send(JSON.stringify({ type: 'error', data: 'Invalid message' })); }
    });
  });
}

function handleWsRun(ws, msg) {
  const { target, extraFlags } = msg;
  if (!configExists()) { ws.send(JSON.stringify({ type: 'error', data: 'No rcli.json found.' })); return; }
  const config = readConfig();
  const tc = config.targets[target];
  if (!tc) { ws.send(JSON.stringify({ type: 'error', data: `No "${target}" target configured.` })); return; }
  let command = tc.command;
  if (extraFlags) command += ` ${extraFlags}`;
  const procId = Date.now().toString(36);
  const t0 = Date.now();
  const cliCmd = `mycli ${target}${extraFlags ? ` ${extraFlags}` : ''}`;
  ws.send(JSON.stringify({ type: 'started', procId, command: cliCmd }));
  const child = spawn(command, { cwd: process.cwd(), shell: true, env: { ...process.env, FORCE_COLOR: '0' } });
  activeProcesses.set(procId, { target, command: cliCmd, startedAt: new Date().toISOString(), child });
  child.stdout.on('data', (d) => ws.send(JSON.stringify({ type: 'stdout', procId, data: d.toString() })));
  child.stderr.on('data', (d) => ws.send(JSON.stringify({ type: 'stderr', procId, data: d.toString() })));
  child.on('close', (code) => {
    activeProcesses.delete(procId);
    addHistory({ command: cliCmd, status: code === 0 ? 'success' : 'error', duration: Date.now() - t0, type: 'run' });
    ws.send(JSON.stringify({ type: 'exit', procId, code, success: code === 0 }));
  });
  child.on('error', (err) => { activeProcesses.delete(procId); ws.send(JSON.stringify({ type: 'error', procId, data: err.message })); });
}

server.listen(PORT, () => {
  console.log(`\n  🚀 rcli GUI running at http://localhost:${PORT}\n`);
});
