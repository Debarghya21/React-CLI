/* ═══════════════════════════════════════════════════════════════
   mycli GUI — Developer Control Center
   Single-page application for the React CLI
   ═══════════════════════════════════════════════════════════════ */

// ── State ────────────────────────────────────────────────────
const state = {
  currentPage: 'overview',
  info: null,
  generators: [],
  history: [],
  panelOpen: false,
  panelLogs: [],
  wsConnected: false,
  ws: null,
  processes: [],
};

// ── API helpers ──────────────────────────────────────────────
const api = {
  async get(url) { const r = await fetch(url); if (!r.ok) throw new Error((await r.json()).error || r.statusText); return r.json(); },
  async post(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || r.statusText); return d; },
  async put(url, body) { const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || r.statusText); return d; },
  async del(url) { const r = await fetch(url, { method: 'DELETE' }); return r.json(); },
};

// ── Toast ────────────────────────────────────────────────────
function showToast(title, msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><div class="toast-body"><div class="toast-title">${esc(title)}</div><div class="toast-msg">${esc(msg)}</div></div>`;
  c.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ── Undo Toast (with rollback button) ────────────────────────
function showUndoToast(title, msg, rollbackId) {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast toast-success';
  el.innerHTML = `<span class="toast-icon">✓</span><div class="toast-body"><div class="toast-title">${esc(title)}</div><div class="toast-msg">${esc(msg)}</div></div><button class="btn btn-sm" style="margin-left:8px;color:var(--warning);border-color:var(--warning)" id="undo-${esc(rollbackId)}">Undo</button>`;
  c.appendChild(el);
  el.querySelector(`#undo-${rollbackId}`).addEventListener('click', async () => {
    try {
      const r = await api.post(`/api/rollback/${rollbackId}`, {});
      el.remove();
      showToast('Rolled Back', r.message);
      appendLog('↩ ' + r.message + '\n', 'info');
      refreshHistory();
      if (state.currentPage === 'overview' || state.currentPage === 'components') renderPage();
    } catch (e) {
      showToast('Undo Failed', e.message, 'error');
    }
  });
  // Auto-dismiss after 15 seconds (longer than normal toast to give time to undo)
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 15000);
}

// ── Time formatting ──────────────────────────────────────────
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtDuration(ms) {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Clipboard ────────────────────────────────────────────────
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied', text));
}

