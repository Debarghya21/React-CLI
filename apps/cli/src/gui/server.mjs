import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { createProject } from '@rcli/generator';
import { getGenerator, getAvailableGenerators } from '@rcli/generator';
import { validateProjectName, validateGeneratorName, normalizeName } from '@rcli/utils';
import { configExists, readConfig } from '@rcli/config';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

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
    await createProject({
      name,
      parentDir: process.cwd(),
      packageManager: pm || 'npm',
    });
    res.json({ success: true, message: `Project "${name}" created successfully!` });
  } catch (err) {
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

    res.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} "${names.pascalName}" created!`,
      files: result.files,
      dryRun: dryRun ?? false,
    });
  } catch (err) {
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
        })),
      };
    } catch {
      // ignore
    }
  }

  res.json(info);
});

// ── Available generators list ────────────────────────────────
app.get('/api/generators', (req, res) => {
  res.json({ generators: getAvailableGenerators() });
});

// ── Serve HTML ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🚀 rcli GUI running at http://localhost:${PORT}\n`);
});
