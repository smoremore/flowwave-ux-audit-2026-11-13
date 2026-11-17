#!/usr/bin/env node
/* Finite, offline integrity check for the published audit, using its real data owners.
   This checks content and references, not browser behavior or production acceptance. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const json = name => JSON.parse(read(name));
const plain = value => JSON.parse(JSON.stringify(value));
const equal = (actual, expected, context) => assert.deepEqual(plain(actual), plain(expected), context);
const unique = (values, context) => assert.equal(new Set(values).size, values.length, `${context}: duplicate ID/reference`);
const known = (id, set, context) => assert(set.has(id), `${context}: unknown reference ${id}`);
const content = value => typeof value === 'string' ? !!value.trim() : Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string' && !!item.trim());
const checks = [];
const check = (name, run) => { run(); checks.push(name); };
const context = vm.createContext({ window: {} });
for (const source of ['management-audit-data.js', 'team-tasks-data.js', 'audit-map-data.js', 'feature-history-data.js', 'feedback-config.js']) {
  vm.runInContext(read(source), context, { filename: source, timeout: 1000 });
}
const auditSource = read('audit.js');
const boundary = auditSource.indexOf('\n(function () {');
assert(boundary > 0, 'audit.js: content/UI boundary not found; review the validator before executing new code');
vm.runInContext(auditSource.slice(0, boundary), context, { filename: 'audit.js:content', timeout: 1000 });
const { flowwaveFindings: findings, FlowWaveManagementAudit: management, FlowWaveTeamTasks: backlog, FlowWaveAuditMap: map, FlowWaveFeatureHistory: history, FlowWaveFeedbackConfig: feedback } = context.window;
const tasks = backlog.tasks;
assert(history && Array.isArray(history.entries), 'feature history owner missing');
const historyEntries = history.entries;
const findingIDs = new Set(findings.map(item => item.id));
const taskIDs = new Set(tasks.map(item => item.id));
const screenIDs = new Set(Object.keys(map.screens));
const historyIDs = new Set(historyEntries.map(item => item.id));

check('Canonical JSON and generated browser data agree', () => {
  equal(management, json('management-audit.json'), 'management data differs from JSON');
  equal(backlog, json('team-tasks.json'), 'task data differs from JSON');
  equal(map, json('audit-map.json'), 'audit map data differs from JSON');
  equal(history, json('feature-history.json'), 'feature history data differs from JSON');
});
check('38 findings, 29 tasks, 22 screens, 19 history entries and 108 stable discussion identities', () => {
  assert.equal(findings.length, 38); assert.equal(tasks.length, 29); assert.equal(screenIDs.size, 22); assert.equal(historyEntries.length, 19);
  unique(findings.map(item => item.id), 'findings'); unique(tasks.map(item => item.id), 'tasks');
  unique(historyEntries.map(item => item.id), 'feature history');
  assert.equal(Object.keys(feedback.topics).length, 108);
  unique(Object.values(feedback.topics).map(topic => topic.term), 'discussion terms');
  const expectedTopics = [
    ...findings.map(item => ({ key: `finding-${item.id}`, kind: 'finding', id: item.id, anchor: item.id })),
    ...tasks.map(item => ({ key: `task-${item.id}`, kind: 'task', id: item.id, anchor: `task-${item.id}` })),
    ...[...screenIDs].map(id => ({ key: `screen-${id}`, kind: 'screen', id, anchor: `screen-${id}` })),
    ...historyEntries.map(item => ({ key: `regression-${item.id}`, kind: 'regression', id: item.id, anchor: `history-${item.id}` }))
  ];
  equal(Object.keys(feedback.topics).sort(), expectedTopics.map(item => item.key).sort(), 'topic keys');
  for (const expected of expectedTopics) {
    const actual = feedback.topics[expected.key];
    for (const key of ['key', 'kind', 'id', 'anchor']) assert.equal(actual[key], expected[key], `${expected.key}: ${key}`);
    assert.equal(actual.term, `flowwave-audit-2026-11-13/${expected.kind}/${expected.id}`, `${expected.key}: stable term changed`);
  }
  for (const [id, screen] of Object.entries(map.screens)) assert.equal(feedback.topics[`screen-${id}`].title, screen.title, `${id}: screen title disagrees`);
  for (const entry of historyEntries) assert.equal(feedback.topics[`regression-${entry.id}`].title, entry.title, `${entry.id}: history title disagrees`);
  const preservedFindings = 'B5 DM1 AC3 AC1 AC2 AC4 L1 L2 DM2 D1 R2 S2 S1 R1 B3 B1 B2 N1 C1 I1 N4 U1 N2 R5 R4 R3 R6 F1 F2 M1 V1 U2 U3 R7 N3 B4 B6 AC5'.split(' ');
  const preservedTasks = [...Array.from({length:18},(_,n)=>`FW-${String(n+1).padStart(2,'0')}`), 'AU-01', 'AU-02', ...Array.from({length:8},(_,n)=>`MG-${String(n+1).padStart(2,'0')}`)];
  const preservedScreens = 'designs listings review uploadqueue upload create sets import collections remaster vectorize upscale halftone effects repairs autopilot checks management archive live activity settings'.split(' ');
  const preservedTopics = [...preservedFindings.map(id=>['finding',id]),...preservedTasks.map(id=>['task',id]),...preservedScreens.map(id=>['screen',id])];
  assert.equal(preservedTopics.length,88,'prior discussion catalogue changed');
  for(const [kind,id]of preservedTopics){
    const topic=feedback.topics[`${kind}-${id}`];assert(topic,`prior ${kind}-${id} discussion missing`);
    assert.equal(topic.term,`flowwave-audit-2026-11-13/${kind}/${id}`,`prior ${kind}-${id} discussion identity changed`);
  }
});
check('Historical comparisons retain exact revisions, typed outcomes and valid cross-links', () => {
  const sha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const version = value => typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value);
  assert.equal(history.first.commit, '726a3e3ee518cc33fb92f60205c6dcfe48a9fbbd', 'first source revision changed');
  assert.equal(history.first.version, '1.3.0'); assert.equal(history.first.date, '2026-08-26');
  assert.equal(history.baseline.commit, '7b560983b36ceb7427e27404bb305da06fb38c08', 'frozen current source revision changed');
  assert.equal(history.baseline.version, '1.4.292'); assert.equal(history.baseline.date, '2026-11-17');
  assert.equal(history.commitCount, 2896, 'reachable-history scope count changed');
  assert(content(history.method) && content(history.limits), 'history method or limitations missing');
  assert(history.coverage.length >= 3 && history.coverage.every(item => content(item.area) && content(item.result)), 'history coverage missing');
  assert(history.milestones.length >= 2, 'history timeline missing');
  unique(history.milestones.map(item => item.commit), 'history milestones');
  for (const milestone of [history.first, history.baseline, ...history.milestones]) {
    assert(sha(milestone.commit) && date(milestone.date) && version(milestone.version), 'incomplete source milestone');
    assert.equal(milestone.onCurrentHistory, true, `${milestone.commit}: milestone not on frozen current history`);
  }
  assert(history.milestones.some(item => item.commit === history.first.commit), 'first milestone omitted');
  assert(history.milestones.some(item => item.commit === history.baseline.commit), 'current milestone omitted');
  const statuses = new Set(['lost_ui', 'copy_gap', 'restored', 'historical_defect', 'intentional', 'preserved', 'expanded']);
  for (const entry of historyEntries) {
    assert(/^H\d{2}$/.test(entry.id), `${entry.id}: invalid history ID`);
    for (const field of ['title', 'area', 'before', 'now', 'impact', 'recommendation']) assert(content(entry[field]), `${entry.id}: missing ${field}`);
    known(entry.status, statuses, `${entry.id}: status`);
    assert(entry.evidence.length >= 2, `${entry.id}: historical comparison has too little evidence`);
    assert(entry.evidence.some(item => item.commit === history.baseline.commit), `${entry.id}: no current source evidence`);
    assert(entry.evidence.some(item => item.commit !== history.baseline.commit), `${entry.id}: no earlier source evidence`);
    unique(entry.screens, `${entry.id}.screens`); assert(entry.screens.length, `${entry.id}: no screen context`);
    entry.screens.forEach(id => known(id, screenIDs, entry.id));
    for (const [field, owners] of [['relatedFindings', findingIDs], ['relatedTasks', taskIDs]]) {
      assert(Array.isArray(entry[field]), `${entry.id}.${field}: list missing`);
      unique(entry[field], `${entry.id}.${field}`); entry[field].forEach(id => known(id, owners, `${entry.id}.${field}`));
    }
    for (const evidence of entry.evidence) {
      assert(sha(evidence.commit) && date(evidence.date) && version(evidence.version), `${entry.id}: incomplete exact-revision source metadata`);
      assert(typeof evidence.file === 'string' && evidence.file && !path.posix.isAbsolute(evidence.file) && !evidence.file.split('/').includes('..'), `${entry.id}: invalid source path`);
      assert(Number.isSafeInteger(evidence.line) && evidence.line > 0, `${entry.id}: invalid source line`);
      assert(content(evidence.detail), `${entry.id}: source explanation missing`);
    }
    if (entry.status === 'lost_ui') {
      assert(content(entry.intent) && content(entry.acceptance), `${entry.id}: open loss needs explicit intent/decision and acceptance criteria`);
      assert(tasks.some(task => task.historySources?.includes(entry.id)), `${entry.id}: open loss has no scoped team task`);
    }
  }
  assert.equal(historyEntries.filter(item => item.status === 'lost_ui').length, 1, 'current UI-loss count changed');
  assert.equal(historyEntries.filter(item => item.status === 'copy_gap').length, 1, 'current copy-gap count changed');
});
check('Every finding has one audit area, task coverage and screen context', () => {
  const assigned = management.areas.flatMap(area => area.ids);
  unique(management.areas.map(area => area.id), 'audit areas'); unique(assigned, 'finding-area assignments');
  equal([...assigned].sort(), [...findingIDs].sort(), 'finding-area coverage');
  for (const finding of findings) {
    assert(['P1', 'P2'].includes(finding.priority), `${finding.id}: unknown evidence priority`);
    for (const field of ['title', 'summary', 'problem', 'suggestion', 'preserve']) assert(content(finding[field]), `${finding.id}: missing ${field}`);
    assert(content(finding.acceptance), `${finding.id}: no acceptance criteria`);
    assert(Array.isArray(finding.evidence) && finding.evidence.length, `${finding.id}: no evidence`);
    assert(tasks.some(task => task.sources.includes(finding.id)), `${finding.id}: no team task`);
    assert(Object.values(map.screens).some(screen => screen.findings.includes(finding.id)), `${finding.id}: no screen context`);
  }
});
check('Tasks and screens reference real owners; prerequisites are acyclic', () => {
  for (const [id, screen] of Object.entries(map.screens)) {
    assert(screen.title?.trim(), `${id}: no title`); assert(screen.findings.length, `${id}: no finding context`);
    unique(screen.findings, `${id}: finding context`);
    screen.findings.forEach(source => known(source, findingIDs, id));
    assert(tasks.some(task => task.screens.includes(id)), `${id}: no task coverage`);
  }
  for (const task of tasks) {
    for (const field of ['title', 'area', 'kind', 'owner', 'status', 'outcome', 'work']) assert(task[field]?.trim(), `${task.id}: missing ${field}`);
    assert(Object.hasOwn(backlog.priorityMeaning, task.priority), `${task.id}: unknown priority`);
    assert(['Befund', 'Zielerweiterung', 'Integration', 'Abnahmepaket', 'Befund + Konzept', 'Auditpaket', 'Auditbefund', 'Historienbefund'].includes(task.kind), `${task.id}: unknown task kind`);
    assert(task.acceptance.length && task.acceptance.every(item => item.trim()), `${task.id}: no acceptance criteria`);
    const historicalSources = task.historySources || [];
    assert(Array.isArray(task.sources) && Array.isArray(historicalSources), `${task.id}: source lists missing`);
    assert((task.sources.length || historicalSources.length) && task.screens.length, `${task.id}: missing source/screen`);
    if (!task.sources.length) assert.equal(task.kind, 'Historienbefund', `${task.id}: a history-only source requires explicit historical task kind`);
    unique(historicalSources, `${task.id}.historySources`);
    historicalSources.forEach(id => {
      known(id, historyIDs, `${task.id}.historySources`);
      assert(historyEntries.find(item => item.id === id).relatedTasks.includes(task.id), `${task.id}: history back-link missing at ${id}`);
    });
    for (const [field, owner] of [['sources', findingIDs], ['screens', screenIDs], ['depends', taskIDs]]) {
      unique(task[field], `${task.id}.${field}`); task[field].forEach(id => known(id, owner, `${task.id}.${field}`));
    }
    assert(!task.depends.includes(task.id), `${task.id}: depends on itself`);
  }
  const visited = new Set(), stack = new Set(), byID = new Map(tasks.map(item => [item.id, item]));
  function visit(id) { assert(!stack.has(id), `dependency cycle at ${id}`); if (visited.has(id)) return; stack.add(id); byID.get(id).depends.forEach(visit); stack.delete(id); visited.add(id); }
  tasks.forEach(task => visit(task.id));
});

// RFC 4180-style fields, including embedded newlines, commas and escaped quotes.
function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) { if (char === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (char === '"') quoted = false; else field += char; }
    else if (char === '"') { assert.equal(field, '', 'CSV quote inside unquoted field'); quoted = true; }
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\r' || char === '\n') { if (char === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  assert(!quoted, 'CSV unterminated quote');
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
check('CSV contains the exact canonical tasks, criteria, screens and direct links', () => {
  const rows = parseCSV(read('team-tasks.csv'));
  equal(rows.shift(), ['ID', 'Priorität', 'Bereich', 'Titel', 'Art', 'Status', 'Zuständigkeit (Rolle)', 'Abhängigkeiten', 'Findings', 'Historienbelege', 'Ziel', 'Umsetzung', 'Abnahmekriterien', 'Screens', 'Audit-Link'], 'CSV columns');
  assert.equal(rows.length, tasks.length, 'CSV row count');
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    equal(rows[i], [task.id, task.priority, task.area, task.title, task.kind, task.status, task.owner, task.depends.join(' · '), task.sources.join(' · '), (task.historySources || []).join(' · '), task.outcome, task.work, task.acceptance.map((value, n) => `${n + 1}. ${value}`).join('\n'), task.screens.join(' · '), `${feedback.canonicalURL}#task-${task.id}`], `CSV ${task.id}`);
  }
});

function unescapeAttribute(value) { return value.replace(/&(?:amp|quot|apos|lt|gt|#39);/g, entity => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&#39;': "'" }[entity])); }
function tags(html) {
  return [...html.matchAll(/<([a-z][\w:-]*)\b([^>]*?)>/gi)].map(match => {
    const attrs = Object.fromEntries([...match[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(attr => [attr[1].toLowerCase(), unescapeAttribute(attr[2] ?? attr[3])]));
    return { name: match[1].toLowerCase(), attrs };
  });
}
const pages = new Map(['index.html', 'concept.html', 'feedback.html'].map(name => [name, tags(read(name))]));
const staticIDs = new Map([...pages].map(([name, nodes]) => [name, new Set(nodes.filter(node => node.attrs.id).map(node => node.attrs.id))]));
const routeIDs = new Set([...findingIDs, ...[...taskIDs].map(id => `task-${id}`), ...[...screenIDs].map(id => `screen-${id}`), ...[...historyIDs].map(id => `history-${id}`), ...management.areas.map(area => `area-${area.id}`), ...['overview', 'findings', 'screens', 'tasks', 'method', 'regressions'].map(id => `audit-panel-${id}`)]);
function validAnchor(target, hash) {
  if (!hash) return;
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  assert(staticIDs.get(target)?.has(id) || target === 'index.html' && routeIDs.has(id) || target === 'concept.html' && [...screenIDs].some(screen => id === `screen-${screen}`), `${target}: missing anchor #${id}`);
}
let localReferences = 0, externalReferences = 0;
function validateURL(raw, from, anchor = false) {
  if (!raw || /^(?:data:|mailto:|tel:)/i.test(raw)) return;
  assert(!/^javascript:/i.test(raw), `${from}: javascript URL`);
  const base = new URL(from, feedback.canonicalURL);
  const url = new URL(raw, base), site = new URL(feedback.canonicalURL);
  if (url.origin !== site.origin || !url.pathname.startsWith(site.pathname)) { assert(['http:', 'https:'].includes(url.protocol), `${from}: unsupported URL scheme ${url.protocol}`); externalReferences++; return; }
  let relative = decodeURIComponent(url.pathname.slice(site.pathname.length));
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  const target = path.resolve(root, relative);
  assert(target.startsWith(`${root}${path.sep}`), `${from}: URL escapes the report`);
  assert(fs.statSync(target).isFile(), `${from}: missing asset/link ${raw}`);
  if (anchor) validAnchor(relative, url.hash);
  localReferences++;
}
check('HTML IDs, assets, local links and dynamic route targets exist', () => {
  for (const [name, nodes] of pages) {
    unique(nodes.filter(node => node.attrs.id).map(node => node.attrs.id), `${name}: static IDs`);
    for (const { name: tag, attrs } of nodes) {
      if (tag === 'a') validateURL(attrs.href, name, true);
      if (['script', 'img', 'iframe', 'source'].includes(tag)) validateURL(attrs.src, name);
      if (tag === 'link') validateURL(attrs.href, name);
      if (attrs['data-feedback-topic']) known(attrs['data-feedback-topic'], new Set(Object.keys(feedback.topics)), `${name}: feedback`);
      if (attrs['data-screen']) known(attrs['data-screen'], screenIDs, `${name}: screen route`);
    }
    const scripts = nodes.filter(node => node.name === 'script' && node.attrs.src).map(node => node.attrs.src.split('?')[0]);
    if (scripts.includes('feedback-config.js')) assert(scripts.includes('feature-history-data.js') && scripts.indexOf('feature-history-data.js') < scripts.indexOf('feedback-config.js'), `${name}: history data must load before feedback identities`);
  }
  const reportTabs = pages.get('index.html').filter(node => node.attrs['data-audit-tab']).map(node => node.attrs['data-audit-tab']);
  unique(reportTabs, 'report tabs'); equal(reportTabs.sort(), ['overview', 'findings', 'screens', 'tasks', 'method', 'regressions'].sort(), 'six report tabs');
  for (const name of ['index.html', 'concept.html']) {
    const registry = read(name).match(/<div class="fw-route-registry" hidden>([\s\S]*?)<\/div>/)?.[1];
    assert(registry, `${name}: explicit route registry missing`);
    const routes = tags(registry).filter(node => node.attrs['data-screen']).map(node => node.attrs['data-screen']);
    unique(routes, `${name}: registered screen links`); equal(routes.sort(), [...screenIDs].sort(), `${name}: screen route coverage`);
  }
  for (const name of fs.readdirSync(root).filter(name => /\.(?:js|css)$/.test(name))) {
    const source = read(name);
    if (name.endsWith('.css')) for (const match of source.matchAll(/url\(\s*["']?([^\s)"']+)["']?\s*\)/g)) validateURL(match[1], name);
    if (name.endsWith('.js')) for (const match of source.matchAll(/href=["'](#[^"'\s]*|[^"'\s]+\.html(?:#[^"'\s]*)?)["']/g)) if (!match[1].includes('${')) validateURL(match[1], 'index.html', true);
  }
  for (const name of ['feedback.html', 'feedback-host.js', 'team-tasks.csv', 'team-tasks.json', 'audit-map.json', 'feature-history.json', 'feature-history-data.js']) assert(fs.statSync(path.join(root, name)).isFile(), `missing public owner ${name}`);
});

console.log(JSON.stringify({ status: 'passed', findings: findings.length, tasks: tasks.length, screens: screenIDs.size, historyEntries: historyEntries.length, discussionTopics: Object.keys(feedback.topics).length, acceptanceCriteria: tasks.reduce((n, task) => n + task.acceptance.length, 0), localReferences, externalReferences, checks, limits: 'Offline source/data integrity only. Historical source metadata is structurally checked here; exact Git ancestry/file/line checks are recorded separately. External destinations are syntax-checked; browser interaction, visual quality, provider access and production acceptance are separate checks.' }, null, 2));
