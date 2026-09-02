import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { createProject } from '@rcli/generator';
import { validateProjectName } from '@rcli/utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GUI running at http://localhost:${PORT}`);
});