// ── Sidebar ──────────────────────────────────────────────────
const NAV = [
  { group: 'Project', items: [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'generate', icon: '✨', label: 'Generate', kbd: '⌘G' },
    { id: 'run', icon: '▶', label: 'Run', kbd: '⌘R' },
    { id: 'components', icon: '🧱', label: 'Components' },
  ]},
  { group: 'Development', items: [
    { id: 'testing', icon: '🧪', label: 'Testing' },
    { id: 'build', icon: '🏗', label: 'Build' },
    { id: 'packages', icon: '📦', label: 'Packages' },
  ]},
  { group: 'Tools', items: [
    { id: 'history', icon: '📜', label: 'History' },
    { id: 'terminal', icon: '>_', label: 'Terminal', kbd: '⌘`' },
  ]},
  { group: 'Settings', items: [
    { id: 'config', icon: '🔧', label: 'Configuration', kbd: '⌘,' },
  ]},
];

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = NAV.map(g => `
    <div class="sidebar-group">
      <div class="sidebar-group-label">${g.group}</div>
      ${g.items.map(it => `
        <div class="sidebar-item ${state.currentPage === it.id ? 'active' : ''}" data-page="${it.id}">
          <span class="si-icon">${it.icon}</span>
          <span class="si-label">${it.label}</span>
          ${it.kbd ? `<span class="si-kbd">${it.kbd}</span>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
  sb.querySelectorAll('.sidebar-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });
}

function navigate(page) {
  state.currentPage = page;
  renderSidebar();
  renderPage();
}

// ── Page router ──────────────────────────────────────────────
function renderPage() {
  const c = document.getElementById('content');
  const pages = { overview: pageOverview, generate: pageGenerate, run: pageRun, components: pageComponents, testing: pageTesting, build: pageBuild, packages: pagePackages, history: pageHistory, terminal: pageTerminal, config: pageConfig };
  const fn = pages[state.currentPage] || pageOverview;
  c.innerHTML = `<div class="page">${fn()}</div>`;
  bindPageEvents();
}

// ── Overview page ────────────────────────────────────────────
function pageOverview() {
  const i = state.info;
  if (!i) return '<div style="padding:40px;text-align:center;color:var(--text2)"><div style="font-size:24px;margin-bottom:8px">⏳</div>Loading project info…</div>';
  const p = i.project;
  const procCount = state.processes.length;
  const genCount = state.generators.length;
  const targetCount = p ? p.targets.length : 0;
  const histCount = state.history.length;

  const statCards = `
    <div class="stat-cards">
      <div class="stat-card"><div class="stat-value${procCount > 0 ? ' stat-active' : ''}">${procCount}</div><div class="stat-label">Running Processes</div></div>
      <div class="stat-card"><div class="stat-value">${genCount}</div><div class="stat-label">Generators</div></div>
      <div class="stat-card"><div class="stat-value">${targetCount}</div><div class="stat-label">Targets</div></div>
      <div class="stat-card"><div class="stat-value">${histCount}</div><div class="stat-label">Commands Run</div></div>
    </div>`;

  const projectInfo = p ? `
    <div class="info-grid" style="margin-bottom:20px">
      <span class="ig-label">Project</span><span>${esc(p.name)}</span>
      <span class="ig-label">Type</span><span>${esc(p.type)} · React</span>
      <span class="ig-label">Language</span><span>TypeScript</span>
      <span class="ig-label">Bundler</span><span>Vite</span>
      <span class="ig-label">Path</span><span style="font-family:var(--mono);font-size:11px;color:var(--text2)">${esc(i.cwd)}</span>
    </div>` : `<p style="color:var(--text2)">No rcli project detected in current directory.</p>`;

  return `
    <div class="page-header"><h1>Project Overview</h1><p>Your React workspace at a glance</p></div>
    ${statCards}
    ${projectInfo}
    <div class="quick-actions">
      <div class="quick-action" data-action="run-serve"><span class="qa-icon">▶</span><span class="qa-text">Start Dev Server</span></div>
      <div class="quick-action" data-action="nav-generate"><span class="qa-icon">✨</span><span class="qa-text">Generate</span></div>
      <div class="quick-action" data-action="run-test"><span class="qa-icon">🧪</span><span class="qa-text">Run Tests</span></div>
      <div class="quick-action" data-action="run-build"><span class="qa-icon">🏗</span><span class="qa-text">Build</span></div>
    </div>
    ${p ? `<div class="section-title">Project Health</div>
    <div class="card" style="margin-bottom:24px">
      <div class="health-table">
        <div class="health-row"><span class="health-label">Configuration</span><span class="health-value status-ok">✓ rcli.json found</span></div>
        <div class="health-row"><span class="health-label">Targets</span><span class="health-value status-ok">✓ ${p.targets.length} configured</span></div>
        <div class="health-row"><span class="health-label">Generators</span><span class="health-value status-ok">✓ ${(p.generators || []).length} available</span></div>
      </div>
    </div>` : ''}
    <div class="section-title">Recent Commands</div>
    <div id="overview-history" class="card"><p style="color:var(--text2);font-size:12px">No commands yet. Start by generating a component!</p></div>
    <hr class="sep">
    <div class="section-title">Environment</div>
    <div class="info-grid">
      <span class="ig-label">mycli</span><span>v${esc(i.cliVersion)}</span>
      <span class="ig-label">Node.js</span><span>${esc(i.node)}</span>
      <span class="ig-label">Platform</span><span>${esc(i.platform)}</span>
    </div>`;
}

// ── Generate page ────────────────────────────────────────────
function pageGenerate() {
  const gens = state.generators;
  return `
    <div class="page-header"><h1>Generate</h1><p>Create something in your React project</p></div>
    <div class="card-grid">
      ${gens.map(g => `
        <div class="action-card" data-gen-type="${g.type}">
          <span class="ac-icon">${g.icon}</span>
          <span class="ac-title">${g.label}</span>
          <span class="ac-desc">${g.description}</span>
        </div>
      `).join('')}
    </div>`;
}

// ── Run page ─────────────────────────────────────────────────
function pageRun() {
  return `
    <div class="page-header"><h1>Run</h1><p>Execute project scripts and tasks</p></div>
    <div class="run-section"><h3>Development</h3>
      <div class="run-item" data-target="serve"><span class="ri-icon">▶</span><span class="ri-label">Start Dev Server</span><span class="ri-cmd">mycli serve</span></div>
    </div>
    <div class="run-section"><h3>Testing</h3>
      <div class="run-item" data-target="test"><span class="ri-icon">🧪</span><span class="ri-label">Run Tests</span><span class="ri-cmd">mycli test</span></div>
      <div class="run-item" data-target="test" data-flags="--watch"><span class="ri-icon">👁</span><span class="ri-label">Tests (Watch Mode)</span><span class="ri-cmd">mycli test --watch</span></div>
    </div>
    <div class="run-section"><h3>Quality</h3>
      <div class="run-item" data-target="lint"><span class="ri-icon">🔍</span><span class="ri-label">Run ESLint</span><span class="ri-cmd">mycli lint</span></div>
      <div class="run-item" data-target="lint" data-flags="--fix"><span class="ri-icon">🔧</span><span class="ri-label">Lint (Auto-fix)</span><span class="ri-cmd">mycli lint --fix</span></div>
      <div class="run-item" data-target="format"><span class="ri-icon">✏️</span><span class="ri-label">Format Code</span><span class="ri-cmd">mycli format</span></div>
    </div>
    <div class="run-section"><h3>Production</h3>
      <div class="run-item" data-target="build"><span class="ri-icon">🏗</span><span class="ri-label">Build for Production</span><span class="ri-cmd">mycli build</span></div>
    </div>`;
}

// ── Components page ──────────────────────────────────────────
function pageComponents() {
  return `
    <div class="page-header"><h1>Project Explorer</h1><p>React-aware project structure</p></div>
    <div class="card" id="file-tree-container"><p style="color:var(--text2)">Loading…</p></div>`;
}

// ── Testing page ─────────────────────────────────────────────
function pageTesting() {
  return `
    <div class="page-header"><h1>Testing</h1><p>Run and monitor your test suite</p></div>
    <div class="quick-actions" style="margin-bottom:16px">
      <div class="quick-action" data-action="run-test"><span class="qa-icon">🧪</span><span class="qa-text">Run Tests</span></div>
      <div class="quick-action" data-action="run-test-watch"><span class="qa-icon">👁</span><span class="qa-text">Watch Mode</span></div>
    </div>
    <div class="card" id="test-output"><p style="color:var(--text2);font-size:12px">Click "Run Tests" to see results here.</p></div>`;
}

// ── Build page ───────────────────────────────────────────────
function pageBuild() {
  return `
    <div class="page-header"><h1>Build</h1><p>Build your project for production</p></div>
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Production Build</div>
      <div class="cmd-label">Command</div>
      <div class="cmd-preview">mycli build</div>
      <div style="margin-top:16px"><button class="btn btn-primary" data-action="run-build">🏗 Build Project</button></div>
    </div>
    <div class="card" id="build-output"><p style="color:var(--text2);font-size:12px">Build output will appear here.</p></div>`;
}

// ── Packages page ────────────────────────────────────────────
function pagePackages() {
  return `
    <div class="page-header"><h1>📦 Packages</h1><p>Manage project dependencies</p></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      <div class="card" style="cursor:pointer" data-action="install-deps">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:20px">📥</span>
          <div><strong>Install Dependencies</strong><div style="font-size:11px;color:var(--text2)">Run package manager install</div></div>
        </div>
        <code style="font-size:11px;color:var(--text2);font-family:var(--mono)">npm install</code>
      </div>
      <div class="card" style="cursor:pointer" data-action="add-pkg">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:20px">➕</span>
          <div><strong>Add Package</strong><div style="font-size:11px;color:var(--text2)">Install a new dependency</div></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <input type="text" id="pkg-name" placeholder="Package name (e.g. axios)" style="flex:1;height:32px;background:var(--panel2);border:1px solid var(--border);border-radius:var(--radius);padding:0 10px;color:var(--text);font-size:12px" />
          <label style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text2);white-space:nowrap"><input type="checkbox" id="pkg-dev" /> Dev</label>
          <button class="btn btn-primary btn-sm" id="pkg-add-btn">Add</button>
        </div>
      </div>
    </div>
    <div class="run-section">
      <h3>Common Package Tasks</h3>
      <div class="run-item" data-action="run-cmd" data-cmd="npm outdated">
        <span class="ri-icon">📋</span><span class="ri-label">Check Outdated</span><span class="ri-cmd">npm outdated</span>
      </div>
      <div class="run-item" data-action="run-cmd" data-cmd="npm audit">
        <span class="ri-icon">🔒</span><span class="ri-label">Security Audit</span><span class="ri-cmd">npm audit</span>
      </div>
      <div class="run-item" data-action="run-cmd" data-cmd="npm ls --depth=0">
        <span class="ri-icon">🌳</span><span class="ri-label">List Installed</span><span class="ri-cmd">npm ls --depth=0</span>
      </div>
      <div class="run-item" data-action="run-cmd" data-cmd="npm update">
        <span class="ri-icon">⬆️</span><span class="ri-label">Update All</span><span class="ri-cmd">npm update</span>
      </div>
    </div>
  `;
}

// ── History page ─────────────────────────────────────────────
function pageHistory() {
  const h = state.history;
  const rows = h.length ? h.map(e => `
    <div class="history-item" title="${esc(e.command)}">
      <span class="hi-status">${e.status === 'success' ? '<span class="status-ok">✓</span>' : '<span class="status-err">✕</span>'}</span>
      <span class="hi-cmd">${esc(e.command)}</span>
      <span class="hi-time">${e.duration ? fmtDuration(e.duration) + ' · ' : ''}${timeAgo(e.timestamp)}</span>
    </div>
  `).join('') : '<p style="color:var(--text2);font-size:12px">No commands recorded yet.</p>';
  return `
    <div class="page-header"><h1>Command History</h1><p>Recent CLI operations</p></div>
    ${h.length ? '<div style="margin-bottom:12px"><button class="btn btn-sm" id="clear-history-btn">Clear History</button></div>' : ''}
    <div class="card">${rows}</div>`;
}

// ── Terminal page ────────────────────────────────────────────
function pageTerminal() {
  const wsStatus = state.wsConnected ? '<span class="badge badge-ok">● Connected</span>' : '<span class="badge" style="background:rgba(248,81,73,0.15);color:var(--error)">● Disconnected</span>';
  return `
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
      <div><h1>Terminal</h1><p>Command output and logs</p></div>
      <div style="display:flex;align-items:center;gap:8px">${wsStatus}</div>
    </div>
    <div class="card" style="min-height:300px;font-family:var(--mono);font-size:11px;white-space:pre-wrap;color:var(--text2);overflow-y:auto;max-height:55vh" id="terminal-body">${state.panelLogs.length ? state.panelLogs.map(l => '<span class="log-' + l.type + '">' + esc(l.text) + '</span>').join('') : '<span style="color:var(--text2)">No output yet. Run a command to see logs here.\n\nTip: Use the Run page or the command palette (⌘K) to execute commands.\nYou can also type a target below to run it via WebSocket streaming.</span>'}</div>
    <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
      <input type="text" id="term-input" placeholder="Enter a target to run (e.g. serve, build, test, lint)" style="flex:1;height:32px;background:var(--panel2);border:1px solid var(--border);border-radius:var(--radius);padding:0 10px;color:var(--text);font-family:var(--mono);font-size:12px" />
      <button class="btn btn-primary btn-sm" id="term-run">Run</button>
      <button class="btn btn-sm" id="term-clear">Clear</button>
      <button class="btn btn-sm" id="term-copy">Copy Logs</button>
    </div>
    ${state.processes.length ? '<div style="margin-top:12px"><div class="section-title">Running Processes</div>' + state.processes.map(p => '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><span style="font-family:var(--mono);font-size:11px;flex:1">' + esc(p.command || p.target) + '</span><span style="font-size:10px;color:var(--text2)">' + timeAgo(p.startedAt) + '</span><button class="btn btn-sm" data-stop-proc="' + esc(p.id) + '" style="color:var(--error);font-size:11px">Stop</button></div>').join('') + '</div>' : ''}`;
}

// ── Config page ──────────────────────────────────────────────
function pageConfig() {
  const cfg = state.info?.config;
  if (!cfg) return '<div class="page-header"><h1>Configuration</h1></div><p style="color:var(--text2)">No rcli.json found.</p>';
  const gens = Object.entries(cfg.generators || {}).filter(([,v]) => v);
  return `
    <div class="page-header"><h1>Configuration</h1><p>Visual settings for rcli.json</p></div>
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Project</div>
      <div class="info-grid">
        <span class="ig-label">Name</span><span>${esc(cfg.project?.name)}</span>
        <span class="ig-label">Type</span><span>${esc(cfg.project?.type)}</span>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Generators</div>
      ${gens.map(([k,v]) => `<div class="health-row"><span class="health-label">${k}</span><span class="health-value">${esc(v.directory)}${v.test ? ' · tests' : ''}${v.index ? ' · index' : ''}</span></div>`).join('')}
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="section-title">Targets</div>
      ${Object.entries(cfg.targets || {}).filter(([,v]) => v).map(([k,v]) => `<div class="health-row"><span class="health-label">${k}</span><span class="health-value" style="font-family:var(--mono);font-size:11px">${esc(v.command)}</span></div>`).join('')}
    </div>
    <div class="cmd-label">rcli.json</div>
    <div class="cmd-preview" style="max-height:300px;overflow-y:auto;color:var(--text)">${esc(JSON.stringify(cfg, null, 2))}</div>`;
}

// ── Generator wizard modal ───────────────────────────────────
function openGeneratorWizard(type) {
  const gen = state.generators.find(g => g.type === type);
  if (!gen) return;
  const cfg = state.info?.config?.generators?.[type] || {};
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">
    <div class="modal-header"><h2>${gen.icon} Generate ${gen.label}</h2><button class="btn btn-ghost modal-x">✕</button></div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="wiz-name" placeholder="e.g. UserProfile" /></div>
      <div class="form-group"><label class="form-label">Directory</label><input class="form-input" id="wiz-dir" value="${esc(cfg.directory || 'src/' + type + 's')}" /></div>
      ${['component','page','hook','service'].includes(type) ? '<label class="form-check"><input type="checkbox" id="wiz-test" ' + (cfg.test !== false ? 'checked' : '') + ' /> Generate test file</label>' : ''}
      <label class="form-check"><input type="checkbox" id="wiz-force" /> Overwrite existing files</label>
      <div class="cmd-label">Command Preview</div>
      <div class="cmd-preview" id="wiz-cmd">mycli generate ${type} …<button class="btn btn-sm btn-ghost copy-btn" id="wiz-copy">📋</button></div>
    </div>
    <div class="modal-footer"><button class="btn modal-x">Cancel</button><button class="btn btn-primary" id="wiz-dry">Preview</button><button class="btn btn-primary" id="wiz-go">Generate</button></div>
  </div>`;
  document.body.appendChild(overlay);
  const ni = overlay.querySelector('#wiz-name');
  const di = overlay.querySelector('#wiz-dir');
  const updateCmd = () => {
    const n = ni.value.trim(), d = di.value.trim(), t = overlay.querySelector('#wiz-test')?.checked, f = overlay.querySelector('#wiz-force')?.checked;
    const p = ['mycli generate ' + type]; if (n) p.push(n); if (d && d !== (cfg.directory || 'src/' + type + 's')) p.push('--directory ' + d);
    if (t === false && overlay.querySelector('#wiz-test')) p.push('--no-test'); else if (t) p.push('--test'); if (f) p.push('--force');
    overlay.querySelector('#wiz-cmd').innerHTML = esc(p.join(' ')) + '<button class="btn btn-sm btn-ghost copy-btn" id="wiz-copy">📋</button>';
  };
  ni.addEventListener('input', updateCmd); di.addEventListener('input', updateCmd);
  overlay.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', updateCmd));
  overlay.querySelectorAll('.modal-x').forEach(b => b.addEventListener('click', () => overlay.remove()));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.addEventListener('click', e => { if (e.target.id === 'wiz-copy') { const txt = overlay.querySelector('#wiz-cmd').textContent.replace('📋','').trim(); copyText(txt); }});
  overlay.querySelector('#wiz-dry').addEventListener('click', async () => {
    const n = ni.value.trim(); if (!n) { showToast('Error','Name is required','error'); return; }
    try { const r = await api.post('/api/generate', { type, name: n, directory: di.value.trim(), test: overlay.querySelector('#wiz-test')?.checked, dryRun: true });
      showToast('Preview', 'Would create: ' + (r.relativeFiles || r.files || []).join(', ')); } catch(e) { showToast('Error', e.message, 'error'); }
  });
  overlay.querySelector('#wiz-go').addEventListener('click', async () => {
    const n = ni.value.trim(); if (!n) { showToast('Error','Name is required','error'); return; }
    try { const r = await api.post('/api/generate', { type, name: n, directory: di.value.trim(), test: overlay.querySelector('#wiz-test')?.checked, force: overlay.querySelector('#wiz-force')?.checked, dryRun: false });
      overlay.remove();
      appendLog('$ ' + r.cliCommand + '\n' + (r.relativeFiles||r.files||[]).map(f=>'✓ '+f).join('\n') + '\n' + r.message + '\n', 'info');
      refreshHistory();
      if (r.rollbackId) { showUndoToast(gen.label + ' generated', r.message, r.rollbackId); }
      else { showToast(gen.label + ' generated', r.message); }
    } catch(e) { showToast('Error', e.message, 'error'); }
  });
  ni.focus();
}

