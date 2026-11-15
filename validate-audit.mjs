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
for (const source of ['management-audit-data.js', 'team-tasks-data.js', 'audit-map-data.js', 'feedback-config.js']) {
  vm.runInContext(read(source), context, { filename: source, timeout: 1000 });
}
const auditSource = read('audit.js');
const boundary = auditSource.indexOf('\n(function () {');
assert(boundary > 0, 'audit.js: content/UI boundary not found; review the validator before executing new code');
vm.runInContext(auditSource.slice(0, boundary), context, { filename: 'audit.js:content', timeout: 1000 });
const { flowwaveFindings: findings, FlowWaveManagementAudit: management, FlowWaveTeamTasks: backlog, FlowWaveAuditMap: map, FlowWaveFeedbackConfig: feedback } = context.window;
const tasks = backlog.tasks;
const findingIDs = new Set(findings.map(item => item.id));
const taskIDs = new Set(tasks.map(item => item.id));
const screenIDs = new Set(Object.keys(map.screens));

check('Canonical JSON and generated browser data agree', () => {
  equal(management, json('management-audit.json'), 'management data differs from JSON');
  equal(backlog, json('team-tasks.json'), 'task data differs from JSON');
  equal(map, json('audit-map.json'), 'audit map data differs from JSON');
});
check('38 findings, 28 tasks, 22 screens and 88 stable discussion identities', () => {
  assert.equal(findings.length, 38); assert.equal(tasks.length, 28); assert.equal(screenIDs.size, 22);
  unique(findings.map(item => item.id), 'findings'); unique(tasks.map(item => item.id), 'tasks');
  assert.equal(Object.keys(feedback.topics).length, 88);
  unique(Object.values(feedback.topics).map(topic => topic.term), 'discussion terms');
  const expectedTopics = [
    ...findings.map(item => ({ key: `finding-${item.id}`, kind: 'finding', id: item.id, anchor: item.id })),
    ...tasks.map(item => ({ key: `task-${item.id}`, kind: 'task', id: item.id, anchor: `task-${item.id}` })),
    ...[...screenIDs].map(id => ({ key: `screen-${id}`, kind: 'screen', id, anchor: `screen-${id}` }))
  ];
  equal(Object.keys(feedback.topics).sort(), expectedTopics.map(item => item.key).sort(), 'topic keys');
  for (const expected of expectedTopics) {
    const actual = feedback.topics[expected.key];
    for (const key of ['key', 'kind', 'id', 'anchor']) assert.equal(actual[key], expected[key], `${expected.key}: ${key}`);
    assert.equal(actual.term, `flowwave-audit-2026-11-13/${expected.kind}/${expected.id}`, `${expected.key}: stable term changed`);
  }
  for (const [id, screen] of Object.entries(map.screens)) assert.equal(feedback.topics[`screen-${id}`].title, screen.title, `${id}: screen title disagrees`);
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
    assert(['Befund', 'Zielerweiterung', 'Integration', 'Abnahmepaket', 'Befund + Konzept', 'Auditpaket', 'Auditbefund'].includes(task.kind), `${task.id}: unknown task kind`);
    assert(task.acceptance.length && task.acceptance.every(item => item.trim()), `${task.id}: no acceptance criteria`);
    assert(task.sources.length && task.screens.length, `${task.id}: missing source/screen`);
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
  equal(rows.shift(), ['ID', 'Priorität', 'Bereich', 'Titel', 'Art', 'Status', 'Zuständigkeit (Rolle)', 'Abhängigkeiten', 'Findings', 'Ziel', 'Umsetzung', 'Abnahmekriterien', 'Screens', 'Audit-Link'], 'CSV columns');
  assert.equal(rows.length, tasks.length, 'CSV row count');
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    equal(rows[i], [task.id, task.priority, task.area, task.title, task.kind, task.status, task.owner, task.depends.join(' · '), task.sources.join(' · '), task.outcome, task.work, task.acceptance.map((value, n) => `${n + 1}. ${value}`).join('\n'), task.screens.join(' · '), `${feedback.canonicalURL}#task-${task.id}`], `CSV ${task.id}`);
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
const routeIDs = new Set([...findingIDs, ...[...taskIDs].map(id => `task-${id}`), ...[...screenIDs].map(id => `screen-${id}`), ...management.areas.map(area => `area-${area.id}`), ...['overview', 'findings', 'screens', 'tasks', 'method'].map(id => `audit-panel-${id}`)]);
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
  }
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
  for (const name of ['feedback.html', 'feedback-host.js', 'team-tasks.csv', 'team-tasks.json', 'audit-map.json']) assert(fs.statSync(path.join(root, name)).isFile(), `missing public owner ${name}`);
});

console.log(JSON.stringify({ status: 'passed', findings: findings.length, tasks: tasks.length, screens: screenIDs.size, discussionTopics: Object.keys(feedback.topics).length, acceptanceCriteria: tasks.reduce((n, task) => n + task.acceptance.length, 0), localReferences, externalReferences, checks, limits: 'Offline source/data integrity only. External destinations are syntax-checked; browser interaction, visual quality, provider access and production acceptance are separate checks.' }, null, 2));
