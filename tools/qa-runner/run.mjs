#!/usr/bin/env node
// Runner de QA visual con Playwright: corre los casos de un archivo <slug>.qa.mjs en cada
// tema (dark/light) en viewport de notebook, en Brave headless, y devuelve SOLO un resumen compacto.
// El objetivo es ahorrar tokens: toda la navegación pasa fuera del contexto del agente.
//
// Uso:
//   QA_EMAIL=… QA_PASSWORD=… node tools/qa-runner/run.mjs <archivo.qa.mjs> [--only TC-01,TC-03] [--out tmp/qa/<slug>]
//
// Variables opcionales: QA_BASE_URL (default http://localhost:5173), QA_BROWSER (ruta al ejecutable),
// QA_HEADED=1 para ver el navegador.
import { chromium } from 'playwright-core';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// La app se usa en notebook: solo se prueba desktop (mobile/tablet quedaron fuera de QA).
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
};
const DEFAULT_COMBOS = ['desktop-dark'];
const BROWSER_CANDIDATES = [
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

if (!file) {
  console.error('Falta el archivo de escenarios: node tools/qa-runner/run.mjs <archivo.qa.mjs>');
  process.exit(2);
}

const baseURL = process.env.QA_BASE_URL || 'http://localhost:5173';
const suite = (await import(pathToFileURL(path.resolve(file)).href)).default;
const slug = suite.slug || path.basename(file).replace(/\.qa\.mjs$/, '');
const outDir = path.resolve(flag('out') || `tmp/qa/${slug}`);
const only = flag('only')?.split(',').map((s) => s.trim());
const executablePath = process.env.QA_BROWSER || BROWSER_CANDIDATES.find((p) => existsSync(p));

if (!executablePath) {
  console.error('No encontré Brave/Chrome. Definí QA_BROWSER con la ruta al ejecutable.');
  process.exit(2);
}

await mkdir(outDir, { recursive: true });
const authFile = path.join(outDir, '.auth.json');

const browser = await chromium.launch({ executablePath, headless: !process.env.QA_HEADED });

// Login una sola vez; la sesión (authToken en localStorage) se reutiliza en todos los casos.
async function ensureAuth() {
  if (suite.auth === false) return undefined;
  if (existsSync(authFile)) return authFile;
  const { QA_EMAIL, QA_PASSWORD } = process.env;
  if (!QA_EMAIL || !QA_PASSWORD) {
    throw new Error('Faltan QA_EMAIL / QA_PASSWORD (o poné auth: false en la suite).');
  }
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto('/login');
  await page.fill('#email', QA_EMAIL);
  await page.fill('#password', QA_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 });
  await context.storageState({ path: authFile });
  await context.close();
  return authFile;
}

async function runCombo(testCase, combo, storageState) {
  const [vp, theme] = combo.split('-');
  if (!VIEWPORTS[vp]) {
    return {
      id: testCase.id, combo, status: 'fail', facts: {}, evidence: '-',
      failures: [`viewport "${vp}" no se prueba: usá desktop-dark / desktop-light`],
    };
  }
  const context = await browser.newContext({
    baseURL,
    viewport: VIEWPORTS[vp],
    storageState,
  });
  // El script inline de index.html lee localStorage.theme antes de pintar.
  await context.addInitScript((t) => localStorage.setItem('theme', t), theme);
  const page = await context.newPage();

  const consoleErrors = [];
  const badRequests = [];
  page.on('console', (msg) => {
    // El navegador pide /favicon.ico por su cuenta; ese 404 no es de la app.
    if (msg.type() === 'error' && !msg.location().url?.endsWith('/favicon.ico')) {
      consoleErrors.push(msg.text().slice(0, 200));
    }
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message.slice(0, 200)}`));
  page.on('response', (res) => {
    const allowed = testCase.allowStatus || [];
    if (res.status() >= 400 && !allowed.includes(res.status())) {
      badRequests.push(`${res.status()} ${res.request().method()} ${new URL(res.url()).pathname}`);
    }
  });

  const shot = path.join(outDir, `${testCase.id}-${combo}.jpg`);
  const result = { id: testCase.id, combo, status: 'pass', facts: {}, failures: [] };
  try {
    if (testCase.path) {
      await page.goto(testCase.path);
      await page.waitForLoadState('networkidle');
    }
    if (testCase.steps) await testCase.steps(page, { vp, theme });
    const out = testCase.check ? await testCase.check(page, { vp, theme }) : { pass: true };
    result.facts = out.facts || {};
    if (out.pass === false) {
      result.status = 'fail';
      result.failures.push(out.reason || 'check devolvió pass: false');
    }
  } catch (err) {
    result.status = 'fail';
    result.failures.push(`excepción: ${err.message.split('\n')[0].slice(0, 300)}`);
  }

  if (consoleErrors.length && !testCase.allowConsoleErrors) {
    result.status = 'fail';
    result.failures.push(`consola: ${[...new Set(consoleErrors)].slice(0, 3).join(' | ')}`);
  }
  if (badRequests.length) {
    result.status = 'fail';
    result.failures.push(`red: ${[...new Set(badRequests)].slice(0, 3).join(' | ')}`);
  }

  await page.screenshot({ path: shot, type: 'jpeg', quality: 60, fullPage: !!testCase.fullPage });
  result.evidence = path.relative(process.cwd(), shot);
  await context.close();
  return result;
}

const results = [];
try {
  const storageState = await ensureAuth();
  const cases = suite.cases.filter((c) => !only || only.includes(c.id));
  for (const testCase of cases) {
    for (const combo of testCase.combos || suite.combos || DEFAULT_COMBOS) {
      results.push(await runCombo(testCase, combo, storageState));
    }
  }
} catch (err) {
  console.error(`QA abortado: ${err.message}`);
  await browser.close();
  process.exit(2);
}
await browser.close();

const resultsFile = path.join(outDir, 'results.json');
const previous = existsSync(resultsFile) ? JSON.parse(await readFile(resultsFile, 'utf8')) : [];
const merged = [
  ...previous.filter((p) => !results.some((r) => r.id === p.id && r.combo === p.combo)),
  ...results,
];
await writeFile(resultsFile, JSON.stringify(merged, null, 2));

// Salida compacta: una línea por caso/combo y detalle solo de los fallos.
for (const r of results) {
  const facts = Object.keys(r.facts).length ? ` · ${JSON.stringify(r.facts)}` : '';
  console.log(`${r.status === 'pass' ? '✅' : '❌'} ${r.id} ${r.combo} · ${r.evidence}${facts}`);
  for (const f of r.failures) console.log(`   ↳ ${f}`);
}
const failed = results.filter((r) => r.status !== 'pass').length;
console.log(`\n${results.length - failed}/${results.length} ok · detalle en ${path.relative(process.cwd(), resultsFile)}`);
process.exit(failed ? 1 : 0);