// ── Event binding ────────────────────────────────────────────
function bindPageEvents() {
  // Generator cards
  document.querySelectorAll('[data-gen-type]').forEach(el => {
    el.addEventListener('click', () => openGeneratorWizard(el.dataset.genType));
  });
  // Quick actions
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => handleAction(el.dataset.action));
  });
  // Run items
  document.querySelectorAll('[data-target]').forEach(el => {
    el.addEventListener('click', () => executeTarget(el.dataset.target, el.dataset.flags || ''));
  });
  // Clear history
  document.getElementById('clear-history-btn')?.addEventListener('click', async () => {
    const confirmed = await confirmDialog('Clear History', 'Are you sure you want to clear all command history? This action cannot be undone.', 'Clear All');
    if (!confirmed) return;
    await api.del('/api/history'); state.history = []; renderPage();
    showToast('History Cleared', 'All command history has been removed.');
  });
  // Terminal clear/copy
  document.getElementById('term-clear')?.addEventListener('click', () => { state.panelLogs = []; renderPage(); });
  document.getElementById('term-copy')?.addEventListener('click', () => copyText(state.panelLogs.map(l => l.text).join('')));
  // Terminal: run target via WebSocket
  document.getElementById('term-run')?.addEventListener('click', () => wsRunTarget());
  document.getElementById('term-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') wsRunTarget(); });
  // Terminal: stop processes
  document.querySelectorAll('[data-stop-proc]').forEach(el => {
    el.addEventListener('click', async () => {
      const procId = el.getAttribute('data-stop-proc');
      try {
        await api.post(`/api/processes/${procId}/stop`, {});
        showToast('Process Stopped', 'Process terminated successfully');
        await loadProcesses();
        renderPage();
      } catch (e) { showToast('Error', e.message, 'error'); }
    });
  });
  // Packages: run npm commands
  document.querySelectorAll('[data-action="run-cmd"]').forEach(el => {
    el.addEventListener('click', async () => {
      const cmd = el.getAttribute('data-cmd');
      if (!cmd) return;
      openBottomPanel();
      appendLog(`$ ${cmd}\n`, 'info');
      try {
        const res = await api.post('/api/run', { command: cmd });
        if (res.stdout) appendLog(res.stdout + '\n', 'stdout');
        if (res.stderr) appendLog(res.stderr + '\n', 'stderr');
        appendLog(`\n✓ Finished (exit ${res.exitCode || 0})\n`, res.success ? 'info' : 'error');
        refreshHistory();
      } catch (e) {
        appendLog(`✕ Error: ${e.message}\n`, 'error');
        showToast('Command Failed', e.message, 'error');
      }
    });
  });
  document.querySelector('[data-action="install-deps"]')?.addEventListener('click', async () => {
    openBottomPanel();
    const cmd = 'npm install';
    appendLog(`$ ${cmd}\n`, 'info');
    try {
      const res = await api.post('/api/run', { command: cmd });
      if (res.stdout) appendLog(res.stdout + '\n', 'stdout');
      if (res.stderr) appendLog(res.stderr + '\n', 'stderr');
      appendLog(`\n✓ Dependencies installed\n`, 'info');
      showToast('Install Complete', 'Dependencies installed successfully');
    } catch (e) {
      appendLog(`✕ Error: ${e.message}\n`, 'error');
      showToast('Install Failed', e.message, 'error');
    }
  });
  document.getElementById('pkg-add-btn')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('pkg-name');
    const devCheckbox = document.getElementById('pkg-dev');
    const pkgName = nameInput?.value?.trim();
    if (!pkgName) { showToast('Missing Package', 'Enter a package name first', 'error'); return; }
    const isDev = devCheckbox?.checked;
    const cmd = `npm install ${isDev ? '--save-dev ' : ''}${pkgName}`;
    openBottomPanel();
    appendLog(`$ ${cmd}\n`, 'info');
    try {
      const res = await api.post('/api/run', { command: cmd });
      if (res.stdout) appendLog(res.stdout + '\n', 'stdout');
      if (res.stderr) appendLog(res.stderr + '\n', 'stderr');
      appendLog(`\n✓ Package "${pkgName}" installed\n`, 'info');
      showToast('Package Added', `${pkgName} installed successfully`);
      if (nameInput) nameInput.value = '';
    } catch (e) {
      appendLog(`✕ Error: ${e.message}\n`, 'error');
      showToast('Install Failed', e.message, 'error');
    }
  });
  // Components: load tree
  if (state.currentPage === 'components') loadFileTree();
  // Overview: load recent history
  if (state.currentPage === 'overview') loadOverviewHistory();
}

