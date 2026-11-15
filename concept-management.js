/* Shared, finite Management concept. Synthetic data only; no fetch, provider, files or account services. */
(() => {
  'use strict';
  const ORIGINS = { all: 'Alle', both: 'Lokal + Online', local: 'Nur lokal', online: 'Nur online' };
  const STATUSES = { all: 'Alle Kontostände', live: 'Live', draft: 'Entwurf gespeichert', removed: 'Entfernt', review: 'In Prüfung', local: 'Ohne Kontodatensatz' };
  const MARKETS = { all: 'Alle Märkte', US: 'US', DE: 'DE', GB: 'UK' };
  const TASKS = { all: 'Alle Aufgaben', sync: 'Abgleich ansehen', files: 'Dateien bereitstellen', products: 'Produkte ergänzen', draft: 'Entwurf öffnen' };
  const PAGE_SIZE = 36;
  const unique = ids => [...new Set((Array.isArray(ids) ? ids : []).map(String))];
  function resolveIds(records, ids) {
    const byId = records && typeof records.get === 'function' && typeof records.has === 'function' ? records : new Map(records.map(record => [record.id, record]));
    const asked = unique(ids);
    return { asked, rows: asked.map(id => byId.get(id)).filter(Boolean), missing: asked.filter(id => !byId.has(id)) };
  }
  const salesApplicable = record => record.online && record.status !== 'draft';
  const knownSales = record => salesApplicable(record) && Number.isFinite(record.sales);
  const salesText = record => !salesApplicable(record) ? '—' : knownSales(record) ? String(record.sales) : 'Unbekannt';
  function syncTargets(records, ids) {
    const resolved = resolveIds(records, ids);
    return { ...resolved, eligible: resolved.rows.filter(record => record.online), omitted: resolved.rows.filter(record => !record.online) };
  }
  const syncReceipt = (previous, result, at) => ({ status: result === 'error' ? 'error' : 'saved', lastValid: result === 'error' ? previous?.lastValid || null : at });
  function taskOf(record) {
    if (record.online && (record.demoSync?.status === 'error' || record.freshness !== 'current' && record.demoSync?.status !== 'saved')) return { key: 'sync', label: record.demoSync?.status === 'error' ? 'Demo fehlgeschlagen · Stand erhalten' : 'Kontostand abgleichen', action: 'sync-record', cta: 'Abgleichen (Demo)', priority: 0 };
    if (record.local && record.fileAvailability === 'missing') return { key: 'files', label: 'Dateiquelle fehlt', action: 'files', cta: 'Quelle zuordnen', priority: 1 };
    if (record.local && record.fileAvailability === 'cloud') return { key: 'files', label: 'Dateien auf diesem Mac fehlen', action: 'files', cta: 'Bereitstellen', priority: 2 };
    if (record.online && record.status === 'removed') return { key: 'products', label: 'Entfernte Produkte ansehen', action: 'products', cta: 'Produkte ergänzen', priority: 3 };
    if (record.online && record.status === 'draft') return { key: 'draft', label: 'Entwurf gespeichert', action: 'stand', cta: 'Entwurf öffnen', priority: 4 };
    return { key: 'none', label: record.online ? STATUSES[record.status] : 'Lokaler Stand verfügbar', action: 'stand', cta: 'Stand öffnen', priority: 5 };
  }
  function sortRows(rows, sort) {
    return [...rows].sort((a, b) => {
      if (sort === 'sales') {
        const aKnown = knownSales(a), bKnown = knownSales(b);
        if (aKnown !== bKnown) return aKnown ? -1 : 1;
        if (aKnown && a.sales !== b.sales) return b.sales - a.sales;
      }
      if (sort === 'tasks' && taskOf(a).priority !== taskOf(b).priority) return taskOf(a).priority - taskOf(b).priority;
      if (sort === 'newest' && a.created !== b.created) return b.created - a.created;
      if (sort === 'changed' && a.changed !== b.changed) return b.changed - a.changed;
      return a.title.localeCompare(b.title, 'de', { numeric: true }) || a.id.localeCompare(b.id);
    });
  }
  function matching(records, state, view = 'management', skipOrigin = false) {
    const q = state.query.trim().toLocaleLowerCase('de');
    return sortRows(records.filter(record =>
      (view !== 'live' || record.online) && (!state.scope || state.scope.has(record.id)) &&
      (!q || [record.id, record.title, record.brand, record.asin || '', record.series].join(' ').toLocaleLowerCase('de').includes(q)) &&
      (skipOrigin || state.origin === 'all' || record.availability === state.origin) &&
      (state.status === 'all' || record.status === state.status) &&
      (state.market === 'all' || record.markets.includes(state.market)) &&
      (state.task === 'all' || taskOf(record).key === state.task)), state.sort);
  }
  const selectionTicket = (state, ids) => Object.freeze({ revision: state.revision, ids: Object.freeze(unique(ids)) });
  function commitSelection(state, ticket) {
    if (state.revision !== ticket.revision) return false;
    state.selected = new Set(ticket.ids); state.revision++; return true;
  }
  function createRecords(coreRecords, factsFor = () => null) {
    const now = Date.parse('2026-11-15T10:00:00Z');
    const base = [...coreRecords];
    for (let i = base.length; i < 10000; i++) base.push({ id: `MG-${String(i + 1).padStart(5, '0')}`, title: `${['Coastal Days','Quiet Trails','Slow Morning','Weekend Club','Wild Garden'][i % 5]} ${String(i + 1).padStart(5, '0')}`, index: i, version: i % 3 + 1, palette: [['#c86d45','#28221a'],['#c6d6d7','#25393a'],['#cdd2ac','#363c2b']][i % 3], fields: { brand: `Studio ${i % 12 + 1}` } });
    return base.map((record, index) => {
      const source = factsFor(record.id);
      const availability = source?.availability || ['both', 'local', 'online'][index % 3];
      const local = availability !== 'online', online = availability !== 'local';
      const accountState = source?.accountState || (online ? ['Live · Demo', 'Entwurf gespeichert', 'Entfernt · Demo', 'In Prüfung'][Math.floor(index / 3) % 4] : null);
      const status = !online ? 'local' : /Entwurf/.test(accountState) ? 'draft' : /Entfernt/.test(accountState) ? 'removed' : /Prüfung/.test(accountState) ? 'review' : 'live';
      return { ...record, index, title: record.title, brand: source?.fields?.brand || record.fields?.brand || 'Ohne Marke',
        availability, local, online, status, accountState, account: source?.account || (online ? 'Beispielkonto' : null),
        asin: source?.asin || (online ? `DEMO${String(index + 1).padStart(6, '0')}` : null),
        markets: online ? (source?.markets || ['US · DE', 'DE · UK', 'US · UK · DE'][index % 3]).split(' · ').map(market => market === 'UK' ? 'GB' : market) : [],
        fileAvailability: local ? source?.fileAvailability || (index % 11 === 0 ? 'missing' : index % 5 === 0 ? 'cloud' : 'local') : null,
        freshness: online ? (source?.freshness || (index % 19 === 0 ? 'stale' : index % 23 === 0 ? 'unknown' : 'current')) : null,
        sales: online && status !== 'draft' && index % 5 !== 0 ? index % 29 : null,
        series: source?.series || `Serie ${index % 20 + 1}`, template: source?.template || 'Auto',
        created: now - index * 3600000, changed: now - (index % 97) * 3600000,
        uploadPhase: source?.uploadPhase || null };
    });
  }
  const helpers = { resolveIds, salesApplicable, knownSales, salesText, taskOf, sortRows, matching, selectionTicket, commitSelection, createRecords, syncTargets, syncReceipt, PAGE_SIZE };
  if (typeof module !== 'undefined' && module.exports) module.exports = helpers;
  if (typeof window === 'undefined') return;
  const core = window.FlowWaveConceptCore;
  if (!core) return;
  const root = document.getElementById('flowwave-bento-concept');
  const { esc, fmt, art } = core;
  const coreIds = new Set(core.records.map(record=>record.id));
  const records = createRecords(core.records, id => window.FlowWaveOperationsDemo?.managementRecord(id));
  const byId = new Map(records.map(record => [record.id, record]));
  const overrides = new Map(), plans = new Map(), productPlans = new Map(), containers = new Map(), bound = new WeakSet();
  const freshState = () => ({ query: '', origin: 'all', status: 'all', market: 'all', task: 'all', sort: 'tasks', layout: 'cards', page: 1, scope: null, selected: new Set(), revision: 0, missing: [], open: new Set() });
  const states = { management: freshState(), live: freshState() };
  const sync = { status: 'saved', lastValid: '15.11.2026, 11:00', count: records.filter(record => record.online).length, result: 'success', revision: 0, operation: null };
  function present(record) {
    const source = window.FlowWaveOperationsDemo?.managementRecord(record.id);
    const availability = source?.availability || record.availability;
    const local = availability !== 'online', online = availability !== 'local';
    const accountState = source ? source.accountState : record.accountState;
    const status = !online ? 'local' : /Entwurf/.test(accountState) ? 'draft' : /Entfernt/.test(accountState) ? 'removed' : /Prüfung/.test(accountState) ? 'review' : 'live';
    const projection = source ? { availability, local, online, accountState, status,
      brand: source.fields?.brand ?? record.brand, fields: source.fields ? { ...source.fields } : record.fields,
      series: source.series ?? record.series, template: source.template ?? record.template,
      account: source.account, asin: source.asin,
      markets: online ? String(source.markets || '').split(' · ').filter(Boolean).map(market=>market==='UK'?'GB':market) : [],
      fileAvailability: local ? source.fileAvailability : null, uploadPhase: source.uploadPhase || null } : {};
    return { ...record, ...projection, ...overrides.get(record.id) };
  }
  const allRecords = () => records.map(present);
  const date = value => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(value);
  const button = (text, action, id = '', primary = false, disabled = false) => `<button type="button" class="fw-button${primary ? ' fw-primary' : ' fw-quiet'}" data-mg-action="${action}"${id ? ` data-mg-id="${esc(id)}"` : ''}${disabled ? ' disabled' : ''}>${text}</button>`;
  const option = (key, label, value) => `<option value="${esc(key)}"${key === value ? ' selected' : ''}>${esc(label)}</option>`;
  function data(view) {
    const state = states[view], source = allRecords(), matches = matching(source, state, view), pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    state.page = Math.max(1, Math.min(state.page, pages));
    const offset = (state.page - 1) * PAGE_SIZE;
    return { source, matches, pages, offset, rows: matches.slice(offset, offset + PAGE_SIZE), facets: matching(source, state, view, true) };
  }
  function exact(ids) { return resolveIds(new Map(allRecords().map(record => [record.id, record])), ids); }
  function warning(resolved, omitted = 0) {
    return resolved.missing.length || omitted ? `<p class="fm-warning">${resolved.missing.length ? `${fmt(resolved.missing.length)} unbekannte IDs ausgenommen: ${resolved.missing.slice(0, 4).map(esc).join(', ')}. ` : ''}${omitted ? `${fmt(omitted)} ausgewählte Designs passen nicht zu dieser Aktion.` : ''} Umfang bleibt begrenzt.</p>` : '';
  }
  const listing = rows => `<div class="fm-exact-list">${rows.slice(0, 5).map(record => `<span>${esc(record.id)} · ${esc(record.title)}</span>`).join('')}${rows.length > 5 ? `<span>+ ${fmt(rows.length - 5)} weitere ausgewählte IDs</span>` : ''}</div>`;
  const fileWord = record => ({ local: 'Dateien auf diesem Mac', cloud: 'Cloud · Bereitstellung nötig', missing: 'Dateiquelle fehlt' }[record.fileAvailability]);
  function facts(record) {
    return `<span class="fm-origin">${ORIGINS[record.availability]}</span>${record.demoSync?.status==='saved'?'<span class="fm-demo-sync">Demo abgeglichen</span>':''}${record.online ? `<span>${record.markets.map(market => MARKETS[market]).join(' · ')}</span>${salesApplicable(record) ? `<span title="Verkäufe der letzten 12 Monate">${knownSales(record) ? `${fmt(record.sales)} Verkäufe` : 'Verkäufe unbekannt'}</span>` : ''}` : `<span>${fileWord(record)}</span>`}`;
  }
  function details(record, view) {
    return `<details class="fm-details" data-mg-details="${record.id}"${states[view].open.has(record.id) ? ' open' : ''}><summary>Details</summary><dl><div><dt>ID / Version</dt><dd>${record.id} · v${record.version}</dd></div><div><dt>Serie / Vorlage</dt><dd>${esc(record.series)} · ${esc(record.template)}</dd></div><div><dt>Geändert</dt><dd>${date(record.changed)}</dd></div>${record.local ? `<div><dt>Lokaler Datensatz</dt><dd>${fileWord(record)}</dd></div>` : ''}${record.online ? `<div><dt>Kontostand</dt><dd>${esc(record.accountState)} · ${record.freshness === 'current' ? 'Gültiger Beispielstand' : record.freshness === 'stale' ? 'Älterer Beispielstand' : 'Aktualität unbekannt'}</dd></div><div><dt>ASIN</dt><dd>${record.asin}</dd></div>${record.demoSync?`<div><dt>Lokaler Demo-Abgleich</dt><dd>${record.demoSync.status==='error'?'Fehlgeschlagen · gespeicherter Stand erhalten':'Erfolgreich simuliert'}${record.demoSync.lastValid?` · gültige Simulation: ${record.demoSync.lastValid}`:''}</dd></div>`:''}` : ''}</dl>${plans.has(record.id) ? '<p>Demoauftrag vorgemerkt</p>' : ''}${button('Serie / Vorlage', 'metadata', record.id)}${record.online ? button('Produkte', 'products', record.id) : ''}</details>`;
  }
  function actions(record) {
    const task = taskOf(record);
    const syncing = sync.status === 'running' && sync.operation?.ids.includes(record.id);
    return `<div class="fm-actions">${button(syncing ? 'Abgleich läuft (Demo)' : task.cta, task.action, record.id, true, task.action === 'sync-record' && sync.status === 'running')}${record.local && task.action !== 'files' ? button(record.fileAvailability === 'local' ? 'Dateien' : 'Dateien bereitstellen', 'files', record.id) : task.action === 'files' ? button('Stand öffnen', 'stand', record.id) : ''}</div>`;
  }
  function recordCard(record, view, layout) {
    const selected = states[view].selected.has(record.id), task = taskOf(record);
    const check = `<label class="fw-checkbox fm-check"><input type="checkbox" data-mg-select="${record.id}"${selected ? ' checked' : ''} aria-label="${esc(record.title)} auswählen"></label>`;
    if (layout === 'list') return `<tr class="fm-record-row" data-management-record="${record.id}" aria-selected="${selected}"><td>${check}</td><td>${art(record, true)}</td><td class="fw-row-title"><strong>${esc(record.title)}</strong><small>${record.id}${record.series?` · ${esc(record.series)}`:''}</small></td><td data-label="Bestand"><div class="fm-row-facts">${facts(record)}</div></td><td data-label="Aufgabe">${task.label}</td><td class="fw-row-action">${actions(record)}${details(record, view)}</td></tr>`;
    return `<article class="fm-card" data-management-record="${record.id}" data-selected="${selected}"><header class="fm-card-head">${art(record, true)}<div><h3>${esc(record.title)}</h3><small>${record.id}${record.series?` · ${esc(record.series)}`:''}</small></div>${check}</header><div class="fm-card-facts">${facts(record)}</div><div class="fm-task"${task.priority < 3 ? ' data-attention="true"' : ''}>${task.label}</div>${actions(record)}${details(record, view)}</article>`;
  }
  function syncPanel() {
    const operation = sync.operation;
    const scope = operation ? operation.kind === 'account' ? `gesamtes Konto (${fmt(operation.ids.length)})` : operation.ids.length === 1 ? operation.ids[0] : `${fmt(operation.ids.length)} ausgewählte IDs` : '';
    const word = sync.status === 'running' ? `Demo-Abgleich läuft · ${scope}` : sync.status === 'error' ? `Demo fehlgeschlagen · ${scope}` : operation ? `Demo abgeglichen · ${scope}` : 'Gespeicherter Beispielstand';
    return `<div class="fm-sync" role="status"><div><strong>${word}</strong><span>Gültiger Konto-Beispielstand: ${sync.lastValid} · ${fmt(sync.count)} Designs</span></div>${button('Gesamtes Konto abgleichen (Demo)', 'sync', '', false, sync.status === 'running')}<details><summary>Umfang / Simulation</summary>${operation ? `<p>${operation.ids.slice(0, 5).map(esc).join(' · ')}${operation.ids.length > 5 ? ` · +${fmt(operation.ids.length - 5)} weitere exakte IDs` : ''}</p>` : ''}<label class="fw-field-label">Nächstes Demo-Ergebnis<select data-mg-sync-result>${option('success', 'Erfolg', sync.result)}${option('error', 'Lesefehler', sync.result)}</select></label><p>Lokaler Test. Keine echten Kontodaten gelesen. Bei Fehler bleibt der gültige Stand erhalten.</p></details></div>`;
  }
  function overview(d, state) {
    const online = matching(d.source, { ...state, task: 'all' }, 'live');
    return `<div class="fm-overview" aria-label="Kontoaufgaben">${[['all','Kontodesigns',online.length],['sync','Abgleich nötig',online.filter(record=>taskOf(record).key==='sync').length],['products','Produkte ergänzen',online.filter(record=>taskOf(record).key==='products').length],['draft','Gespeicherte Entwürfe',online.filter(record=>taskOf(record).key==='draft').length]].map(([key,label,count])=>`<button type="button" data-mg-task="${key}" aria-pressed="${state.task === key}"><span>${label}</span><strong>${fmt(count)}</strong></button>`).join('')}</div>`;
  }
  function render(view, restore = false) {
    const container = containers.get(view); if (!container) return;
    const state = states[view], d = data(view), active = document.activeElement;
    const scrollTop = state.resetScroll ? 0 : container.querySelector('.fm-scroll')?.scrollTop || 0; state.resetScroll = false;
    const focus = restore && container.contains(active) ? { id: active.id, recordId: active.dataset?.mgId || null, start: active.selectionStart, attr: Object.entries(active.dataset || {}).find(([key])=>['mgSelect','mgOrigin','mgAction','mgField','mgTask'].includes(key)) } : null;
    const visibleSelected = d.rows.filter(record => state.selected.has(record.id)).length;
    const picked = exact([...state.selected]), local = picked.rows.filter(record=>record.local), online = picked.rows.filter(record=>record.online);
    const localOnly = view==='management' && (state.origin==='local' || state.scope && d.source.some(record=>state.scope.has(record.id)) && !d.source.some(record=>state.scope.has(record.id)&&record.online));
    container.classList.add('fm-management');
    container.innerHTML = (core.accountNavigation?.(view) || '') + `<div class="fw-heading"><div><h2>${view === 'live' ? 'Kontodaten' : 'Designbestand'}</h2><p>${view === 'live' ? 'Aufgaben am gespeicherten Kontostand direkt erledigen.' : 'Ein Design. Lokale Dateien und Online-Produkte zusammen.'}</p></div><span class="fm-demo">10.000 fiktive Designs · lokale Demo</span></div>${view === 'live' ? syncPanel() + overview(d, state) : ''}${state.scope ? `<div class="fw-scope-note"><strong>${fmt(state.scope.size)} übergebene IDs · ${fmt(d.matches.length)} Treffer</strong>${button('Gesamten Bestand anzeigen', 'clear-scope')}</div>` : ''}${state.missing.length ? `<div class="fm-warning" role="status">${fmt(state.missing.length)} übergebene IDs hier nicht vorhanden: ${state.missing.slice(0, 4).map(esc).join(', ')}. Keine anderen Designs ergänzt.</div>` : ''}<div class="fm-toolbar"><label class="fw-field-label fm-search">Designs suchen<input id="fm-${view}-search" data-mg-field="query" type="search" value="${esc(state.query)}" placeholder="Titel, ID, ASIN oder Serie"></label><label class="fw-field-label">Sortieren<select data-mg-field="sort">${[['tasks','Aufgaben zuerst'],['newest','Neueste zuerst'],['changed','Zuletzt geändert'],['title','Titel A–Z'],['sales','Verkäufe · bekannte zuerst']].map(([key,label])=>option(key,label,state.sort)).join('')}</select></label><div class="fm-layout" role="group" aria-label="Darstellung">${[['cards','Kacheln'],['list','Liste']].map(([key,label])=>`<button class="fw-button fw-quiet" type="button" data-mg-layout="${key}" aria-pressed="${state.layout === key}">${label}</button>`).join('')}</div></div><div class="fm-filterbar"><div class="fw-facets" aria-label="Herkunft">${Object.entries(ORIGINS).filter(([key])=>view!=='live'||key!=='local').map(([key,label])=>`<button class="fw-facet" type="button" data-mg-origin="${key}" aria-pressed="${state.origin === key}">${label} <b>${fmt(key==='all'?d.facets.length:d.facets.filter(record=>record.availability===key).length)}</b></button>`).join('')}</div>${localOnly?'':`<label class="fw-field-label"><span class="fm-sr-only">Kontostand</span><select data-mg-field="status">${Object.entries(STATUSES).filter(([key])=>view!=='live'||key!=='local').map(([key,label])=>option(key,label,state.status)).join('')}</select></label><label class="fw-field-label"><span class="fm-sr-only">Markt</span><select data-mg-field="market">${Object.entries(MARKETS).map(([key,label])=>option(key,label,state.market)).join('')}</select></label>`}${state.status!=='all'||state.market!=='all'||state.task!=='all'?button('Filter zurücksetzen','clear-filters'):''}</div><div class="fw-selection fm-selection"><label class="fw-checkbox"><input type="checkbox" data-mg-page${d.rows.length && visibleSelected===d.rows.length?' checked':''}${d.rows.length?'':' disabled'}>Diese Seite (${d.rows.length})</label><span>${fmt(state.selected.size)} ausgewählt${state.selected.size?` · ${visibleSelected} hier`:''}</span>${button(`Alle ${fmt(d.matches.length)} Treffer…`, 'select-all', '', false, !d.matches.length)}${state.selected.size?button('Auswahl löschen','clear-selection'):''}${state.selected.size?`<div class="fm-bulk">${online.length?button(`Abgleichen (${fmt(online.length)}) · Demo`,'sync-selected','',false,sync.status==='running'):''}${local.length?button(`Dateien (${fmt(local.length)})`,'files-selected'):''}${button('Serie / Vorlage','metadata-selected')}${online.length?button(`Produkte (${fmt(online.length)})`,'products-selected')+button(view==='live'?'Im Bestand zeigen':'Kontodaten zeigen','counterpart'):''}</div>`:''}</div><div class="fm-scroll" tabindex="0" role="region" aria-label="${view==='live'?'Kontodaten':'Designbestand'} · ${d.rows.length} Datensätze dieser Seite">${d.rows.length ? state.layout === 'cards' ? `<div class="fm-grid">${d.rows.map(record=>recordCard(record,view,'cards')).join('')}</div>` : `<table class="fw-table fm-table"><thead><tr><th class="fw-check-col">Wahl</th><th class="fw-preview-col">Motiv</th><th>Design</th><th>Bestand</th><th>Nächste Aufgabe</th><th>Aktion</th></tr></thead><tbody>${d.rows.map(record=>recordCard(record,view,'list')).join('')}</tbody></table>` : `<div class="fw-empty">Keine Designs für diese Auswahl. ${button('Filter zurücksetzen','clear-filters')}</div>`}</div><div class="fw-pagination"><span>${d.matches.length ? `${fmt(d.offset+1)}–${fmt(d.offset+d.rows.length)}` : '0'} von ${fmt(d.matches.length)} · 36 pro Seite${state.sort==='sales'?' · unbekannte Verkäufe stehen nach bekannten Werten':''}</span><div class="fw-page-buttons">${button('← Zurück','previous','',false,state.page===1)}<span>Seite ${state.page} / ${d.pages}</span>${button('Weiter →','next','',false,state.page===d.pages)}</div></div>`;
    const scroll = container.querySelector('.fm-scroll'); if (scroll) scroll.scrollTop = scrollTop;
    const pageBox = container.querySelector('[data-mg-page]'); if(pageBox)pageBox.indeterminate=visibleSelected>0&&visibleSelected<d.rows.length;
    if (focus?.id) { const node=container.querySelector(`#${focus.id}`);node?.focus({preventScroll:true});if(typeof focus.start==='number'&&node?.setSelectionRange)node.setSelectionRange(focus.start,focus.start); }
    else if(focus?.attr){const [key,value]=focus.attr,attribute='data-'+key.replace(/[A-Z]/g,char=>'-'+char.toLowerCase());const node=container.querySelector(`[${attribute}="${CSS.escape(value)}"]${focus.recordId?`[data-mg-id="${CSS.escape(focus.recordId)}"]`:''}`)|| (focus.recordId?container.querySelector(`[data-management-record="${CSS.escape(focus.recordId)}"] [data-mg-select]`)||container.querySelector('.fm-scroll'):null);node?.focus({preventScroll:true});}
  }
  function update(view, changes, { page = true } = {}) { const state=states[view];Object.assign(state,changes);if(page){state.page=1;state.resetScroll=true;}state.revision++;render(view,true); }
  function fileModal(ids, view) {
    const resolved=exact(ids), rows=resolved.rows.filter(record=>record.local), omitted=resolved.rows.length-rows.length;
    const cloud=rows.filter(record=>record.fileAvailability==='cloud'),missing=rows.filter(record=>record.fileAvailability==='missing');
    const title=missing.length?'Dateiquellen zuordnen':cloud.length?'Dateien bereitstellen':'Dateien öffnen';
    core.modal(title,`<p><strong>${fmt(rows.length)} exakt ausgewählte lokale Datensätze</strong> · ${rows.length-cloud.length-missing.length} verfügbar · ${cloud.length} Cloud · ${missing.length} Quelle fehlt</p>${warning(resolved,omitted)}${listing(rows)}${rows.length===1?`<div class="fm-file-package"><strong>${rows[0].id}/v${rows[0].version}</strong><span>Original.png · Final.png · Artwork.svg · Listing.json</span><small>${fileWord(rows[0])}</small></div>`:''}${missing.length?'<label class="fw-field-label">Quellordner für die fehlenden Dateien<input data-mg-source placeholder="Beispiel: Designs/Originale"></label>':''}<p class="fm-modal-note">Demo: ${cloud.length||missing.length?'Bereitstellung wird nur vorgemerkt.':'Dateipaket wird nur angezeigt.'} Keine Dateien gelesen oder verändert.</p>`,rows.length&&(cloud.length||missing.length)?'Bereitstellung vormerken (Demo)':'',rows.length&&(cloud.length||missing.length)?()=>{rows.filter(record=>record.fileAvailability!=='local').forEach(record=>plans.set(record.id,{kind:'files',source:root.querySelector('[data-mg-source]')?.value||null}));core.announce(`${fmt(cloud.length+missing.length)} genaue Dateiquellen vorgemerkt. Verfügbarkeit bleibt bis zur echten Bereitstellung offen.`);render(view);}:null);
  }
  function metadataModal(ids, view) {
    const resolved=exact(ids);if(!resolved.rows.length){core.modal('Keine passenden IDs',warning(resolved));return;}
    core.modal('Serie und Vorlage',`<p><strong>${fmt(resolved.rows.length)} ausgewählte Designs</strong></p>${warning(resolved)}${listing(resolved.rows)}<div class="fm-modal-grid"><label class="fw-field-label">Serie<input data-mg-series placeholder="Serie zuweisen"></label><label class="fw-field-label">Vorlage<select data-mg-template><option value="">Vorlage beibehalten</option><option>Auto</option><option>US Standard T-Shirt</option><option>DE Kernprodukte</option></select></label></div><p class="fm-modal-note">Nur diese IDs. Leere Felder behalten ihren Stand.</p>`,'Zuordnung speichern (Demo)',()=>{const series=root.querySelector('[data-mg-series]').value.trim(),template=root.querySelector('[data-mg-template]').value;if(!series&&!template){core.announce('Keine Werte eingegeben. Zuordnung unverändert.');return;}const shared=resolved.rows.filter(record=>coreIds.has(record.id)),sharedIds=new Set(shared.map(record=>record.id));const sharedPatch={};if(series)sharedPatch.series=series;if(template)sharedPatch.template=template;const sharedOwner=window.FlowWaveOperationsDemo?.setManagementMetadata;if(sharedOwner)sharedOwner(shared.map(record=>record.id),sharedPatch);resolved.rows.forEach(record=>{const patch={...overrides.get(record.id)};if(!sharedOwner||!sharedIds.has(record.id)){if(series)patch.series=series;if(template)patch.template=template;}overrides.set(record.id,patch);});core.announce(`${fmt(resolved.rows.length)} genaue Zuordnungen im Konzept gespeichert.`);render(view);});
  }
  function productModal(ids, view) {
    const resolved=exact(ids),rows=resolved.rows.filter(record=>record.online),omitted=resolved.rows.length-rows.length;
    const defaults=record=>productPlans.get(record.id)||{market:'US',product:'STANDARD_TSHIRT',template:record.template||'Auto'};
    const choices=rows.map(defaults),common=key=>{const values=[...new Set(choices.map(choice=>choice[key]))];return values.length===1?values[0]:'';};
    const choicesFor=(key,options)=>{const selected=common(key);if(selected&&!options.some(([value])=>value===selected))options=[[selected,selected],...options];return (selected?'':option('','Je Design beibehalten',''))+options.map(([value,label])=>option(value,label,selected)).join('');};
    core.modal('Produkte ergänzen',`<p><strong>${fmt(rows.length)} ausgewählte Kontodesigns</strong></p>${warning(resolved,omitted)}${listing(rows)}<div class="fm-modal-grid"><label class="fw-field-label">Zielmarkt<select data-mg-product-market>${choicesFor('market',[['US','US'],['DE','DE'],['GB','UK']])}</select></label><label class="fw-field-label">Produkt<select data-mg-product>${choicesFor('product',[['STANDARD_TSHIRT','Standard T-Shirt'],['PULLOVER_HOODIE','Hoodie'],['POPSOCKET','PopSocket']])}</select></label><label class="fw-field-label">Vorlage<select data-mg-product-template>${choicesFor('template',[['US Standard T-Shirt','US Standard T-Shirt'],['Auto','Auto'],['DE Kernprodukte','DE Kernprodukte']])}</select></label></div><p class="fm-modal-note">Vorhandene Demoaufträge behalten ihre Wahl. Änderungen gelten nur für diese IDs. Nichts an Amazon gesendet.</p>`,rows.length?`${fmt(rows.length)} Demoaufträge vormerken`:'',rows.length?()=>{const selected={market:root.querySelector('[data-mg-product-market]').value,product:root.querySelector('[data-mg-product]').value,template:root.querySelector('[data-mg-product-template]').value};rows.forEach(record=>{const previous=defaults(record),choice={kind:'products',market:selected.market||previous.market,product:selected.product||previous.product,template:selected.template||previous.template};productPlans.set(record.id,choice);plans.set(record.id,{...choice});});const scope=Object.values(selected).every(Boolean)?`${selected.market} · ${selected.product}`:'gewählte Werte je Design gespeichert';core.announce(`${fmt(rows.length)} exakte Produktaufträge vorgemerkt · ${scope}. Kein Kontostatus geändert.`);render(view);}:null);
  }
  function standModal(id, view) {
    const resolved=exact([id]),record=resolved.rows[0];if(!record){core.modal('Stand nicht vorhanden',warning(resolved));return;}
    const source=core.savedRecordState?.(id) || core.recordState?.(id);
    core.modal(`Stand · ${id}`,`<div class="fm-stand">${art(record)}<div><h3>${esc(record.title)}</h3><p>${ORIGINS[record.availability]} · v${record.version}</p>${record.online?`<p>${esc(record.accountState)} · ${record.asin}<br>${record.markets.map(market=>MARKETS[market]).join(' · ')}</p>`:''}${record.local?`<p>${fileWord(record)}</p>`:''}<details><summary>Gespeicherten Inhalt ansehen</summary><p>${esc(source?.fields?.title||record.title)}</p><p>${esc(record.brand)} · ${esc(record.series)} · ${esc(record.template)}</p>${record.uploadPhase?`<p>Upload-Beispielstand: ${esc(record.uploadPhase)}</p>`:''}</details></div></div><p class="fm-modal-note">${record.local?'Eine Produktionskopie nutzt diesen exakten Stand; der Bestand bleibt erhalten.':'Ohne lokale Quelle kann hier keine Produktionskopie entstehen.'}</p>`,record.local?'Produktionskopie vormerken (Demo)':'',record.local?()=>{plans.set(id,{kind:'production-copy',version:record.version});core.announce(`${id} · v${record.version}: Produktionskopie vorgemerkt. Kein Original verschoben und kein fremder Hub-Datensatz geöffnet.`);render(view);}:null);
  }
  function simulateSync(ids, view, kind = 'selection') {
    if(sync.status==='running')return;
    const resolved=syncTargets(allRecords(),ids),targets=resolved.eligible.map(record=>record.id);
    if(!targets.length){core.announce(`Kein Kontodesign im Umfang. ${resolved.missing.length} unbekannte IDs; keine anderen Designs ergänzt.`);return;}
    const revision=++sync.revision,result=sync.result;
    sync.operation=Object.freeze({kind,ids:Object.freeze([...targets]),missing:Object.freeze([...resolved.missing]),omitted:resolved.omitted.length});
    sync.status='running';render(view,true);if(view!=='live')render('live');
    const scope=targets.length===1?targets[0]:`${fmt(targets.length)} genaue Kontodesigns`;
    core.announce(`Demo-Abgleich: ${scope}${resolved.omitted.length?` · ${fmt(resolved.omitted.length)} nur lokale Designs ausgenommen`:''}${resolved.missing.length?` · unbekannt: ${resolved.missing.slice(0,4).join(', ')}`:''}.`);
    setTimeout(()=>{
      if(revision!==sync.revision)return;
      const at=new Intl.DateTimeFormat('de-DE',{dateStyle:'short',timeStyle:'short'}).format(new Date());
      targets.forEach(id=>{const patch={...overrides.get(id)};patch.demoSync=syncReceipt(patch.demoSync,result,at);overrides.set(id,patch);});
      sync.status=result==='error'?'error':'saved';
      if(kind==='account'&&result!=='error')sync.lastValid=at;
      render(view,true);if(view!=='live')render('live');
      core.announce(`${scope}: Demo-Abgleich ${result==='error'?'fehlgeschlagen · letzter gültiger Stand erhalten':'abgeschlossen'}. Keine echten Kontodaten gelesen oder Kontostände geändert.`);
    },650);
  }
  function receive(view, ids) {
    const resolved=exact(ids),state=states[view];state.scope=new Set(resolved.rows.map(record=>record.id));state.selected=new Set(resolved.rows.filter(record=>view!=='live'||record.online).map(record=>record.id));state.missing=resolved.missing;
    Object.assign(state,{query:'',origin:'all',status:'all',market:'all',task:'all',page:1});state.revision++;state.resetScroll=true;core.show(view);
  }
  function action(view, name, id) {
    const state=states[view],ids=id?[id]:[...state.selected];
    if(name==='previous'||name==='next'){state.page+=name==='next'?1:-1;state.resetScroll=true;render(view,true);return;}
    if(name==='clear-selection'){update(view,{selected:new Set()},{page:false});return;}
    if(name==='clear-scope'){update(view,{scope:null,selected:new Set(),missing:[],query:'',origin:'all',status:'all',market:'all',task:'all'});return;}
    if(name==='clear-filters'){update(view,{query:'',origin:'all',status:'all',market:'all',task:'all'});return;}
    if(name==='select-all'){const ticket=selectionTicket(state,data(view).matches.map(record=>record.id));core.modal('Alle aktuellen Treffer auswählen',`<p><strong>${fmt(ticket.ids.length)} IDs</strong> aus dieser Suche über alle Seiten. Ersetzt die bisherige Auswahl.</p><p class="fm-modal-note">Filteränderungen oder eine neuere Auswahl verwerfen diesen älteren Auftrag.</p>`,`${fmt(ticket.ids.length)} auswählen`,()=>{if(!commitSelection(state,ticket))core.announce('Ansicht oder Auswahl geändert. Ältere Auswahl nicht übernommen.');render(view);});return;}
    if(name==='files'||name==='files-selected')fileModal(ids,view);
    if(name==='metadata'||name==='metadata-selected')metadataModal(ids,view);
    if(name==='products'||name==='products-selected')productModal(ids,view);
    if(name==='stand')standModal(id,view);
    if(name==='sync-record')simulateSync([id],view,'record');
    if(name==='sync-selected')simulateSync(ids,view);
    if(name==='sync')simulateSync(allRecords().filter(record=>record.online).map(record=>record.id),view,'account');
    if(name==='counterpart'){const resolved=exact(ids),eligible=resolved.rows.filter(record=>view==='live'||record.online),omitted=resolved.rows.length-eligible.length;if(omitted)core.announce(`${fmt(omitted)} nur lokale Designs bleiben aus Kontodaten ausgenommen.`);receive(view==='live'?'management':'live',eligible.map(record=>record.id));}
  }
  function bind(view, container) {
    if(bound.has(container))return;bound.add(container);
    container.addEventListener('input',event=>{if(event.target.dataset.mgField==='query')update(view,{query:event.target.value});});
    container.addEventListener('change',event=>{const target=event.target,state=states[view];if(target.dataset.mgField&&target.dataset.mgField!=='query')update(view,{[target.dataset.mgField]:target.value});if(target.dataset.mgSelect){target.checked?state.selected.add(target.dataset.mgSelect):state.selected.delete(target.dataset.mgSelect);state.revision++;render(view,true);}if(target.hasAttribute('data-mg-page')){data(view).rows.forEach(record=>target.checked?state.selected.add(record.id):state.selected.delete(record.id));state.revision++;render(view,true);}if(target.hasAttribute('data-mg-sync-result'))sync.result=target.value;});
    container.addEventListener('click',event=>{const target=event.target.closest('button');if(!target)return;if(target.dataset.mgOrigin)update(view,{origin:target.dataset.mgOrigin,...(target.dataset.mgOrigin==='local'?{status:'all',market:'all'}:{})});if(target.dataset.mgTask)update(view,{task:target.dataset.mgTask});if(target.dataset.mgLayout)update(view,{layout:target.dataset.mgLayout},{page:false});if(target.dataset.mgAction)action(view,target.dataset.mgAction,target.dataset.mgId);});
    container.addEventListener('toggle',event=>{const id=event.target.dataset?.mgDetails;if(id)event.target.open?states[view].open.add(id):states[view].open.delete(id);},true);
  }
  ['management','live'].forEach(view=>core.register(view,{title:view==='management'?'Designbestand':'Kontodaten',receive:ids=>{const resolved=exact(ids),state=states[view];state.scope=new Set(resolved.rows.map(record=>record.id));state.selected=new Set(resolved.rows.filter(record=>view!=='live'||record.online).map(record=>record.id));state.missing=resolved.missing;Object.assign(state,{query:'',origin:'all',status:'all',market:'all',task:'all',page:1});state.revision++;state.resetScroll=true;},render:container=>{containers.set(view,container);bind(view,container);render(view);}}));
  window.FlowWaveManagementDemo=Object.freeze({helpers,simulateSync:(ids,{view='management',result}={})=>{if(['success','error'].includes(result))sync.result=result;simulateSync(ids,view);},record:id=>{const record=byId.get(id);return record?{...present(record)}:null;},receive,snapshot:(view='management')=>{const d=data(view),state=states[view];return{total:records.length,online:sync.count,view,matching:d.matches.length,pages:d.pages,rendered:d.rows.length,origin:state.origin,layout:state.layout,selected:[...state.selected],scope:state.scope?[...state.scope]:null,missing:[...state.missing],sync:{...sync},plans:[...plans].map(([id,plan])=>({id,...plan})),productPlans:[...productPlans].map(([id,plan])=>({id,...plan}))};}});
})();
