/* Local operations examples. No network, provider, account or filesystem calls. */
(() => {
  'use strict';
  const core = window.FlowWaveConceptCore;
  if (!core) return;
  const root = document.getElementById('flowwave-bento-concept');
  const { esc, fmt, art } = core;
  const records = core.records;
  const byId = new Map(records.map(record => [record.id, record]));
  const PAGE_SIZE = 24;
  const views = ['autopilot', 'checks', 'live', 'management', 'activity', 'uploadqueue'];
  const state = Object.fromEntries(views.map(view => [view, { query: '', filter: 'all', page: 1, selected: new Set(), scope: null }]));
  state.uploadqueue.filter = 'needs';
  state.uploadqueue.mode = 'draft';
  state.autopilot.mode = 'full';
  const current = record => core.recordState?.(record.id) || {status:record.status,artworkIP:null,listingIP:null,fields:record.fields};
  const containers = new Map(), bound = new WeakSet(), sequences = new Map(), series = new Map(), recipes = new Map();
  const titles = { autopilot: 'Autopilot', checks: 'IP Checks', live: 'Live Designs', management: 'Designverwaltung', activity: 'Aktivität', uploadqueue: 'Uploadqueue' };
  const subtitles = {
    autopilot: 'Gespeicherte Wege bündeln. Startumfang und Endpunkt stehen vor dem Start fest.',
    checks: 'Artwork und Listing getrennt sehen. Offene Nachweise gezielt am zuständigen Motiv bearbeiten.',
    live: 'Bestand und Performance gemeinsam lesen. Alle Zahlen hier sind synthetische Demowerte.',
    management: 'Designs, Märkte, Serien und Vorlagen über Listen und Seiten hinweg verwalten.',
    activity: 'Auftrag, Motiv und nächster Schritt bleiben verbunden. Ein gemeinsamer Fehler erscheint einmal.',
    uploadqueue: 'Bereite Motive bündeln, offene Schritte direkt lösen und abgeschlossene Übertragungen erhalten.'
  };
  const filters = {
    autopilot: { all:'Alle', queued:'Wartet', running:'Läuft', blocked:'Blockiert', review:'In Review', done:'Verarbeitet' },
    checks: { all:'Alle', recovery:'Prüfung unterbrochen', correction:'Bildkorrektur', draft:'Text ungeprüft', review:'Prüfung offen', ready:'Nachweise aktuell' },
    live: { all:'Alle', products:'Produkte ergänzen', removed:'Ohne Verkäufe entfernt', timed:'Zeitfenster abgelaufen', expiring:'Läuft bald ab' },
    management: { all:'Alle', amazon:'Amazon · Demo', local:'Lokal', archived:'Archiv' },
    activity: { all:'Alle', queued:'Wartet', running:'Läuft', held:'Wartet auf Zugang', failed:'Einzelfehler', done:'Abgeschlossen', uncertain:'Antwort unklar' },
    uploadqueue: {all:'Alle',queue:'Queue',needs:'Needs you',ready:'Bereit',running:'Läuft',done:'Done',production:'In Production',archived:'Archiviert'}
  };
  const jobId = record => `JOB-${record.id}-A1`;
  const activityOwner = record => [{id:'create',title:'Create'},{id:'remaster',title:'Remaster'},{id:'vectorize',title:'Vectorize'},{id:'listings',title:'Listings'},{id:'review',title:'Review'}][record.index % 5];
  function openActivityOwner(record) { const owner=activityOwner(record); core.handoff(owner.id,[record.id]); core.announce(`${jobId(record)} · ${record.id} im Bereich ${owner.title} geöffnet. ${activityStatus(record)==='uncertain'?'Antwort weiterhin unklar: denselben Originalauftrag abgleichen, nicht erneut starten.':'Gespeicherten Auftrag weiter ansehen; kein neuer Start und keine Wiederholung.'}`); }
  const asin = record => `DEMO${String(record.index + 1).padStart(6, '0')}`;
  const market = record => ['US · DE', 'DE · UK', 'US · UK · DE'][record.index % 3];
  const autoStatus = record => record.index === 0 ? 'running' : record.status==='ready' && current(record).status!=='ready' ? 'review' : ({ recovery:'blocked', correction:'review', draft:'queued', review:'queued', ready:'done' }[record.status]);
  const activityStatus = record => record.index === 0 ? 'uncertain' : record.index === 1 ? 'running' : ['held','failed','queued','queued','done'][record.index % 5];
  const uploadStatus = record => { const phase=['queue','needs','ready','running','done','production','archived'][record.index % 7]; return ['running','done','production','archived'].includes(phase) ? phase : ['queue','ready'].includes(phase) && current(record).status!=='ready' ? 'needs' : phase; };
  const uploadLocked = record => uploadStatus(record) === 'running' && record.index % 2 === 1;
  const status = (view, record) => view === 'autopilot' ? autoStatus(record) : view === 'checks' ? current(record).status : view === 'uploadqueue' ? uploadStatus(record) : view === 'live' ? ['products','removed','timed','expiring'][record.index % 4] : view === 'management' ? ['amazon','local','archived'][record.index % 3] : activityStatus(record);
  const label = (view, record) => filters[view][status(view, record)];
  const normalize = ids => [...new Set(ids)].filter(id => byId.has(id));
  function scopeRows(view) {
    const s = state[view], query = s.query.trim().toLocaleLowerCase('de');
    return records.filter(record => (!s.scope || s.scope.has(record.id)) && (!query || [record.id, record.title, current(record).fields.brand, asin(record), jobId(record), series.get(record.id) || 'Ohne Serie'].join(' ').toLocaleLowerCase('de').includes(query)));
  }
  function data(view) {
    const s = state[view], scoped = scopeRows(view), matches = scoped.filter(record => s.filter === 'all' || status(view, record) === s.filter);
    const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    s.page = Math.min(Math.max(1, s.page), pages);
    const offset = (s.page - 1) * PAGE_SIZE;
    return { scoped, matches, pages, offset, rows: matches.slice(offset, offset + PAGE_SIZE) };
  }
  const selectedRecords = view => [...state[view].selected].map(id => byId.get(id)).filter(Boolean);
  function checkbox(view, record) { return `<label class="fw-checkbox"><input type="checkbox" data-ops-select="${record.id}" data-ops-view="${view}" ${state[view].selected.has(record.id) ? 'checked' : ''} aria-label="${esc(record.title)} auswählen"></label>`; }
  function button(text, action, id = '', primary = false) { return `<button class="fw-button${primary ? ' fw-primary' : ' fw-quiet'}" type="button" data-ops-action="${action}"${id ? ` data-ops-id="${id}"` : ''}>${text}</button>`; }
  function header(view) { return `<div class="fw-heading"><div><h2>${titles[view]}</h2><p>${subtitles[view]}</p></div><span class="fw-ops-demo">1.000 Beispieldatensätze</span></div>`; }
  function controls(view, d) {
    const s = state[view], selected = s.selected, visibleSelected = d.rows.filter(record => selected.has(record.id)).length;
    const chips = Object.entries(filters[view]).map(([key, title]) => `<button type="button" class="fw-facet" data-ops-filter="${key}" aria-pressed="${s.filter === key}">${title} <b>${fmt(key === 'all' ? d.scoped.length : d.scoped.filter(record => status(view, record) === key).length)}</b></button>`).join('');
    let actions = '';
    if (selected.size) {
      actions = view === 'autopilot' ? button('Start vorbereiten', 'prepare-start') : view === 'checks' ? button('Artwork in Review öffnen', 'review-selected') + button('Listing-Text öffnen', 'listings-selected') : view === 'management' ? button('Serie / Vorlage zuweisen', 'assign') + button('In Listings öffnen', 'listings-selected') : view === 'live' ? button('Produkte vorbereiten', 'prepare-products') + button('In Designverwaltung öffnen', 'manage-selected') : view === 'uploadqueue' ? button('Ausgewählten Lauf vorbereiten', 'prepare-upload') : button('Fortsetzung vorbereiten', 'prepare-resume');
    }
    return `${s.scope ? `<div class="fw-scope-note"><strong>Übergebene Auswahl: ${fmt(s.scope.size)} Motive</strong>${button('Gesamten Bestand anzeigen', 'clear-scope')}</div>` : ''}<div class="fw-ops-search"><label class="fw-field-label">${view === 'activity' ? 'Auftrag oder Motiv suchen' : view === 'management' ? 'Titel, Marke, ASIN oder ID suchen' : 'Motive suchen'}<input id="fw-ops-${view}-search" type="search" data-ops-query="${view}" value="${esc(s.query)}" placeholder="Suche im Bestand"></label></div><div class="fw-facets" aria-label="${titles[view]} filtern">${chips}</div><div class="fw-selection"><label class="fw-checkbox"><input type="checkbox" data-ops-page-select ${d.rows.length && visibleSelected === d.rows.length ? 'checked' : ''} ${d.rows.length ? '' : 'disabled'}>Diese Seite (${d.rows.length})</label><span class="fw-selected-count">${fmt(selected.size)} ausgewählt${selected.size ? ` · ${visibleSelected} auf dieser Seite` : ''}</span>${button(`Alle ${fmt(d.matches.length)} Treffer auswählen…`, 'select-all')}${selected.size ? button('Auswahl löschen', 'clear-selection') : ''}<span class="fw-selection-spacer"></span>${actions}</div>`;
  }
  function pagination(view, d) { return `<div class="fw-pagination"><span>${d.matches.length ? `${fmt(d.offset + 1)}–${fmt(d.offset + d.rows.length)}` : '0'} von ${fmt(d.matches.length)} Treffern · 24 pro Seite</span><div class="fw-page-buttons">${button('← Zurück', 'previous')}<span>Seite ${state[view].page} / ${d.pages}</span>${button('Weiter →', 'next')}</div></div>`; }
  function rowLead(view, record, extra = '') { return `<td>${checkbox(view, record)}</td><td>${art(record, true)}</td><td class="fw-row-title"><strong>${esc(record.title)}</strong><small>${record.id}${extra}</small></td>`; }
  function table(headings, body) { return `<table class="fw-table fw-ops-table"><thead><tr><th class="fw-check-col">Wahl</th><th class="fw-preview-col">Motiv</th>${headings.map(title => `<th>${title}</th>`).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${headings.length + 2}" class="fw-empty">Keine Treffer für diesen Filter.</td></tr>`}</tbody></table>`; }
  function route(record) { return sequences.get(record.id) || { image: record.index % 2 ? 'Upscale' : 'Vectorize', listing: 'Fehlenden Text schreiben', end: 'Final Review' }; }
  function autoBody(d) {
    return `<div class="fw-ops-mode" role="group" aria-label="Autopilot-Modus">${[['manual','Manual'],['semi','Semi'],['full','Full Auto']].map(([key,title])=>`<button type="button" class="fw-button ${state.autopilot.mode===key?'fw-primary':''}" data-ops-auto-mode="${key}" aria-pressed="${state.autopilot.mode===key}">${title}</button>`).join('')}<p>${{manual:'Einzelschritte bewusst auslösen.',semi:'Übergänge vor dem nächsten Schritt bestätigen.',full:'Gespeicherten Workflow bis Final Review ausführen.'}[state.autopilot.mode]} Moduswechsel startet nichts.</p></div><div class="fw-ops-callout"><strong>Full Auto: maximal 25 Workflows je Start</strong><span>Ein aktiver Ablauf · Endpunkt Final Review · Freigabe und Export bleiben bewusst.</span></div>` + table(['Design / gespeicherter Weg', 'Zustand', 'Endpunkt', 'Aktion'], d.rows.map(record => { const r = route(record); return `<tr>${rowLead('autopilot', record, ` · ${r.image} → Listing`)}<td data-label="Zustand">${label('autopilot', record)}</td><td data-label="Endpunkt">${esc(r.end)}</td><td class="fw-row-action">${button('Ablauf bearbeiten', 'sequence', record.id)}${button(autoStatus(record) === 'running' ? 'Stoppumfang ansehen' : 'Motiv öffnen', autoStatus(record) === 'running' ? 'stop-scope' : 'hub-one', record.id)}</td></tr>`; }).join(''));
  }
  const artworkStatus = record => current(record).artworkIP || ({ recovery:'Aktuell · Beispiel', correction:'Korrektur offen', draft:'Prüfung offen', review:'Prüfung offen', ready:'Aktuell · Beispiel' }[record.status]);
  const textStatus = record => current(record).listingIP || ({ recovery:'Gespeicherter Teilstand', correction:'Aktuell · Beispiel', draft:'Ungeprüfter Text', review:'Prüfung offen', ready:'Aktuell · Beispiel' }[record.status]);
  function checksBody(d) { return `<div class="fw-ops-callout"><strong>Zwei getrennte Prüfumfänge</strong><span>Neue Artwork-Prüfungen gehören zum finalen Review. Listing-Text bleibt separat bearbeitbar.</span></div>` + table(['Design / Version', 'Artwork IP', 'Listing IP', 'Nächste Aktion'], d.rows.map(record => `<tr>${rowLead('checks', record, ` · Version ${record.version}`)}<td data-label="Artwork IP">${artworkStatus(record)}</td><td data-label="Listing IP">${textStatus(record)}</td><td class="fw-row-action">${button(current(record).status === 'recovery' ? 'Gespeicherten Stand öffnen' : 'Im Review öffnen', current(record).status === 'recovery' ? 'listings-one' : 'review-one', record.id)}</td></tr>`).join('')); }
  function liveBody(d) { return `<div class="fw-ops-callout"><strong>Performance nur als Demowerte</strong><span>Keine Amazon-Kontodaten geladen. Änderungen und Produkt-Erweiterungen werden hier nur vorbereitet.</span></div>` + table(['Design', 'Status / Märkte', 'Demo Verkäufe', 'Aktion'], d.rows.map(record => `<tr>${rowLead('live', record, ` · ${asin(record)}`)}<td data-label="Status / Märkte">${label('live', record)}<br><span class="fw-secondary-text">${market(record)}</span></td><td data-label="Demo Verkäufe">${status('live',record)==='removed'?0:record.index % 17}</td><td class="fw-row-action">${button('Bestand öffnen', 'manage-one', record.id)}</td></tr>`).join('')); }
  function managementBody(d) { return table(['Design / Marke', 'Bestand / Märkte', 'Serie / Vorlage', 'Aktion'], d.rows.map(record => `<tr>${rowLead('management', record, ` · ${asin(record)} · ${esc(current(record).fields.brand)}`)}<td data-label="Bestand / Märkte">${label('management', record)}<br><span class="fw-secondary-text">${market(record)}</span></td><td data-label="Serie / Vorlage">${esc(series.get(record.id) || 'Ohne Serie')}<br><span class="fw-secondary-text">${esc(recipes.get(record.id) || 'Auto')}</span></td><td class="fw-row-action">${button('Motiv öffnen', 'hub-one', record.id)}${button('Listing', 'listings-one', record.id)}</td></tr>`).join('')); }
  function activityBody(d) { return `<div class="fw-ops-callout fw-ops-warning"><strong>Ein gemeinsamer Zugangsstopp · Beispielszenario</strong><span>Neue Aufträge warten. Gespeicherte Ergebnisse bleiben erhalten; unklare laufende Antworten werden zuerst beobachtet.</span>${button('Gemeinsamen Grund öffnen', 'shared-blocker')}</div>` + table(['Auftrag / Motiv', 'Bereich', 'Zustand', 'Aktion'], d.rows.map(record => `<tr>${rowLead('activity', record, ` · ${jobId(record)}`)}<td data-label="Bereich">${activityOwner(record).title}</td><td data-label="Zustand">${label('activity', record)}</td><td class="fw-row-action">${button('Auftrag öffnen', 'job', record.id)}${button(`In ${activityOwner(record).title} öffnen`, 'job-owner', record.id)}</td></tr>`).join('')); }
  function uploadFix(record) {
    if (record.status === 'ready' && current(record).status !== 'ready') return button('Geänderten Text öffnen', 'listings-one', record.id);
    const phase = uploadStatus(record);
    if (phase === 'needs') return button(['Listing korrigieren','Zugang ansehen','Originalstatus prüfen'][record.index % 3], ['listings-one','upload-access','upload-observe'][record.index % 3], record.id);
    if (phase === 'production') return button('In Review öffnen', 'review-one', record.id);
    if (phase === 'done') return button('Gespeicherten Beleg ansehen', 'upload-receipt', record.id);
    if (phase === 'archived') return button('Archivgrund ansehen', 'upload-receipt', record.id);
    return button(phase === 'running' ? 'Auftrag öffnen' : 'Motiv öffnen', phase === 'running' ? 'upload-observe' : 'hub-one', record.id);
  }
  function uploadBody(d) {
    const mode = state.uploadqueue.mode, modes = {draft:'Als Entwurf auf Amazon speichern; nichts geht live.',publish:'Live auf Amazon veröffentlichen.',fill:'Nur ausfüllen; nichts speichern oder veröffentlichen.'};
    const locked = records.filter(uploadLocked).length;
    return `<div class="fw-ops-mode" role="group" aria-label="Upload-Modus">${[['draft','Draft'],['publish','Publish'],['fill','Fill only']].map(([key,title]) => `<button type="button" class="fw-button ${mode===key?'fw-primary':''}" data-ops-upload-mode="${key}" aria-pressed="${mode===key}">${title}</button>`).join('')}<p>${modes[mode]}</p></div><div class="fw-ops-callout"><strong>${fmt(locked)} Beispielaufträge auf anderen Macs gesperrt</strong><span>Ein gemeinsamer Lock-Hinweis. Diese Aufträge bleiben von jedem neuen Lauf ausgenommen.</span></div>` + table(['Design / Auftrag', 'Zustand', 'Nächste Handlung'], d.rows.map(record => `<tr>${rowLead('uploadqueue',record,` · ${jobId(record)}`)}<td data-label="Zustand">${label('uploadqueue',record)}${uploadStatus(record)==='done'?'<br><span class="fw-secondary-text">Entwurf gespeichert · Beispiel</span>':''}${uploadLocked(record)?'<br><span class="fw-secondary-text">Anderer Mac</span>':''}</td><td class="fw-row-action">${uploadFix(record)}</td></tr>`).join(''));
  }
  const bodies = { autopilot:autoBody, checks:checksBody, live:liveBody, management:managementBody, activity:activityBody, uploadqueue:uploadBody };
  function refresh(view, restoreSearch = false) {
    const container = containers.get(view); if (!container) return;
    const active = document.activeElement, position = restoreSearch && active ? active.selectionStart : null;
    const focusSelector = active && container.contains(active) ? active.dataset.opsSelect ? `[data-ops-select="${active.dataset.opsSelect}"]` : active.hasAttribute('data-ops-page-select') ? '[data-ops-page-select]' : null : null;
    const d = data(view);
    container.innerHTML = header(view) + controls(view, d) + bodies[view](d) + pagination(view, d);
    const pageCheck = container.querySelector('[data-ops-page-select]');
    const pageSelected = d.rows.filter(record => state[view].selected.has(record.id)).length;
    pageCheck.indeterminate = pageSelected > 0 && pageSelected < d.rows.length;
    const previous = container.querySelector('[data-ops-action="previous"]'), next = container.querySelector('[data-ops-action="next"]');
    previous.disabled = state[view].page === 1; next.disabled = state[view].page === d.pages;
    if (!restoreSearch && focusSelector) container.querySelector(focusSelector)?.focus({preventScroll:true});
    if (restoreSearch) { const input = container.querySelector('[data-ops-query]'); input.focus({preventScroll:true}); if (typeof position === 'number') input.setSelectionRange(position, position); }
  }
  function listOf(items) { return `<ul>${items.slice(0, 8).map(record => `<li>${record.id} · ${esc(record.title)}</li>`).join('')}</ul>${items.length > 8 ? `<p>… und ${fmt(items.length - 8)} weitere exakt ausgewählte Motive.</p>` : ''}`; }
  function prepareStart() {
    const selected = selectedRecords('autopilot'), eligible = selected.filter(record => autoStatus(record) === 'queued'), held = selected.length - eligible.length;
    if (!eligible.length) { core.modal('Kein neuer Start vorbereitet', '<p>Die Auswahl enthält nur laufende, blockierte oder bereits verarbeitete Workflows. Fertige Geschwister werden nicht wiederholt.</p>'); return; }
    if (eligible.length > 25) { const ids = eligible.slice(0,25).map(record => record.id); core.modal('Startgrenze: 25 Workflows', `<p>${fmt(eligible.length)} ausgewählte Workflows sind startbar. Ein Start umfasst maximal 25.</p><p>Du kannst die ersten 25 anhand ihrer stabilen IDs auswählen; die übrigen werden nicht gestartet.</p>${listOf(ids.map(id => byId.get(id)))}`, 'Diese 25 auswählen', () => { state.autopilot.selected = new Set(ids); refresh('autopilot'); }); return; }
    core.modal('Ausgewählten Start vorbereiten', `<p><strong>${fmt(eligible.length)} gespeicherte Workflows</strong> · ${fmt(held)} nicht startbare Motive bleiben zurück.</p>${listOf(eligible)}<p>Sequenzieller Ablauf bis Final Review. Bestehende Ergebnisse werden genutzt; Originale bleiben erhalten.</p><p>Konzeptvorschau: Keine Aufträge gesendet, keine Prüf- oder Bild-Ergebnisse erzeugt.</p>`);
  }
  function editSequence(record) {
    const r = route(record);
    core.modal(`Ablauf · ${record.id}`, `<p>${esc(record.title)} · Nur dieser gespeicherte Workflow</p><label class="fw-field-label">Bildweg<select data-ops-modal-image>${['Vectorize','Upscale','Remaster','Ohne Bildbearbeitung'].map(value => `<option ${value === r.image ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label class="fw-field-label">Listing-Schritt<select data-ops-modal-listing>${['Fehlenden Text schreiben','Vorhandenen Text prüfen'].map(value => `<option ${value === r.listing ? 'selected' : ''}>${value}</option>`).join('')}</select></label><p><strong>Endpunkt: Final Review</strong><br>Finale Freigabe und Export bleiben eigenständige Aktionen.</p>`, 'Ablauf lokal merken', () => { sequences.set(record.id, { image:root.querySelector('[data-ops-modal-image]').value, listing:root.querySelector('[data-ops-modal-listing]').value, end:'Final Review' }); core.announce(`${record.id}: Ablauf nur im Konzept geändert. Kein Start.`); refresh('autopilot'); });
  }
  function assignMetadata() {
    const ids = [...state.management.selected]; if (!ids.length) return;
    core.modal('Serie und Vorlage zuweisen', `<p><strong>${fmt(ids.length)} ausgewählte IDs</strong> · Auswahl über alle Listen-Seiten</p><label class="fw-field-label">Serie<input data-ops-modal-series placeholder="z. B. Weekend Collection"></label><label class="fw-field-label">Vorlage<select data-ops-modal-recipe><option>Auto</option><option>US Standard T-Shirt · Beispiel</option><option>DE Kernprodukte · Beispiel</option></select></label><p>Die Zuordnung betrifft nur die Auswahl in dieser Vorschau; keine Änderung bei Amazon.</p>`, 'Lokal zuweisen', () => { const name = root.querySelector('[data-ops-modal-series]').value.trim(), recipe = root.querySelector('[data-ops-modal-recipe]').value; ids.forEach(id => { if (name) series.set(id, name); recipes.set(id, recipe); }); core.announce(`${fmt(ids.length)} Beispielmotive lokal zugeordnet.`); refresh('management'); });
  }
  function operate(view, action, id) {
    const record = byId.get(id);
    if (action === 'previous' || action === 'next') { state[view].page += action === 'next' ? 1 : -1; refresh(view); }
    if (action === 'clear-selection') { state[view].selected.clear(); refresh(view); }
    if (action === 'clear-scope') { state[view].scope = null; state[view].query = ''; state[view].filter = 'all'; state[view].page = 1; refresh(view); }
    if (action === 'select-all') { const ids = data(view).matches.map(item => item.id); core.modal('Alle aktuellen Treffer auswählen?', `<p>Die Auswahl wird durch <strong>${fmt(ids.length)} Treffer</strong> der aktuellen Suche ersetzt – über alle Seiten.</p><p>Es startet keine Verarbeitung.</p>`, `${fmt(ids.length)} auswählen`, () => { state[view].selected = new Set(ids); refresh(view); }); }
    if (action === 'prepare-start') prepareStart();
    if (action === 'prepare-upload') {
      const selected=selectedRecords('uploadqueue'), eligible=selected.filter(item=>current(item).status==='ready' && ['queue','ready'].includes(uploadStatus(item)) && !uploadLocked(item)), omitted=selected.length-eligible.length, mode={draft:'Als Entwurf speichern; nichts live.',publish:'Live auf Amazon veröffentlichen.',fill:'Nur ausfüllen; nichts speichern.'}[state.uploadqueue.mode];
      core.modal('Upload-Lauf vorbereiten',`<p><strong>${fmt(eligible.length)} ausgewählte Queue-/Ready-Motive</strong> · ${fmt(omitted)} laufende, offene oder abgeschlossene Motive ausgenommen.</p>${listOf(eligible)}<p><strong>${mode}</strong></p><p>Einzelschritte prüfen vor dem Senden weiterhin die aktuelle Zulässigkeit. Fertige Belege werden nicht wiederholt; andere Macs behalten ihre Locks.</p><p>Konzeptvorschau: Keine Daten an Amazon gesendet und kein Ergebnisstatus verändert.</p>`);
    }
    if (action === 'upload-access') core.modal('Gemeinsamen Upload-Zugang prüfen',`<p>${record.id} · ${jobId(record)}</p><p>Ein gemeinsamer Anmelde- oder Zugangsgrund wird einmal behoben. Neue Übertragungen warten; fertige Entwürfe bleiben erhalten.</p><p>Konzeptvorschau: Keine Anmeldung geöffnet oder Verbindung verändert.</p>`);
    if (action === 'upload-observe') core.modal('Originalen Upload-Auftrag ansehen',`<p>${record.id} · ${jobId(record)}</p><p>${uploadLocked(record)?'Dieser Auftrag gehört aktuell einem anderen Mac.':'Der gespeicherte Originalaufruf muss zuerst beobachtet werden.'} Eine unklare Antwort ist kein bestätigter Fehlschlag und erlaubt keinen neuen Upload.</p><p>Konzeptvorschau: Keine Anfrage gesendet.</p>`);
    if (action === 'upload-receipt') core.modal('Gespeicherten Upload-Stand ansehen',`<p>${record.id} · ${jobId(record)}</p><p>${uploadStatus(record)==='done'?'Gespeicherter Amazon-Entwurf im Beispieldatensatz. Das ist keine Live-Veröffentlichung.':'Archivierter Beispieldatensatz. Er bleibt von neuen Läufen ausgenommen.'}</p><p>Originale und gespeicherter Beleg bleiben erhalten. Kein erneuter Upload gestartet.</p>`);
    if (action === 'sequence' && record) editSequence(record);
    if (action === 'assign') assignMetadata();
    if (action === 'prepare-products') { const selected=selectedRecords('live'); core.modal('Produkterweiterung vorbereiten',`<p>${fmt(selected.length)} explizit ausgewählte Beispieldesigns.</p>${listOf(selected)}<p>Vor tatsächlichen Amazon-Schreibaktionen bleibt die gesonderte erste Testfreigabe erforderlich. Ein Read oder diese Auswahl ersetzt sie nicht.</p><p>Konzeptvorschau: Keine Produkte angelegt, keine Freigabe gesetzt und keine Accountdaten gelesen.</p>`); }
    if (action === 'review-selected') core.handoff('review', [...state[view].selected]);
    if (action === 'listings-selected') core.handoff('listings', [...state[view].selected]);
    if (action === 'manage-selected') core.handoff('management', [...state[view].selected]);
    if (action === 'job-owner' && record) openActivityOwner(record);
    if (action === 'hub-one' && record) core.handoff('designs', [record.id]);
    if (action === 'review-one' && record) core.handoff('review', [record.id]);
    if (action === 'listings-one' && record) core.handoff('listings', [record.id]);
    if (action === 'manage-one' && record) core.handoff('management', [record.id]);
    if (action === 'stop-scope' && record) core.modal('Stoppumfang', `<p>${jobId(record)} · ${record.id}</p><p>Keine neuen Aufträge senden. Ein laufender Remote-Auftrag kann noch antworten und muss zuerst abgeglichen werden.</p><p>Konzeptvorschau: Kein laufender Auftrag wurde abgebrochen.</p>`);
    if (action === 'job' && record) core.modal(`Auftrag ${jobId(record)}`, `<p>Motiv: <strong>${esc(record.title)}</strong> · ${record.id}</p><p>Bereich: ${activityOwner(record).title} · Zustand: ${label('activity', record)}</p><p>${activityStatus(record) === 'uncertain' ? 'Antwort unklar: denselben Originalaufruf beobachten, nicht erneut senden.' : activityStatus(record) === 'done' ? 'Gespeichertes Ergebnis bleibt erhalten und wird nicht erneut erzeugt.' : 'Nur die noch offene Stufe kann nach aktuellem Zustandsabgleich fortgesetzt werden.'}</p><p>Konzeptvorschau: Keine Beobachtung oder Wiederholung gestartet.</p>`, 'Im zuständigen Bereich öffnen', () => openActivityOwner(record));
    if (action === 'shared-blocker') core.modal('Gemeinsamer Zugangsstopp', '<p>Ein Beispielszenario für einen geteilten Zugangsausfall. Neue Aufträge bleiben ungesendet; vorhandene Ergebnisse und Originalaufrufe bleiben erhalten.</p><p>Ein Zugangsproblem wird einmal behoben, nicht pro Motiv wiederholt. Danach wird nur die offene Arbeit erneut zugelassen.</p><p>Konzeptvorschau: Keine Verbindung geprüft oder verändert.</p>');
    if (action === 'prepare-resume') { const selected = selectedRecords(view), eligible = selected.filter(item => ['queued','held','failed'].includes(activityStatus(item))), retained = selected.length - eligible.length; core.modal('Offene Arbeit fortsetzen', `<p>${fmt(eligible.length)} noch offene Beispielaufträge · ${fmt(retained)} laufende, unklare oder fertige Aufträge ausgenommen.</p>${listOf(eligible)}<p>Zuerst Originalzustand und gemeinsamen Zugang abgleichen. Keine automatischen Retries; fertige Ergebnisse bleiben geschlossen.</p><p>Konzeptvorschau: Keine Aufträge gestartet oder wiederholt.</p>`); }
  }
  function bind(view, container) {
    if (bound.has(container)) return; bound.add(container);
    container.addEventListener('input', event => { if (event.target.dataset.opsQuery === view) { state[view].query = event.target.value; state[view].page = 1; refresh(view, true); } });
    container.addEventListener('change', event => { const target = event.target; if (target.dataset.opsSelect) { target.checked ? state[view].selected.add(target.dataset.opsSelect) : state[view].selected.delete(target.dataset.opsSelect); refresh(view); } if (target.hasAttribute('data-ops-page-select')) { const ids = data(view).rows.map(item => item.id); ids.forEach(id => target.checked ? state[view].selected.add(id) : state[view].selected.delete(id)); refresh(view); } });
    container.addEventListener('click', event => { const target = event.target.closest('button'); if (!target) return; if (target.dataset.opsAutoMode) { state.autopilot.mode=target.dataset.opsAutoMode; refresh('autopilot'); } if (target.dataset.opsUploadMode) { state.uploadqueue.mode=target.dataset.opsUploadMode; refresh('uploadqueue'); } if (target.dataset.opsFilter) { state[view].filter = target.dataset.opsFilter; state[view].page = 1; refresh(view); } if (target.dataset.opsAction) operate(view, target.dataset.opsAction, target.dataset.opsId); });
  }
  views.forEach(view => core.register(view, { title: titles[view], receive(ids) { const safe = normalize(ids); state[view].scope = new Set(safe); state[view].selected = new Set(safe); state[view].query = ''; state[view].filter = 'all'; state[view].page = 1; }, render(container) { containers.set(view, container); bind(view, container); refresh(view); } }));

  const settingSpecs = [
    { id:'display', title:'Darstellung', note:'Diese Gruppe ändert nur die lokale Konzeptdarstellung.', fields:[['density','Kartendichte',['Kompakt','Komfortabel']],['contrast','Kontrast',['Standard','Hoch']]], defaults:{density:'Kompakt',contrast:'Standard'} },
    { id:'automation', title:'Automatik und Übergaben', note:'Neue Einstellungen betreffen den nächsten Start. Laufende Arbeit und fertige Ergebnisse bleiben unverändert.', fields:[['mode','Startreichweite',['Gespeicherter Workflow','Einzelschritt']],['end','Endpunkt',['Final Review']]], defaults:{mode:'Gespeicherter Workflow',end:'Final Review'} },
    { id:'accounts', title:'Konten und Bildqualität', note:'Beste verfügbare Aboqualität anfordern. Bildmodell und Qualitätsstufe sind in dieser Vorschau nicht verifiziert.', fields:[['image','Bilderzeugung',['Beste verfügbare Aboqualität']],['export','Upload-Standard',['Amazon-Entwurf','Nur ausfüllen']]], defaults:{image:'Beste verfügbare Aboqualität',export:'Amazon-Entwurf'} },
    { id:'files', title:'Dateien und Wiederherstellung', note:'Originale, gespeicherte Requests und fertige Ergebnisse bleiben erhalten.', fields:[['history','Versionsverlauf',['Original und alle Versionen']],['recovery','Wiederaufnahme',['Gespeicherten Stand prüfen']]], defaults:{history:'Original und alle Versionen',recovery:'Gespeicherten Stand prüfen'} }
  ];
  const settingSaved = new Map(settingSpecs.map(spec => [spec.id, {...spec.defaults}]));
  const settingPrevious = new Map(), settingNotes = new Map();
  let settingsContainer = null;
  function updateSettingsGroup(group, restoreInputs = false) {
    const panel = settingsContainer?.querySelector(`[data-ops-setting-panel="${group}"]`);
    if (!panel) return;
    panel.querySelector('[data-ops-setting-note]').textContent = settingNotes.get(group) || 'Lokaler Beispielstand';
    panel.querySelector('[data-ops-undo-group]').hidden = !settingPrevious.has(group);
    if (restoreInputs) panel.querySelectorAll('[data-ops-setting-group]').forEach(input => { input.value = settingSaved.get(group)[input.dataset.opsSettingKey]; });
  }
  function renderSettings() {
    if (!settingsContainer) return;
    settingsContainer.innerHTML = `<div class="fw-heading"><div><h2>Einstellungen</h2><p>Änderungen werden automatisch übernommen – nur in dieser Vorschau.</p></div><span class="fw-ops-demo">Lokale Vorschau</span></div><div class="fw-ops-settings-grid">${settingSpecs.map(spec => { const values = settingSaved.get(spec.id); return `<section class="fw-ops-setting" data-ops-setting-panel="${spec.id}"><h3>${spec.title}</h3><p>${spec.note}</p>${spec.fields.map(([key, title, options]) => options.length === 1 ? `<dl class="fw-ops-fixed-value"><dt>${esc(title)}</dt><dd>${esc(values[key])}</dd></dl>` : `<label class="fw-field-label">${title}<select data-ops-setting-group="${spec.id}" data-ops-setting-key="${key}">${options.map(option => `<option ${values[key] === option ? 'selected' : ''}>${option}</option>`).join('')}</select></label>`).join('')}<div class="fw-ops-setting-actions"><button class="fw-button fw-quiet" type="button" data-ops-undo-group="${spec.id}" ${settingPrevious.has(spec.id) ? '' : 'hidden'}>Letzte Änderung zurücksetzen</button><span class="fw-secondary-text" data-ops-setting-note role="status" aria-live="polite">${settingNotes.get(spec.id) || 'Lokaler Beispielstand'}</span></div></section>`; }).join('')}</div>`;
  }
  core.register('settings', {
    title:'Einstellungen',
    render(container) {
      settingsContainer = container;
      if (!bound.has(container)) {
        bound.add(container);
        container.addEventListener('change', event => {
          const {opsSettingGroup: group, opsSettingKey: key} = event.target.dataset;
          const spec = settingSpecs.find(item => item.id === group);
          const field = spec?.fields.find(item => item[0] === key);
          if (!field || !field[2].includes(event.target.value)) return;
          const previous = settingSaved.get(group);
          if (previous[key] === event.target.value) return;
          settingPrevious.set(group, {...previous});
          settingSaved.set(group, {...previous, [key]:event.target.value});
          settingNotes.set(group, 'Automatisch übernommen · nur Vorschau');
          updateSettingsGroup(group);
        });
        container.addEventListener('click', event => {
          const button = event.target.closest('button');
          const group = button?.dataset.opsUndoGroup;
          if (!group || !settingPrevious.has(group)) return;
          settingSaved.set(group, {...settingPrevious.get(group)});
          settingPrevious.delete(group);
          settingNotes.set(group, 'Vorherigen Gruppenstand wiederhergestellt · nur Vorschau');
          updateSettingsGroup(group, true);
          container.querySelector(`[data-ops-setting-group="${group}"]`)?.focus({preventScroll:true});
        });
      }
      renderSettings();
    }
  });
  window.FlowWaveOperationsDemo = Object.freeze({ snapshot: () => ({ total: records.length, views: views.map(view => ({ view, selected:state[view].selected.size, scoped:state[view].scope?.size ?? records.length, matching:data(view).matches.length, rendered:containers.get(view)?.querySelectorAll('tbody > tr').length || 0 })) }) });
})();