function handleAction(action) {
  if (action === 'nav-generate') navigate('generate');
  else if (action === 'run-serve') executeTarget('serve');
  else if (action === 'run-test') executeTarget('test');
  else if (action === 'run-test-watch') executeTarget('test', '--watch');
  else if (action === 'run-build') executeTarget('build');
}

// ── Execute target (via HTTP, show in bottom panel / inline) ─
async function executeTarget(target, flags) {
  const cliCmd = 'mycli ' + target + (flags ? ' ' + flags : '');
  appendLog('\n$ ' + cliCmd + '\n', 'info');
  openBottomPanel();
  try {
    const r = await api.post('/api/run', { target, extraFlags: flags || undefined });
    if (r.stdout) appendLog(r.stdout + '\n', 'stdout');
    if (r.stderr) appendLog(r.stderr + '\n', 'stderr');
    appendLog(r.success ? '✓ Command succeeded\n' : '✕ Command failed (exit ' + r.exitCode + ')\n', r.success ? 'info' : 'stderr');
    showToast(r.success ? 'Success' : 'Failed', cliCmd, r.success ? 'success' : 'error');
    refreshHistory();
    // Update inline outputs if on specific pages
    const outEl = document.getElementById('test-output') || document.getElementById('build-output');
    if (outEl && (target === 'test' || target === 'build')) {
      outEl.innerHTML = '<pre style="font-family:var(--mono);font-size:11px;white-space:pre-wrap;color:var(--text2)">' + esc(r.stdout || '') + (r.stderr ? '\n' + esc(r.stderr) : '') + '</pre>';
    }
  } catch (e) {
    appendLog('✕ Error: ' + e.message + '\n', 'stderr');
    showToast('Error', e.message, 'error');
  }
}

