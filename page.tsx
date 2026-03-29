:root {
  --bg: #0b1020;
  --panel: #121936;
  --panel-2: #182147;
  --border: #2c386d;
  --text: #edf2ff;
  --muted: #a7b3de;
  --good: #37d39a;
  --warn: #ffb84d;
  --bad: #ff6f6f;
  --accent: #84a8ff;
}

* {
  box-sizing: border-box;
}

html, body {
  padding: 0;
  margin: 0;
  background: linear-gradient(180deg, #09101e 0%, #0d1430 100%);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

a {
  color: var(--accent);
  text-decoration: none;
}

button, input, select {
  font: inherit;
}

.container {
  width: min(1320px, calc(100vw - 32px));
  margin: 0 auto;
}

.page {
  padding: 28px 0 56px;
}

.hero {
  display: grid;
  gap: 14px;
  margin-bottom: 22px;
}

.hero h1 {
  margin: 0;
  font-size: 2.2rem;
  line-height: 1.1;
}

.hero p {
  margin: 0;
  color: var(--muted);
  max-width: 900px;
  line-height: 1.5;
}

.grid {
  display: grid;
  gap: 16px;
}

.filters {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

@media (max-width: 1000px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 1.75rem;
  }
}

.card {
  background: rgba(18, 25, 54, 0.9);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
}

.field {
  display: grid;
  gap: 8px;
}

.label {
  font-size: 0.9rem;
  color: var(--muted);
}

.input,
.select {
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.button {
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
  padding: 11px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.08s ease, opacity 0.08s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button.primary {
  background: linear-gradient(180deg, #3064ff, #264cbe);
  border-color: #527fff;
}

.kpi-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 16px;
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

.kpi-value {
  font-size: 1.55rem;
  font-weight: 700;
  margin-top: 8px;
}

.muted {
  color: var(--muted);
}

.good { color: var(--good); }
.warn { color: var(--warn); }
.bad { color: var(--bad); }

.section-title {
  margin: 8px 0 14px;
  font-size: 1.2rem;
}

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

.table th, .table td {
  padding: 12px 10px;
  border-bottom: 1px solid rgba(132, 168, 255, 0.16);
  vertical-align: top;
  text-align: left;
  font-size: 0.94rem;
}

.table th {
  color: var(--muted);
  font-weight: 600;
  position: sticky;
  top: 0;
  background: rgba(18, 25, 54, 0.96);
  backdrop-filter: blur(10px);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.86rem;
  background: rgba(24, 33, 71, 0.8);
}

.small {
  font-size: 0.85rem;
}

pre.code {
  overflow-x: auto;
  background: #091128;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  font-size: 0.86rem;
  line-height: 1.45;
}
