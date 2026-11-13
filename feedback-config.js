/* Shared, stable discussion identities. No credentials belong in this file. */
(() => {
  'use strict';
  const findings = {
    D1: 'Rohfehler verdrängen die nächste Handlung',
    R1: '„Ready“ braucht eine eindeutige Bedeutung',
    R2: 'Eine Ursache sollte eine Hauptaufgabe ergeben',
    N1: 'Werkzeuge sind zwei Ebenen tief versteckt',
    C1: 'Gespeicherter Batch und neuer Entwurf konkurrieren',
    I1: 'Ein Qualitätshinweis erklärt lange und handelt spät',
    N4: 'Automatik braucht einen sichtbaren Endpunkt',
    U1: 'Draft und Publish brauchen sichtbare Konsequenzen',
    N2: 'Übergaben verlieren den Auswahlkontext',
    R5: 'Ein fehlendes Listing direkt am Motiv schreiben',
    R4: 'Die geschlossene Zeile sollte schon zur Lösung führen',
    R3: 'Eine gespeicherte Ausnahme braucht weniger Fläche',
    R6: 'Offene Aufgaben vor vollständigen Text stellen',
    F1: 'Vier deaktivierte Aktionen belasten die Übersicht',
    F2: 'Der Effects Editor zeigt zu viele Regler auf einmal',
    M1: 'Gleich benannte Jobs lassen sich kaum unterscheiden',
    V1: 'Vorhandene Ergebnisse wirken im Sessionfilter unsichtbar',
    U2: 'Intake importieren steht nicht beim Leerzustand',
    U3: 'Die Ladephase sieht kurz wie ein leerer Arbeitsbereich aus',
    R7: 'Originalexport ohne Suchen in einer anderen Ansicht',
    N3: 'Hub und Designs benennen denselben Ort',
    B1: "Große Workflow-Stapel brauchen eine scanbare Queue",
    B2: "Aus einer Meldung direkt zum genauen Auftrag",
    B3: "Import mit automatischem Start klar benennen",
    B4: "Große Importprüfungen gezielt eingrenzen"
  };
  const screens = {"designs": "Designhub", "review": "Review", "listings": "Listings", "upload": "Upload vorbereiten", "uploadqueue": "Upload-Queue", "create": "Create Artworks", "sets": "Create Sets", "import": "Import", "remaster": "Remaster", "collections": "Imported Sets", "vectorize": "Vectorize", "upscale": "Upscale", "halftone": "Halftone", "effects": "Effects", "repairs": "Repairs", "autopilot": "Autopilot", "checks": "IP Checks", "live": "Live Designs", "management": "Design management", "activity": "Aktivität", "settings": "Einstellungen"};
  const topics = Object.create(null);
  Object.entries(findings).forEach(([id, title]) => {
    topics[`finding-${id}`] = Object.freeze({
      key: `finding-${id}`, kind: 'finding', id, label: `Finding ${id}`, title,
      term: `flowwave-audit-2026-11-13/finding/${id}`, anchor: id
    });
  });
  Object.entries(screens).forEach(([id, title]) => {
    topics[`screen-${id}`] = Object.freeze({
      key: `screen-${id}`, kind: 'screen', id, label: `Screen ${title}`, title,
      term: `flowwave-audit-2026-11-13/screen/${id}`, anchor: `screen-${id}`
    });
  });
  window.FlowWaveFeedbackConfig = Object.freeze({
    repo: 'smoremore/flowwave-ux-audit-2026-11-13',
    repoId: 'R_kgDOVsn2Ew',
    category: 'Announcements',
    categoryId: 'DIC_kwDOVsn2E84DLA7-',
    canonicalURL: 'https://smoremore.github.io/flowwave-ux-audit-2026-11-13/',
    serviceOrigin: 'https://giscus.app',
    topics: Object.freeze(topics)
  });
})();