// ── Bottom panel / log ───────────────────────────────────────
function appendLog(text, type) {
  state.panelLogs.push({ text, type: type || 'stdout' });
  if (state.panelLogs.length > 5000) state.panelLogs.shift();
  updateBottomPanelBody();
  if (state.currentPage === 'terminal') renderPage();
}

function openBottomPanel() {
  const bp = document.getElementById('bottom-panel');
  if (!bp.classList.contains('open')) {
    bp.classList.add('open');
    bp.innerHTML = `<div class="bp-tabs"><span class="bp-tab active">Output</span><button class="bp-close" id="bp-close-btn">✕</button></div><div class="bp-body" id="bp-body"></div>`;
    bp.querySelector('#bp-close-btn').addEventListener('click', () => bp.classList.remove('open'));
  }
  updateBottomPanelBody();
}

function updateBottomPanelBody() {
  const el = document.getElementById('bp-body');
  if (!el) return;
  el.innerHTML = state.panelLogs.slice(-200).map(l => '<span class="log-' + l.type + '">' + esc(l.text) + '</span>').join('');
  el.scrollTop = el.scrollHeight;
}

// ── File tree loader ─────────────────────────────────────────
async function loadFileTree() {
  const el = document.getElementById('file-tree-container');
  if (!el) return;
  try {
    const data = await api.get('/api/structure');
    el.innerHTML = data.tree.length ? '<div class="file-tree">' + renderTree(data.tree, 0) + '</div>' : '<p style="color:var(--text2)">No src directory found.</p>';
  } catch { el.innerHTML = '<p style="color:var(--text2)">Could not load project structure.</p>'; }
}

