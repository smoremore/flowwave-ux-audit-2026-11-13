/* Isolated archive concept. Synthetic AR identities never enter the production FW selection. */
(() => {
  'use strict';
  const core = window.FlowWaveConceptCore;
  if (!core) return;
  const { esc, fmt, art } = core;
  const PAGE_SIZE = 24;
  const records = Object.freeze(Array.from({ length: 200 }, (_, index) => {
    const reference = core.records[index % core.records.length];
    const id = `AR-${String(index + 1).padStart(4, '0')}`;
    return Object.freeze({
      id, index, title: reference.title, palette: Object.freeze([...reference.palette]),
      status: index % 3 === 0 ? 'submitted' : 'draft',
      availability: index % 5 === 0 ? 'cloud' : 'local',
      version: 1 + index % 3,
      folder: `Upload/dateien/2611/${id}`,
      receipt: `DEMO-BELEG-${String(index + 1).padStart(4, '0')}`,
      textBinding: `DEMO-TEXT-${String(index + 1).padStart(4, '0')}-V${1 + index % 3}`
    });
  }));
  const byId = new Map(records.map(record => [record.id, record]));
  const labels = { all: 'Alle', draft: 'Entwurf gespeichert', submitted: 'An Amazon übermittelt' };
  const state = { query: '', status: 'all', sort: 'recent', page: 1, selected: new Set(), open: new Set(), plans: new Map() };
  const bound = new WeakSet();
  let container = null;
  function data() {
    const query = state.query.trim().toLocaleLowerCase('de');
    const searched = records.filter(record => !query || `${record.id} ${record.title} ${record.receipt}`.toLocaleLowerCase('de').includes(query));
    const matches = searched.filter(record => state.status === 'all' || record.status === state.status).sort((a, b) => state.sort === 'title' ? a.title.localeCompare(b.title, 'de') : state.sort === 'id' ? a.id.localeCompare(b.id) : b.index - a.index);
    const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), pages);
    const offset = (state.page - 1) * PAGE_SIZE;
    return { searched, matches, pages, offset, rows: matches.slice(offset, offset + PAGE_SIZE) };
  }
  function button(label, action, id = '', extra = '') {
    return `<button class="fw-button fw-quiet" type="button" data-ar-action="${action}" ${id ? `data-ar-id="${id}"` : ''} ${extra}>${label}</button>`;
  }
  function exact(ids) { return [...new Set(ids)].map(id => byId.get(id)).filter(Boolean); }
  function list(selected) {
    return `<ul>${selected.slice(0, 8).map(record => `<li><strong>${record.id}</strong> · ${esc(record.title)} · v${record.version}<br><span class="fw-secondary-text">${record.folder}</span></li>`).join('')}</ul>${selected.length > 8 ? `<p>… und ${fmt(selected.length - 8)} weitere ausgewählte Archiv-IDs.</p>` : ''}`;
  }
  function openFiles(ids) {
    const selected = exact(ids);
    if (!selected.length) return;
    const cloud = selected.filter(record => record.availability === 'cloud');
    core.modal(cloud.length ? 'Archivdateien bereitstellen' : 'Archivdateien öffnen', `<p><strong>${fmt(selected.length)} ausgewählte Archivstände</strong> · ${fmt(selected.length - cloud.length)} lokal · ${fmt(cloud.length)} nur in der Cloud</p>${list(selected)}<p>Dateien dieses Stands: Upload-PNG, SVG und Listing-Quelle. Original, Arbeitsversion und vorhandene Exportpakete bleiben am Archivrecord verknüpft.</p><details><summary>Belege</summary><ul>${selected.slice(0, 8).map(record => `<li>${record.id} · ${record.receipt}<br>${labels[record.status]} · ${record.textBinding}</li>`).join('')}</ul><p>„An Amazon übermittelt“ bestätigt in diesem Beispiel nur die Übertragung. Ein Live-Status ist hier nicht bestätigt.</p></details><p class="fw-secondary-text">Konzeptvorschau · kein Finder geöffnet, keine Cloud-Dateien geladen.</p>`, cloud.length ? 'Bereitstellung vormerken (Demo)' : '', cloud.length ? () => {
      cloud.forEach(record => state.plans.set(record.id, { kind: 'availability', version: record.version, receipt: record.receipt }));
      core.announce(`${fmt(cloud.length)} exakte Archivstände zur Bereitstellung vorgemerkt · Demo. Verfügbarkeit bleibt unbestätigt.`);
      render();
    } : null);
  }
  function prepareCopy(id) {
    const record = byId.get(id);
    if (!record) return;
    core.modal('Neue Produktionskopie vorbereiten', `<p><strong>${esc(record.title)}</strong> · ${record.id} · v${record.version}</p><p>Neue Arbeitskopie aus diesem Archivstand. Archivdateien, ID und Beleg bleiben erhalten.</p><p>${record.availability === 'cloud' ? 'Die Quelldateien müssen zuerst lokal verfügbar sein.' : 'Die gespeicherten Quelldateien sind im Beispieldatensatz lokal.'}</p><details><summary>Quelle</summary><p>${record.folder}<br>${record.receipt} · ${record.textBinding}</p></details><p class="fw-secondary-text">Konzeptvorschau · keine Datei kopiert, kein Designhub-Datensatz angelegt, keine Freigabe erteilt.</p>`, 'Kopierauftrag vormerken (Demo)', () => {
      state.plans.set(record.id, { kind: 'production-copy', version: record.version, receipt: record.receipt });
      core.announce(`${record.id} · neue Produktionskopie nur vorgemerkt. Archiv und Designhub unverändert.`);
      render();
    });
  }
  function folderDetails() {
    return `<details class="fa-folder-details"><summary>Ordner &amp; Ablage</summary><dl><dt>Produktion</dt><dd><code>Hub/&lt;Arbeitsbereich&gt;</code> · aktive Dateien und Versionen</dd><dt>Aufnahme</dt><dd><code>Upload/eingang</code></dd><dt>Archiv</dt><dd><code>Upload/katalog</code> · Datensätze<br><code>Upload/dateien/&lt;Monat&gt;/&lt;DesignID&gt;</code> · archivierte Dateien</dd><dt>System</dt><dd><code>Upload/sperren</code>, <code>sicherung</code>, <code>system</code></dd><dt>Nicht übernommen</dt><dd><code>Left over</code> · mit gespeichertem Grund</dd><dt>Exporte</dt><dd>Vorschlag: ZIPs über eine eigene Dateiliste mit Paketart und Zielordner finden.</dd></dl><p>Diese Ansicht ordnet die Ablage. Bestehende Ordner und Dateinamen werden nicht verändert.</p></details>`;
  }
  function render(restore = false) {
    if (!container) return;
    const active = document.activeElement;
    const focusId = restore ? active?.id : '';
    const caret = focusId ? active.selectionStart : null;
    const focusSelector = container.contains(active) ? ['arSelect','arAction','arId','arFilter','arSort','arPageSelect'].filter(key => Object.hasOwn(active.dataset || {}, key)).map(key => `[data-${key.replace(/[A-Z]/g, char => '-'+char.toLowerCase())}="${active.dataset[key]}"]`).join('') : '';
    state.open = new Set([...container.querySelectorAll('[data-ar-details][open]')].map(node => node.dataset.arDetails));
    const folderOpen = !!container.querySelector('.fa-folder-details')?.open;
    const d = data(), visibleSelected = d.rows.filter(record => state.selected.has(record.id)).length;
    container.innerHTML = `<div class="fw-heading"><div><h2>Lokales Archiv</h2><p>Dateien und Belege abgeschlossener Produktion.</p></div><span class="fw-secondary-text">200 Beispielstände · Konzept</span></div><div class="fw-toolbar"><label class="fw-field-label">Archiv durchsuchen<input id="fa-search" type="search" data-ar-search value="${esc(state.query)}" placeholder="Titel, Archiv-ID oder Beleg"></label><label class="fw-field-label">Sortieren<select data-ar-sort><option value="recent" ${state.sort === 'recent' ? 'selected' : ''}>Zuletzt abgelegt</option><option value="title" ${state.sort === 'title' ? 'selected' : ''}>Titel A–Z</option><option value="id" ${state.sort === 'id' ? 'selected' : ''}>Archiv-ID</option></select></label></div><div class="fw-facets" aria-label="Archiv filtern">${Object.entries(labels).map(([key, label]) => `<button type="button" class="fw-facet" data-ar-filter="${key}" aria-pressed="${state.status === key}">${label} <b>${fmt(key === 'all' ? d.searched.length : d.searched.filter(record => record.status === key).length)}</b></button>`).join('')}</div><div class="fw-selection"><label class="fw-checkbox"><input type="checkbox" data-ar-page-select ${d.rows.length && visibleSelected === d.rows.length ? 'checked' : ''} ${d.rows.length ? '' : 'disabled'}>Diese Seite (${d.rows.length})</label><span>${fmt(state.selected.size)} ausgewählt${state.selected.size ? ` · ${visibleSelected} auf dieser Seite` : ''}</span>${button(`Alle ${fmt(d.matches.length)} Treffer auswählen…`, 'select-all', '', d.matches.length ? '' : 'disabled')}${state.selected.size ? button('Auswahl löschen', 'clear') : ''}<span class="fw-selection-spacer"></span>${state.selected.size ? `<button class="fw-button fw-primary" type="button" data-ar-action="files-selected">Dateien öffnen (${fmt(state.selected.size)})</button>` : ''}</div><table class="fw-table fa-table"><thead><tr><th class="fw-check-col">Wahl</th><th class="fw-preview-col">Motiv</th><th class="fa-name-col">Design / Archiv-ID</th><th>Stand</th><th>Dateien</th><th>Details</th></tr></thead><tbody>${d.rows.map(record => `<tr><td><label class="fw-checkbox"><input type="checkbox" data-ar-select="${record.id}" ${state.selected.has(record.id) ? 'checked' : ''} aria-label="${esc(record.title)} ${record.id} auswählen"></label></td><td>${art(record, true)}</td><td class="fw-row-title"><strong>${esc(record.title)}</strong><small>${record.id} · v${record.version}</small></td><td data-label="Stand">${labels[record.status]}</td><td class="fw-row-action">${button(record.availability === 'cloud' ? 'Cloud-Dateien bereitstellen' : 'Dateien öffnen', 'files', record.id)}</td><td><details class="fa-record-details" data-ar-details="${record.id}" ${state.open.has(record.id) ? 'open' : ''}><summary>Details</summary><p>${record.folder}</p><p>${record.receipt}<br>${record.textBinding}</p><p>${record.availability === 'cloud' ? 'Cloud-Dateien · lokale Verfügbarkeit offen' : 'Dateien lokal · Beispieldatensatz'}</p>${state.plans.has(record.id) ? `<p>${state.plans.get(record.id).kind === 'availability' ? 'Bereitstellung' : 'Produktionskopie'} vorgemerkt · Demo</p>` : ''}${button('Neue Produktionskopie vorbereiten', 'copy', record.id)}</details></td></tr>`).join('') || '<tr><td colspan="6" class="fw-empty">Keine Archivstände für diese Suche.</td></tr>'}</tbody></table><div class="fw-pagination"><span>${d.matches.length ? `${fmt(d.offset + 1)}–${fmt(d.offset + d.rows.length)}` : '0'} von ${fmt(d.matches.length)} Archivständen · 24 pro Seite</span><div class="fw-page-buttons">${button('← Zurück', 'previous', '', state.page === 1 ? 'disabled' : '')}<span>Seite ${state.page} / ${d.pages}</span>${button('Weiter →', 'next', '', state.page === d.pages ? 'disabled' : '')}</div></div>${folderDetails()}`;
    const pageBox = container.querySelector('[data-ar-page-select]');
    if (pageBox) pageBox.indeterminate = visibleSelected > 0 && visibleSelected < d.rows.length;
    container.querySelector('.fa-folder-details').open = folderOpen;
    container.querySelectorAll('[data-ar-details]').forEach(details => details.addEventListener('toggle', () => details.open ? state.open.add(details.dataset.arDetails) : state.open.delete(details.dataset.arDetails)));
    if (focusId || focusSelector) {
      const input = container.querySelector(focusId ? `#${focusId}` : focusSelector);
      if (input) { input.focus({ preventScroll: true }); if (typeof caret === 'number' && input.setSelectionRange) input.setSelectionRange(caret, caret); }
    }
  }
  core.register('archive', {
    title: 'Lokales Archiv',
    render(node) {
      container = node;
      if (!bound.has(node)) {
        bound.add(node);
        node.addEventListener('input', event => { if (event.target.hasAttribute('data-ar-search')) { state.query = event.target.value; state.page = 1; render(true); } });
        node.addEventListener('change', event => {
          const target = event.target;
          if (target.hasAttribute('data-ar-sort')) { state.sort = target.value; state.page = 1; render(); }
          if (target.dataset.arSelect) { target.checked ? state.selected.add(target.dataset.arSelect) : state.selected.delete(target.dataset.arSelect); render(); }
          if (target.hasAttribute('data-ar-page-select')) { data().rows.forEach(record => target.checked ? state.selected.add(record.id) : state.selected.delete(record.id)); render(); }
        });
        node.addEventListener('click', event => {
          const target = event.target.closest('button');
          if (!target) return;
          if (target.dataset.arFilter) { state.status = target.dataset.arFilter; state.page = 1; render(); }
          const action = target.dataset.arAction;
          if (action === 'previous' || action === 'next') { state.page += action === 'next' ? 1 : -1; render(); }
          if (action === 'clear') { state.selected.clear(); render(); }
          if (action === 'files') openFiles([target.dataset.arId]);
          if (action === 'files-selected') openFiles([...state.selected]);
          if (action === 'copy') prepareCopy(target.dataset.arId);
          if (action === 'select-all') { const ids = data().matches.map(record => record.id); core.modal('Alle Archivtreffer auswählen?', `<p><strong>${fmt(ids.length)} Archivstände</strong> über alle Seiten. Die bisherige Auswahl wird ersetzt.</p>`, `${fmt(ids.length)} auswählen`, () => { state.selected = new Set(ids); render(); }); }
        });
      }
      render();
    }
  });
  window.FlowWaveArchiveDemo = Object.freeze({ snapshot: () => ({ total: records.length, selected: [...state.selected], matching: data().matches.length, rendered: container?.querySelectorAll('tbody > tr').length || 0, planned: [...state.plans.keys()] }) });
})();
