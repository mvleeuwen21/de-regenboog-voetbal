const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app      = express();
const PORT     = process.env.PORT || 3000;
const PASSWORD = process.env.APP_PASSWORD || 'regenboog';
const DATA_FILE = path.join(__dirname, 'appdata.json');

app.use(express.json());
app.use(express.static(__dirname));   // serveert index.html + evt. andere statische bestanden

// ── Auth middleware ───────────────────────────────────────────
function checkAuth(req, res, next) {
  const pw = req.headers['x-password'];
  if (pw !== PASSWORD) return res.status(401).json({ error: 'Ongeldig wachtwoord' });
  next();
}

// ── Wachtwoord verifiëren ─────────────────────────────────────
app.post('/api/verify', (req, res) => {
  if (req.body.password === PASSWORD) res.json({ ok: true });
  else res.status(401).json({ ok: false });
});

// ── Data ophalen ──────────────────────────────────────────────
app.get('/api/data', checkAuth, (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json(null);
    res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  } catch { res.json(null); }
});

// ── Data opslaan ──────────────────────────────────────────────
app.post('/api/data', checkAuth, (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Alle andere routes → index.html ──────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`⚽ De Regenboog app draait op http://localhost:${PORT}`);
});