function renderTree(items, depth) {
  return items.map(it => {
    const pad = 'padding-left:' + (depth * 16 + 4) + 'px';
    if (it.type === 'directory') {
      const icon = it.name === 'components' ? '🧩' : it.name === 'hooks' ? '🪝' : it.name === 'pages' ? '📄' : it.name === 'services' ? '🌐' : it.name === 'contexts' ? '📦' : it.name === 'layouts' ? '🗂' : it.name === 'types' ? '📘' : '📁';
      return '<div class="ft-item" style="' + pad + '">' + icon + ' <strong>' + esc(it.name) + '</strong></div>' + (it.children ? renderTree(it.children, depth + 1) : '');
    }
    const ext = it.ext || '';
    const icon = ext === '.tsx' || ext === '.jsx' ? '⚛️' : ext === '.ts' || ext === '.js' ? '📝' : ext === '.css' || ext === '.scss' ? '🎨' : '📄';
    return '<div class="ft-item" style="' + pad + '">' + icon + ' ' + esc(it.name) + '</div>';
  }).join('');
}

// ── WebSocket management ─────────────────────────────────────
function connectWebSocket() {
  try {
    const wsUrl = `ws://${location.host}`;
    state.ws = new WebSocket(wsUrl);
    state.ws.onopen = () => { state.wsConnected = true; if (state.currentPage === 'terminal') renderPage(); };
    state.ws.onclose = () => { state.wsConnected = false; state.ws = null; if (state.currentPage === 'terminal') renderPage(); setTimeout(connectWebSocket, 5000); };
    state.ws.onerror = () => { state.wsConnected = false; };
    state.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'stdout') appendLog(msg.data, 'stdout');
        else if (msg.type === 'stderr') appendLog(msg.data, 'stderr');
        else if (msg.type === 'started') { appendLog(`\n─── Process started (${msg.procId}) ───\n$ ${msg.command}\n\n`, 'info'); loadProcesses(); }
        else if (msg.type === 'exit') { appendLog(`\n─── Process exited (code ${msg.code}) ${msg.success ? '✓' : '✕'} ───\n`, msg.success ? 'info' : 'stderr'); refreshHistory(); loadProcesses(); }
        else if (msg.type === 'error') { appendLog(`\n✕ Error: ${msg.data}\n`, 'stderr'); showToast('WebSocket Error', msg.data, 'error'); }
      } catch { /* ignore parse errors */ }
    };
  } catch { state.wsConnected = false; }
}

