/* Isolated Giscus client per topic: one provider session cannot replace another draft. */
(() => {
  'use strict';
  const config = window.FlowWaveFeedbackConfig;
  const host = document.getElementById('feedbackHost');
  const statusNode = document.getElementById('feedbackHostStatus');
  const recovery = document.getElementById('feedbackHostRecovery');
  const retry = document.getElementById('feedbackHostRetry');
  const fallback = document.getElementById('feedbackHostFallback');
  const diagnostic = document.getElementById('feedbackHostDiagnostic');
  const errorNode = document.getElementById('feedbackHostError');
  const container = document.getElementById('feedbackGiscus');
  const key = new URL(location.href).searchParams.get('topic');
  const topic = config && Object.prototype.hasOwnProperty.call(config.topics, key) ? config.topics[key] : null;
  const returningFromSignIn = parent === window && new URL(location.href).searchParams.has('giscus');
  let phase = 'loading';
  let currentScript = null;
  let widgetFrame = null;
  let failedInitialLoad = false;
  let initialTimer = null;
  let measurementQueued = false;
  let lastHeight = 0;
  let discussion = null;
  function notify(type, fields) {
    if (parent === window || !topic) return;
    parent.postMessage({ type: `flowwave-feedback:${type}`, topic: topic.key, ...fields }, location.origin);
  }
  function measure() {
    measurementQueued = false;
    const height = Math.ceil(host.getBoundingClientRect().height + 24);
    if (height === lastHeight || height < 0) return;
    lastHeight = height;
    notify('resize', { height });
  }
  function queueMeasure() {
    if (measurementQueued) return;
    measurementQueued = true;
    requestAnimationFrame(measure);
  }
  function publishStatus(status, message, rawError = '') {
    phase = status;
    container.hidden = status === 'error' && /giscus.*not installed|not installed.*giscus/i.test(rawError);
    statusNode.textContent = message;
    statusNode.hidden = status === 'ready';
    statusNode.classList.toggle('af-host-status--error', status === 'error' || status === 'timeout');
    recovery.hidden = !['error', 'timeout'].includes(status);
    retry.hidden = !failedInitialLoad;
    diagnostic.hidden = !rawError;
    errorNode.textContent = rawError;
    notify('status', { status, message, discussionUrl: discussion });
    queueMeasure();
  }
  function widgetSeen() {
    clearTimeout(initialTimer);
    if (phase === 'loading' || phase === 'timeout') publishStatus('ready', '');
    queueMeasure();
  }
  function validDiscussionURL(value) {
    try {
      const url = new URL(value);
      return url.origin === 'https://github.com' && new RegExp(`^/${config.repo}/discussions/[0-9]+$`).test(url.pathname) ? url.href : null;
    } catch { return null; }
  }
  if (!topic) {
    document.title = '404 – Kommentarbereich nicht gefunden';
    statusNode.textContent = '404 · Dieser Kommentarbereich wurde nicht gefunden.';
    statusNode.classList.add('af-host-status--error');
    recovery.hidden = false;
    fallback.textContent = 'Zum FlowWave Audit';
    fallback.href = config?.canonicalURL || 'https://smoremore.github.io/flowwave-ux-audit-2026-11-13/';
    return;
  }
  function returnToAudit() {
    const target = new URL(config.canonicalURL);
    target.searchParams.set('feedback', topic.key);
    target.hash = topic.anchor;
    location.replace(target.href);
  }
  // Giscus signs in using target=_top. Its official client must first consume
  // and remove the OAuth session parameter; never forward it to the report.
  if (parent === window && !returningFromSignIn) {
    returnToAudit();
    return;
  }
  document.title = `${topic.label} – FlowWave Kommentare`;
  const backlink = new URL(config.canonicalURL);
  backlink.hash = topic.anchor;
  document.querySelector('meta[name="giscus:backlink"]').content = backlink.href;
  fallback.href = `https://github.com/${config.repo}/discussions?discussions_q=${encodeURIComponent(`in:title "${topic.term}"`)}`;
  const observer = new MutationObserver(() => {
    const candidate = container.querySelector('iframe.giscus-frame');
    if (candidate && candidate !== widgetFrame) {
      widgetFrame = candidate;
      widgetFrame.title = `Kommentare und Antworten zu ${topic.label}`;
      widgetFrame.addEventListener('load', queueMeasure);
    }
    queueMeasure();
  });
  observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  if ('ResizeObserver' in window) new ResizeObserver(queueMeasure).observe(host);
  window.addEventListener('resize', queueMeasure);
  window.addEventListener('message', event => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (event.origin === location.origin && event.source === parent && data.type === 'flowwave-feedback:measure' && data.topic === topic.key) {
      lastHeight = 0;
      queueMeasure();
      return;
    }
    if (event.origin !== config.serviceOrigin || !widgetFrame || event.source !== widgetFrame.contentWindow) return;
    if (!data.giscus || typeof data.giscus !== 'object') return;
    const payload = data.giscus;
    if (typeof payload.resizeHeight === 'number' && Number.isFinite(payload.resizeHeight) && payload.resizeHeight > 0) widgetSeen();
    if (payload.discussion && typeof payload.discussion === 'object') {
      const url = validDiscussionURL(payload.discussion.url);
      if (url && payload.discussion.repository?.nameWithOwner === config.repo) {
        discussion = url;
        fallback.href = discussion;
        failedInitialLoad = false;
        clearTimeout(initialTimer);
        publishStatus('ready', '');
      }
    }
    if (typeof payload.error === 'string') {
      clearTimeout(initialTimer);
      failedInitialLoad = false;
      const error = payload.error.slice(0, 2000);
      if (error.includes('Discussion not found')) {
        publishStatus('empty', 'Noch keine Diskussion angelegt. Dein erster Kommentar eröffnet sie.');
      } else if (/giscus.*not installed|not installed.*giscus/i.test(error)) {
        publishStatus('error', 'Kommentare sind noch nicht freigeschaltet. Der Seiteninhaber muss Giscus für dieses Audit-Repository aktivieren.', error);
      } else if (/Bad credentials|Invalid state value|State has expired/i.test(error)) {
        publishStatus('error', 'Die GitHub-Anmeldung muss erneuert werden. Bitte im Kommentarbereich erneut anmelden.', error);
      } else {
        publishStatus('error', 'Kommentare konnten gerade nicht geladen werden. Die Diskussion kann auch auf GitHub geöffnet werden.', error);
      }
    }
    queueMeasure();
  });
  function startClient() {
    if (widgetFrame || currentScript && !failedInitialLoad) return;
    if (currentScript) currentScript.remove();
    failedInitialLoad = false;
    publishStatus('loading', 'Kommentare werden geladen …');
    const script = document.createElement('script');
    currentScript = script;
    script.src = `${config.serviceOrigin}/client.js`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    Object.assign(script.dataset, {
      repo: config.repo,
      repoId: config.repoId,
      category: config.category,
      categoryId: config.categoryId,
      mapping: 'specific',
      term: topic.term,
      strict: '1',
      reactionsEnabled: '0',
      emitMetadata: '1',
      inputPosition: 'top',
      theme: 'light',
      lang: 'de'
    });
    script.addEventListener('error', () => {
      if (currentScript !== script) return;
      clearTimeout(initialTimer);
      if (widgetFrame) return;
      failedInitialLoad = true;
      publishStatus('error', 'Der Kommentardienst konnte nicht geladen werden. Erneut laden oder die Diskussion auf GitHub öffnen.');
    });
    script.addEventListener('load', () => {
      if (!returningFromSignIn) return;
      if (!new URL(location.href).searchParams.has('giscus')) returnToAudit();
      else publishStatus('error', 'Die Anmeldung konnte nicht abgeschlossen werden. Bitte Browser-Speicher für diese Seite erlauben und erneut anmelden.');
    });
    initialTimer = setTimeout(() => {
      if (phase === 'loading') publishStatus('timeout', 'Der Kommentardienst antwortet noch nicht. Dieser Bereich bleibt geöffnet; auch eine verspätete Antwort wird übernommen.');
    }, 12000);
    document.body.appendChild(script);
  }
  retry.addEventListener('click', () => {
    if (!failedInitialLoad || widgetFrame) return;
    startClient();
  });
  startClient();
  queueMeasure();
})();
