/* Real, per-topic discussions. A visited iframe stays mounted to retain drafts. */
(() => {
  'use strict';
  const config = window.FlowWaveFeedbackConfig;
  if (!config || !config.topics) return;
  const records = new Map();
  let activeTopic = null;
  let returnFocus = null;
  let refreshQueued = false;
  const dialog = document.createElement('dialog');
  dialog.className = 'af-dialog';
  dialog.id = 'auditFeedbackDialog';
  dialog.setAttribute('aria-labelledby', 'auditFeedbackTitle');
  dialog.setAttribute('aria-describedby', 'auditFeedbackPrivacy');
  dialog.innerHTML = `<div class="af-dialog-head"><div><p class="af-eyebrow" id="auditFeedbackContext">Teamfeedback</p><h2 id="auditFeedbackTitle">Kommentare</h2></div><button class="af-close" type="button" aria-label="Kommentare schließen" autofocus>×</button></div><p class="af-privacy" id="auditFeedbackPrivacy">Öffentliche Kommentare und Antworten · Zum Schreiben mit GitHub anmelden.</p><div class="af-toolbar"><button class="af-button" type="button" data-feedback-copy>Link kopieren</button><a class="af-link" data-feedback-github target="_blank" rel="noopener noreferrer">Auf GitHub öffnen ↗</a></div><div class="af-copy-fallback" hidden><label for="auditFeedbackCopyLink">Link zum Kopieren</label><input id="auditFeedbackCopyLink" readonly></div><p class="af-announcement" role="status" aria-live="polite"></p><div class="af-frame-zone"></div>`;
  document.body.appendChild(dialog);
  const heading = dialog.querySelector('#auditFeedbackTitle');
  const context = dialog.querySelector('#auditFeedbackContext');
  const announcement = dialog.querySelector('.af-announcement');
  const zone = dialog.querySelector('.af-frame-zone');
  const githubLink = dialog.querySelector('[data-feedback-github]');
  const copyButton = dialog.querySelector('[data-feedback-copy]');
  const copyFallback = dialog.querySelector('.af-copy-fallback');
  const copyInput = dialog.querySelector('#auditFeedbackCopyLink');

  const getTopic = key => typeof key === 'string' && Object.prototype.hasOwnProperty.call(config.topics, key) ? config.topics[key] : null;
  const searchURL = topic => `https://github.com/${config.repo}/discussions?discussions_q=${encodeURIComponent(`in:title "${topic.term}"`)}`;
  function discussionURL(value) {
    try {
      const url = new URL(value);
      return url.origin === 'https://github.com' && new RegExp(`^/${config.repo}/discussions/[0-9]+$`).test(url.pathname) ? url.href : null;
    } catch { return null; }
  }
  function activeScreen() {
    const node = document.querySelector('#flowwave-bento-concept .fw-screen:not([hidden])');
    const id = node && node.dataset.view;
    return getTopic(`screen-${id}`) ? id : 'designs';
  }
  function updateScreenButtons() {
    refreshQueued = false;
    const topic = getTopic(`screen-${activeScreen()}`);
    document.querySelectorAll('[data-feedback-screen]').forEach(button => {
      button.dataset.feedbackTopic = topic.key;
      button.setAttribute('aria-label', `${topic.label} kommentieren`);
      const label = button.querySelector('[data-feedback-label]');
      if (label) label.textContent = `${topic.title} kommentieren`;
    });
  }
  function queueScreenButtons() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(updateScreenButtons);
  }
  function activateScreenHash() {
    const topic = getTopic(location.hash.slice(1));
    if (!topic || topic.kind !== 'screen') return;
    const button = document.querySelector(`#flowwave-bento-concept button[data-screen="${topic.id}"]`);
    if (button) button.click();
    const root = document.getElementById('flowwave-bento-concept');
    if (root) requestAnimationFrame(() => root.scrollIntoView({ block: 'start', behavior: 'instant' }));
    queueScreenButtons();
  }
  function ensureRecord(topic) {
    if (records.has(topic.key)) return records.get(topic.key);
    const frame = document.createElement('iframe');
    const url = new URL('feedback.html', document.baseURI);
    url.searchParams.set('topic', topic.key);
    frame.src = url.href;
    frame.className = 'af-topic-frame';
    frame.title = `Kommentare und Antworten zu ${topic.label}`;
    frame.setAttribute('allow', 'clipboard-write');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.style.height = '560px';
    frame.hidden = true;
    const record = { frame, status: 'loading', message: 'Kommentare werden geladen …', url: null };
    records.set(topic.key, record);
    zone.appendChild(frame);
    return record;
  }
  function openFeedback(key, trigger) {
    const topic = getTopic(key);
    if (!topic) return;
    if (trigger instanceof HTMLElement) returnFocus = trigger;
    activeTopic = topic;
    context.textContent = topic.label;
    heading.textContent = topic.kind === 'finding' ? topic.title : `Feedback zum Screen ${topic.title}`;
    githubLink.href = searchURL(topic);
    copyButton.disabled = false;
    copyFallback.hidden = true;
    const record = ensureRecord(topic);
    records.forEach((entry, entryKey) => { entry.frame.hidden = entryKey !== key; });
    announcement.textContent = record.status === 'loading' ? record.message : '';
    if (record.url) githubLink.href = record.url;
    if (!dialog.open) dialog.showModal();
    record.frame.contentWindow?.postMessage({ type: 'flowwave-feedback:measure', topic: topic.key }, location.origin);
  }
  function showInvalidLink() {
    context.textContent = 'Feedback-Link';
    heading.textContent = 'Dieser Kommentarbereich wurde nicht gefunden';
    announcement.textContent = 'Wähle auf der Seite ein Finding oder einen Screen und öffne dort die Kommentare.';
    activeTopic = null;
    records.forEach(record => { record.frame.hidden = true; });
    githubLink.href = `https://github.com/${config.repo}/discussions`;
    copyButton.disabled = true;
    if (!dialog.open) dialog.showModal();
  }
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('[data-feedback-topic], [data-feedback-screen]') : null;
    if (!target) return;
    const key = target.hasAttribute('data-feedback-screen') ? `screen-${activeScreen()}` : target.dataset.feedbackTopic;
    if (!getTopic(key)) return;
    event.preventDefault();
    openFeedback(key, target);
  });
  dialog.querySelector('.af-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    copyFallback.hidden = true;
    announcement.textContent = '';
    const url = new URL(location.href);
    if (url.searchParams.has('feedback')) {
      url.searchParams.delete('feedback');
      history.replaceState(history.state, '', url.href);
    }
    const fallback = document.querySelector('[data-feedback-screen]') || document.getElementById('categoryFilter');
    const target = returnFocus && returnFocus.isConnected && returnFocus.getClientRects().length ? returnFocus : fallback;
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  });
  copyButton.addEventListener('click', async () => {
    if (!activeTopic) return;
    const url = new URL(config.canonicalURL);
    url.searchParams.set('feedback', activeTopic.key);
    url.hash = activeTopic.anchor;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url.href);
      copyFallback.hidden = true;
      announcement.textContent = 'Link zum Kommentarbereich kopiert.';
    } catch {
      copyInput.value = url.href;
      copyFallback.hidden = false;
      copyInput.focus();
      copyInput.select();
      announcement.textContent = 'Bitte den markierten Link kopieren.';
    }
  });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || !event.data || typeof event.data !== 'object') return;
    const data = event.data;
    const topic = getTopic(data.topic);
    const record = topic && records.get(topic.key);
    if (!record || event.source !== record.frame.contentWindow) return;
    if (data.type === 'flowwave-feedback:resize') {
      if (typeof data.height !== 'number' || !Number.isFinite(data.height)) return;
      record.frame.style.height = `${Math.max(180, Math.min(32000, Math.ceil(data.height)))}px`;
    } else if (data.type === 'flowwave-feedback:status') {
      if (!['loading', 'ready', 'empty', 'error', 'timeout'].includes(data.status)) return;
      record.status = data.status;
      record.message = typeof data.message === 'string' ? data.message.slice(0, 400) : '';
      const url = discussionURL(data.discussionUrl);
      if (url) record.url = url;
      if (activeTopic?.key === topic.key) {
        announcement.textContent = data.status === 'loading' ? record.message : '';
        if (record.url) githubLink.href = record.url;
      }
    }
  });
  document.addEventListener('flowwave:screenchange', queueScreenButtons);
  const concept = document.getElementById('flowwave-bento-concept');
  if (concept) new MutationObserver(queueScreenButtons).observe(concept, { attributes: true, subtree: true, attributeFilter: ['hidden'] });
  window.addEventListener('hashchange', activateScreenHash);
  updateScreenButtons();
  activateScreenHash();
  const requested = new URL(location.href).searchParams.get('feedback');
  if (requested) {
    const topic = getTopic(requested);
    if (topic) {
      if (topic.kind === 'screen') {
        const button = document.querySelector(`#flowwave-bento-concept button[data-screen="${topic.id}"]`);
        if (button) button.click();
      }
      openFeedback(requested, document.querySelector(`[data-feedback-topic="${requested}"]`) || document.querySelector('[data-feedback-screen]'));
    } else showInvalidLink();
  }
})();