function wsRunTarget() {
  const input = document.getElementById('term-input');
  const target = input?.value?.trim();
  if (!target) { showToast('No Target', 'Enter a target name (e.g. serve, build, test)', 'error'); return; }
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
    showToast('Not Connected', 'WebSocket not connected. Falling back to HTTP.', 'error');
    executeTarget(target);
    return;
  }
  state.ws.send(JSON.stringify({ action: 'run', target }));
  input.value = '';
}

// ── Load active processes ────────────────────────────────────
async function loadProcesses() {
  try {
    const data = await api.get('/api/processes');
    state.processes = data.processes || [];
  } catch { state.processes = []; }
}

// ── Overview recent history ──────────────────────────────────
async function loadOverviewHistory() {
  const el = document.getElementById('overview-history');
  if (!el || !state.history.length) return;
  el.innerHTML = state.history.slice(0, 5).map(e =>
    '<div class="history-item"><span class="hi-status">' + (e.status === 'success' ? '<span class="status-ok">✓</span>' : '<span class="status-err">✕</span>') + '</span><span class="hi-cmd">' + esc(e.command) + '</span><span class="hi-time">' + timeAgo(e.timestamp) + '</span></div>'
  ).join('');
}

async function refreshHistory() {
  try { state.history = (await api.get('/api/history')).history; } catch {}
}

// ── Command palette ──────────────────────────────────────────
const PALETTE_ITEMS = [
  { icon: '✨', label: 'Generate Component', action: () => openGeneratorWizard('component') },
  { icon: '🪝', label: 'Generate Hook', action: () => openGeneratorWizard('hook') },
  { icon: '📄', label: 'Generate Page', action: () => openGeneratorWizard('page') },
  { icon: '🌐', label: 'Generate Service', action: () => openGeneratorWizard('service') },
  { icon: '📦', label: 'Generate Context', action: () => openGeneratorWizard('context') },
  { icon: '🗂', label: 'Generate Layout', action: () => openGeneratorWizard('layout') },
  { icon: '📘', label: 'Generate Type', action: () => openGeneratorWizard('type') },
  { icon: '📖', label: 'Generate Storybook Story', action: () => openGeneratorWizard('storybook') },
  { icon: '▶', label: 'Start Dev Server', action: () => executeTarget('serve') },
  { icon: '🧪', label: 'Run Tests', action: () => executeTarget('test') },
  { icon: '🏗', label: 'Build Project', action: () => executeTarget('build') },
  { icon: '🔍', label: 'Run Lint', action: () => executeTarget('lint') },
  { icon: '✏️', label: 'Format Code', action: () => executeTarget('format') },
  { icon: '📥', label: 'Install Dependencies', action: () => { navigate('packages'); } },
  { icon: '🔒', label: 'Security Audit', action: () => { navigate('packages'); } },
  { icon: '🏠', label: 'Go to Overview', action: () => navigate('overview') },
  { icon: '🧱', label: 'Go to Components', action: () => navigate('components') },
  { icon: '📜', label: 'Go to History', action: () => navigate('history') },
  { icon: '📦', label: 'Go to Packages', action: () => navigate('packages') },
  { icon: '>_', label: 'Go to Terminal', action: () => navigate('terminal') },
  { icon: '🔧', label: 'Go to Configuration', action: () => navigate('config') },
  { icon: '⌨️', label: 'Keyboard Shortcuts', action: () => openHelpModal() },
];

function openPalette() {
  if (document.querySelector('.palette-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'palette-overlay';
  overlay.innerHTML = '<div class="palette"><input placeholder="What do you want to do?" id="palette-input" /><div class="palette-results" id="palette-results"></div></div>';
  document.body.appendChild(overlay);
  const input = overlay.querySelector('#palette-input');
  const results = overlay.querySelector('#palette-results');
  const render = (q) => {
    const items = q ? PALETTE_ITEMS.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : PALETTE_ITEMS;
    results.innerHTML = items.map((it, idx) => '<div class="palette-item' + (idx === 0 ? ' selected' : '') + '" data-idx="' + idx + '"><span class="pi-icon">' + it.icon + '</span>' + esc(it.label) + '</div>').join('');
    results.querySelectorAll('.palette-item').forEach((el, idx) => {
      el.addEventListener('click', () => { overlay.remove(); items[idx]?.action(); });
    });
  };
  render('');
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.remove();
    if (e.key === 'Enter') { const sel = results.querySelector('.palette-item.selected') || results.querySelector('.palette-item'); if (sel) sel.click(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...results.querySelectorAll('.palette-item')];
      const cur = items.findIndex(i => i.classList.contains('selected'));
      items.forEach(i => i.classList.remove('selected'));
      const next = e.key === 'ArrowDown' ? Math.min(cur + 1, items.length - 1) : Math.max(cur - 1, 0);
      items[next]?.classList.add('selected');
      items[next]?.scrollIntoView({ block: 'nearest' });
    }
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  input.focus();
}

// ── Help / Keyboard shortcuts modal ──────────────────────────
function openHelpModal() {
  const shortcuts = [
    { keys: '⌘ K', desc: 'Open command palette' },
    { keys: '⌘ G', desc: 'Go to Generate page' },
    { keys: '⌘ ⇧ R', desc: 'Go to Run page' },
    { keys: '⌘ `', desc: 'Go to Terminal page' },
    { keys: '⌘ ,', desc: 'Go to Configuration' },
    { keys: 'Escape', desc: 'Close dialogs and modals' },
  ];
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:440px">
      <div class="modal-header"><h2>⌨️ Keyboard Shortcuts</h2><button class="icon-btn modal-close">✕</button></div>
      <div class="modal-body" style="padding:8px 0">
        ${shortcuts.map(s => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 20px;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">${esc(s.desc)}</span><kbd style="font-size:11px;background:var(--bg);border:1px solid var(--border);border-radius:3px;padding:2px 8px;color:var(--text);font-family:var(--mono)">${esc(s.keys)}</kbd></div>`).join('')}
      </div>
      <div style="padding:16px 20px;font-size:11px;color:var(--text2);border-top:1px solid var(--border)">
        Tip: Click the search bar or press ⌘K to quickly find any command.
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── Confirmation dialog ──────────────────────────────────────
function confirmDialog(title, message, confirmLabel = 'Confirm') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px">
        <div class="modal-header"><h2>${esc(title)}</h2><button class="icon-btn modal-close">✕</button></div>
        <div class="modal-body" style="padding:16px 20px;font-size:13px;color:var(--text2)">${esc(message)}</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid var(--border)">
          <button class="btn btn-sm" id="confirm-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="confirm-ok" style="background:var(--error)">${esc(confirmLabel)}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.modal-close').addEventListener('click', () => { overlay.remove(); resolve(false); });
    overlay.querySelector('#confirm-cancel').addEventListener('click', () => { overlay.remove(); resolve(false); });
    overlay.querySelector('#confirm-ok').addEventListener('click', () => { overlay.remove(); resolve(true); });
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
  });
}

// ── Keyboard shortcuts ───────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const meta = e.metaKey || e.ctrlKey;
  // ⌘K — Command palette
  if (meta && e.key === 'k') { e.preventDefault(); openPalette(); return; }
  // ⌘G — Generate
  if (meta && e.key === 'g') { e.preventDefault(); navigate('generate'); return; }
  // ⌘R — Run (only with shift to avoid browser reload)
  if (meta && e.shiftKey && e.key === 'R') { e.preventDefault(); navigate('run'); return; }
  // ⌘` — Terminal
  if (meta && e.key === '`') { e.preventDefault(); navigate('terminal'); return; }
  // ⌘, — Config
  if (meta && e.key === ',') { e.preventDefault(); navigate('config'); return; }
  // Escape — close modals/palette
  if (e.key === 'Escape') {
    document.querySelector('.palette-overlay')?.remove();
    document.querySelector('.modal-overlay')?.remove();
  }
});

// Focus search on ⌘K
document.getElementById('cmd-search')?.addEventListener('focus', (e) => { e.target.blur(); openPalette(); });

// ── Help button ──────────────────────────────────────────────
document.getElementById('help-btn')?.addEventListener('click', () => openHelpModal());

// ── Theme toggle ─────────────────────────────────────────────
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const html = document.documentElement;
  const cur = html.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('theme-toggle').textContent = next === 'dark' ? '🌙' : '☀️';
  try { localStorage.setItem('rcli-theme', next); } catch {}
});

// Restore theme
try {
  const saved = localStorage.getItem('rcli-theme');
  if (saved) { document.documentElement.setAttribute('data-theme', saved); document.getElementById('theme-toggle').textContent = saved === 'dark' ? '🌙' : '☀️'; }
} catch {}

// ── Initialization ───────────────────────────────────────────
async function init() {
  renderSidebar();
  renderPage();
  try {
    state.info = await api.get('/api/info');
    document.getElementById('topbar-project').textContent = state.info.project?.name || state.info.cwd.split('/').pop() || 'No project';
    document.getElementById('topbar-version').textContent = 'v' + state.info.cliVersion;
  } catch (e) {
    document.getElementById('topbar-project').textContent = 'Error loading';
  }
  try {
    const gdata = await api.get('/api/generators');
    state.generators = gdata.generators || [];
  } catch {}
  try { state.history = (await api.get('/api/history')).history; } catch {}
  await loadProcesses();
  connectWebSocket();
  renderPage();
}

init();

