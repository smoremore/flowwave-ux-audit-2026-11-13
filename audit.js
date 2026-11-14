/* Sanitized audit content. The original findings retain their installed
   1.4.286 / 9c4f181 evidence. S1/S2 add a versioned native follow-up in
   1.4.287 / 85e457e; they do not revalidate the older findings globally. */
window.flowwaveFindings = [
  {
    id: 'R1', priority: 'P1', category: 'Listings',
    title: '„Ready“ braucht eine eindeutige Bedeutung.',
    summary: 'Die Listing-Zeile kann gleichzeitig „Ready“, „Legacy“, „4 to check“ und einen offenen IP-Status zeigen. Gespeicherter Text wirkt dadurch wie eine vollständige Freigabe.',
    problem: 'Der Lifecycle-Text und der aktuelle Prüfstatus stehen nebeneinander. Dass Legacy-Regeln nur Information sind, erklärt erst die geöffnete Karte. Das ist eine missverständliche Zustandsdarstellung, kein Beleg für einen umgangenen Export-Guard.',
    suggestion: 'Gespeicherte Textarbeit als „Listing vorhanden“ oder „Text gespeichert“ benennen. Eine führende Aufgabe zeigt den aktuellen Handlungsbedarf. Legacy-Regelhinweise heißen „Hinweise“, während Ready die Review-Freigabe bezeichnet.',
    preserve: 'Legacy-Texte bleiben erhalten. Hinweise, exakte IP-Zustände und alle Freigabe- und Exportprüfungen bleiben erreichbar.',
    acceptance: ['Ein gespeicherter Text mit offener IP-Aufgabe wirkt nicht exportbereit.', 'Legacy-Hinweise lassen sich von erforderlichen Korrekturen unterscheiden.'],
    evidence: [{file:'public/app.js',line:12447,detail:'Eigenes Ready-Wort aus dem gespeicherten Listing-Lifecycle.'},{file:'public/app.js',line:12503,detail:'Lifecycle, Legacy und softRules werden als Metazeile zusammengesetzt.'},{file:'public/app.js',line:12848,detail:'Erst im offenen Record steht: Legacy-Regeln sind Information.'}]
  },
  {
    id: 'R2', priority: 'P1', category: 'Review',
    title: 'Eine Ursache sollte eine Hauptaufgabe ergeben.',
    summary: 'Ein Text-IP-Problem kann sowohl im Listing-IP-Gate als auch als technische Aufgabe erscheinen. Mehrere „Open in IP Checks“-Links erschweren die Wahl der nächsten Aktion.',
    problem: 'Der Renderer führt Text-Wrapper-Gründe zusätzlich durch die technische Gate-Projektion. Nur ein bestimmter Live-Mark-Fall wird dort ausdrücklich dedupliziert. Das kann dieselbe Ursache in mehreren Zeilen und im offenen Gate-Zähler sichtbar machen.',
    suggestion: 'Appweit eine Ursache als eine direkt ausführbare Aufgabe zeigen. Kein Rundlauf über Hinweis → Nachweis → IP Checks → Review: das passende Feld oder die vorhandene Aufgabe am Eintrag öffnen. Technische Einzelheiten in genau einem optionalen Details-Bereich. Gemeinsame Voraussetzungen einmal für den Stapel zeigen; unabhängige Motive laufen weiter.',
    preserve: 'Exakte Records und Claims, vorhandene Ergebnisse, unterschiedliche Forschungslücken und Recovery bleiben unverändert. Eine zusammengeführte Anzeige darf keine Nachweise als vollständig ausgeben.',
    acceptance: ['Ein betroffener Text-IP-Grund hat genau einen führenden Lösungsweg.', 'Der Aufgaben-Zähler erklärt unabhängige offene Aufgaben statt mehrfacher Darstellungen.'],
    evidence: [{file:'public/app.js',line:18036,detail:'Text-Wrapper wird für die Listing-IP-Zeile aufgelöst.'},{file:'public/app.js',line:18054,detail:'Deduplication ist auf einen bestimmten Live-Mark-Fall begrenzt.'},{file:'public/app.js',line:18070,detail:'Technische Zeile kann einen weiteren IP-Checks-Link erhalten.'},{file:'public/app.js',line:18072,detail:'Nicht fertige Gate-Zeilen bestimmen den offenen Zähler.'}]
  },
  {
    id: 'R3', priority: 'P2', category: 'Review',
    title: 'Eine gespeicherte Ausnahme braucht weniger Fläche.',
    summary: 'Lange gespeicherte Owner-Begründungen stehen vollständig im Gate-Scanpfad. Eine bereits dokumentierte Entscheidung kann dadurch die nächste offene Aufgabe überragen.',
    problem: 'Die Artwork-IP-Konsequenz setzt die vollständige Begründung, Registerbeschreibung und Abgrenzung zum Listing zusammen. Diese Details sind relevant, konkurrieren im Hauptblick aber mit aktuellen Aufgaben.',
    suggestion: 'Eine kurze, ehrliche Zusammenfassung anzeigen: „Owner-Ausnahme gespeichert · Nachweise ansehen“. Die vollständige Begründung bleibt in einem lokalen Disclosure. Verbleibende Einschränkungen stehen weiterhin direkt am Status.',
    preserve: 'Vollständige Entscheidungsbegründung, fehlende Forschung, genaue Bindung und die Trennung von Artwork- und Listing-Prüfung. Eine Ausnahme wird niemals als saubere Prüfung bezeichnet.',
    acceptance: ['Die nächste offene Aufgabe bleibt ohne langen Erklärungstext erkennbar.', 'Die vollständige gespeicherte Begründung ist mit einer lokalen Aktion erreichbar.'],
    evidence: [{file:'public/app.js',line:17962,detail:'Vollständige gespeicherte Research-Akzeptanz im Konsequenztext.'},{file:'public/app.js',line:17963,detail:'Owner-Begründung und Registerbeschreibung werden aneinandergefügt.'}]
  },
  {
    id: 'R4', priority: 'P2', category: 'Review',
    title: 'Die geschlossene Zeile sollte schon zur Lösung führen.',
    summary: '„n to resolve“ beschreibt den Umfang. Welche Aufgabe jetzt ansteht, wird erst nach dem Aufklappen und Lesen der Gate-Liste klar.',
    problem: 'Die Summary zeigt Titel, optionale Produktionsmetadaten, Legacy und Status. Ausführbare Gate-Aktionen liegen im offenen Body. Zum Wechsel in die richtige Prüfung ist damit ein zusätzlicher Orientierungsschritt nötig.',
    suggestion: 'Die konkrete Aufgabe direkt in der Zeile ausführen, etwa Text korrigieren oder eine gespeicherte Prüfung fortsetzen. Das passende Feld oder die bestehende Aufgabe öffnet am Eintrag. Ein Ortswechsel bleibt nur für ein tatsächlich anderes Werkzeug nötig; genaues Motiv und Rückkehrpunkt werden mitgegeben.',
    preserve: 'Native Summary-Semantik, Tastaturbedienung, mehrere offene Records und exakte Subject-/Record-Bindung samt Rückkehrfokus. Keine verschachtelten Buttons in der Summary.',
    acceptance: ['Die relevante offene Aufgabe ist im geschlossenen Record erkennbar.', 'Ihre Aktion erreicht denselben exakten Zielrecord wie der bisherige Gate-Weg.'],
    evidence: [{file:'public/app.js',line:18152,detail:'Summary-Status setzt einen aggregierten to-resolve-Zähler zusammen.'},{file:'public/app.js',line:18315,detail:'Geschlossene Summary enthält Metadaten und Status, Gate-Aktionen folgen im Body.'}]
  },
  {
    id: 'R5', priority: 'P1', category: 'Listings',
    title: 'Ein fehlendes Listing direkt am Motiv schreiben.',
    summary: '„No listing yet. Generate one above“ schickt den Nutzer vom betroffenen Motiv zurück zur globalen Auswahl. Eine einzelne Aufgabe wird zum kleinen Batch-Workflow.',
    problem: 'Für ein einzelnes Motiv führt der benannte Basisweg über Auswahl, „Write selected“ und „Write missing listings“. Der leere Textbereich bietet dafür keinen direkten Start.',
    suggestion: 'Im leeren Textbereich „Listing für dieses Design schreiben“ anbieten. Der vorhandene Writer-Owner bekommt dasselbe exakte Motiv und zeigt die Folgeprüfung vor dem Start verständlich an.',
    preserve: 'Manuelles Schreiben, ausgewählte Batches, unchecked Drafts und expliziter Start. Laufende Arbeit, gespeicherte Rewrite-Requests und unzulässige Quellen bleiben geschützt.',
    acceptance: ['Ein fehlendes Listing lässt sich ohne Auswahlmenü gezielt starten.', 'Der direkte Start schreibt nur das benannte Motiv und bewahrt bestehende Requests.'],
    evidence: [{file:'public/app.js',line:12663,detail:'Der Empty State verweist auf Generate oben.'},{file:'public/index.html',line:2722,detail:'Write selected öffnet eine weitere Aktionsauswahl.'},{file:'public/index.html',line:2729,detail:'Write missing listings startet den ausgewählten fehlenden Text.'}]
  },
  {
    id: 'R6', priority: 'P2', category: 'Informationshierarchie',
    title: 'Offene Aufgaben vor vollständigen Text stellen.',
    summary: 'Ein geöffneter Review-Record zeigt direkt alle vier Listing-Felder und die komplette Gate-Liste. Detailtiefe und aktueller Handlungsbedarf erhalten ähnlich viel Gewicht.',
    problem: 'Die Listing-Copy ist standardmäßig vollständig geöffnet. Rechts erscheinen für jeden Gate Zustand und Konsequenz. Bei langen Texten und Begründungen wird die nächste Handlung visuell schwerer auffindbar.',
    suggestion: 'Review als kompakte Stapelliste ordnen: Motiv, aktueller Stand, nächste Aufgabe und passende Aktion pro Zeile. Details öffnen am Record; Artwork, Text und Nachweise bleiben dort in drei klar getrennten Zonen. Große Vorschau nur bei Bedarf.',
    preserve: 'Vollständige Sichtprüfung vor Ready, relevante Textstellen und aktuelle Fehler. Keine neuen Task-Tabs und kein ausgelagerter Inspector; Text und Nachweise bleiben am exakten Record.',
    acceptance: ['Mehrere Records mit Status und nächster offener Aufgabe sind gleichzeitig scanbar.', 'Vollständige Copy und Evidence bleiben per Tastatur ohne Ortswechsel erreichbar.', 'Suche, Statusfilter und Seitenauswahl behalten die genaue Auswahl und gespeicherte Entwürfe.'],
    evidence: [{file:'public/app.js',line:18297,detail:'Listing-Disclosure ist standardmäßig open und rendert vier Textfelder.'},{file:'public/app.js',line:18179,detail:'Alle Gate-Zeilen rendern Status, Konsequenz und Aktionen.'},{file:'public/app.js',line:18367,detail:'Listing und vollständige Gates sind benachbarte Record-Zonen.'}]
  },
  {
    id: 'R7', priority: 'P2', category: 'Export',
    title: 'Originalexport ohne Suchen in einer anderen Ansicht.',
    summary: 'Review verlinkt für Original und Text nach Listings. Erst dort liegt „Export text + artwork“. Der erkannte Exportauftrag muss im Ziel erneut gefunden werden.',
    problem: 'Sowohl die Artwork-Zone als auch der Export-Gate bieten „Open Listings“. Das ist ein verständlicher Eigentümer-Handoff, aber noch keine direkte Erledigung der aktuellen Aufgabe.',
    suggestion: '„Original + Listing exportieren“ als kontextuelle Aktion bereitstellen. Der bestehende Listings-Export-Owner übernimmt unverändert die Prüfung und Erstellung des eindeutig benannten Pakettyps.',
    preserve: 'Original-/Text-Export und Flying-Upload-Produktions-ZIP bleiben getrennt. Paketinhalt, Evidence, Freigabegrenzen und aktuelle Zulässigkeit werden weiterhin vom bestehenden Owner geprüft.',
    acceptance: ['Der Originalexport ist aus dem zulässigen Review-Record direkt erreichbar.', 'Die Aktion nennt ihren Pakettyp und verändert keine Produktionsfreigabe.'],
    evidence: [{file:'public/app.js',line:18073,detail:'Original-Export-Gate führt zurück nach Listings.'},{file:'public/app.js',line:18345,detail:'Weitere Open Listings export-Aktion in der Artwork-Zone.'},{file:'public/index.html',line:2907,detail:'Der eigentliche Export text + artwork wird in Listings angeboten.'}]
  }
];

window.flowwaveFindings.push(...[
  {
    "id": "N1",
    "priority": "P1",
    "category": "Navigation",
    "title": "Werkzeuge sind zwei Ebenen tief versteckt",
    "summary": "Ein konkretes Bildwerkzeug benötigt aus Designs drei Navigationseingaben am Desktop.",
    "problem": "Image Studio öffnet das zuletzt benutzte Werkzeug. Ein anderes Ziel wird erst im zweiten Menü gewählt; neun Werkzeuge konkurrieren dort.",
    "suggestion": "Erstellen direkt im Designhub anbieten. Im Studio die häufigsten Werkzeuge sichtbar machen; die vollständige Toolbox bleibt erreichbar.",
    "preserve": "Gemerkter Werkzeugzustand, vorhandene Routen und Queues.",
    "acceptance": "Designhub → Create mit einer Aktivierung; Wechsel zum häufigen Werkzeug mit höchstens zwei. Kompaktmodus mitprüfen.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Mac App: Designs → Image Studio → Werkzeugmenü → Ziel. Code: public/production-navigation.js:22–31, 45–49, 88–93; public/index.html:312–323. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "N2",
    "priority": "P1",
    "category": "Übergänge",
    "title": "Übergaben verlieren den Auswahlkontext",
    "summary": "Nach Create führt Open Designs zum allgemeinen Bestand statt genau zu den übernommenen Motiven.",
    "problem": "Der vorhandene Weiter-Button öffnet nur den Designs-Tab. Betroffene neue Motive müssen erneut gefunden und ausgewählt werden.",
    "suggestion": "Am bestätigten Übernahmebeleg: Workflow für diese Motive wählen. Datensatz-IDs und Auswahl direkt mitgeben.",
    "preserve": "Zuerst die dauerhafte Übernahme bestätigen; Originale, Wiederherstellung und explizites Routing erhalten.",
    "acceptance": "Nach Übernahme öffnet ein Klick genau die bestätigten Motive mit passender nächster Aktion. Kein neuer Provider-Aufruf durch Navigation.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Code: public/artwork-studio.js:2282–2293; native Create-Einstieg geprüft, Übernahme nicht neu ausgeführt. Installiert 1.4.286."
      }
    ],
    "basis": "Code"
  },
  {
    "id": "N3",
    "priority": "P2",
    "category": "Sprache",
    "title": "Hub und Designs benennen denselben Ort",
    "summary": "Navigation und Übergabe verwenden unterschiedliche Produktbegriffe.",
    "problem": "Send to Hub und Sent to Designs wirken wie unterschiedliche Ziele. Das globale Add artwork bleibt auch im Upload sichtbar, führt aber zur Produktionsaufnahme.",
    "suggestion": "Sichtbar durchgehend Designhub verwenden. Aufnahme eindeutig als Zum Designhub hinzufügen beschriften und am passenden Einstieg priorisieren.",
    "preserve": "Interne Routekeys, Historie und globale Aufnahmefähigkeit.",
    "acceptance": "Alle sichtbaren Übergaben benennen ihr tatsächliches Ziel konsistent.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native globaler Import-Picker aus Upload geöffnet und abgebrochen. Code: public/index.html:226, 2137–2141; public/artwork-studio.js:1375, 2291, 2298. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "N4",
    "priority": "P1",
    "category": "Übergänge",
    "title": "Automatik braucht einen sichtbaren Endpunkt",
    "summary": "Auto-start, Continuous, Start all steps und Full Auto haben unterschiedliche Reichweiten.",
    "problem": "Die konkrete Endstation eines Workflows und Änderungsoption liegen teilweise in More. Gleichartige Automatikbegriffe verlangen zusätzliche Interpretation.",
    "suggestion": "Neben Start knapp zeigen: Bis geprüftes Listing · Ändern. Einheitlich nach Einzelschritt, gespeichertem Workflow und Queue-Fortsetzung erklären.",
    "preserve": "Bestehende Owner-Defaults inklusive gemerkter Automatik. Getrennte Mechanismen und Stop-Verhalten. Final Review und Export bleiben eigene Entscheidungen.",
    "acceptance": "Vor Start sind Auswahl, Startfolge und Endpunkt sichtbar, ohne Hilfe oder Menü öffnen zu müssen.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Vectorize Run setup und Autopilot angesehen. Code: public/hub.js:1262–1280, 1403–1408, 1423–1434; public/index.html:379–396, 2968–2990. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "D1",
    "priority": "P1",
    "category": "Hinweise",
    "title": "Rohfehler verdrängen die nächste Handlung",
    "summary": "Designs und Autopilot zeigen lange JSON-Parserdiagnosen direkt im Hauptblick.",
    "problem": "Technische Positionen und Wiederholungen erklären kaum, was jetzt zu tun ist. Im Autopilot erscheint dieselbe Meldung in Current step und Listing & checks.",
    "suggestion": "Kurz: Listing-Prüfung unterbrochen. Gespeicherter Stand vorhanden. Daneben Stand öffnen. Vollständige Diagnose und Folgen unter Details.",
    "preserve": "Originalfehler, gespeicherte Ergebnisse und klare Aussage, dass kein automatischer Retry stattfand. Wiederholen nur über den zuständigen Recovery-Owner.",
    "acceptance": "Eine Ursache hat eine sichtbare Hauptmeldung und eine konkrete Aktion. Rohdiagnose ist mit einem Klick erreichbar.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Designs und Autopilot: mehrfach sichtbare Parserfehlermeldung. Code: public/hub.js:1389–1396. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "C1",
    "priority": "P1",
    "category": "Create",
    "title": "Gespeicherter Batch und neuer Entwurf konkurrieren",
    "summary": "Continue planning für den ausgewählten Batch steht neben einem geöffneten New batch Formular mit Save and start.",
    "problem": "Der beobachtete Screen zeigt einen gespeicherten Batch mit 16 Motiven und gleichzeitig einen neuen Formularentwurf mit 8. Zwei primäre Aktionen wirken auf verschiedene Objekte.",
    "suggestion": "Im Batchmodus gespeicherten Auftrag und Fortsetzen zeigen. New batch öffnet gezielt einen klar benannten Entwurfsmodus mit eigenem Abschluss.",
    "preserve": "Unabhängiger neuer Entwurf, gespeicherter Brief und exakte Recovery des bestehenden Batches. Save and start ist bereits vorhanden und bleibt erhalten.",
    "acceptance": "Jeder Modus zeigt genau ein aktives Objekt und eine führende Aktion; vorhandene Formulareingaben gehen beim Wechsel nicht verloren.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Create Artworks: gespeicherter Batch, Continue planning und geöffnetes New batch Formular gleichzeitig. Code: public/index.html:2008, 2058, 2106–2107; public/artwork-studio.js:11, 1152. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "M1",
    "priority": "P2",
    "category": "Remaster",
    "title": "Gleich benannte Jobs lassen sich kaum unterscheiden",
    "summary": "Die Worklist wiederholt Selection from Automatic niche mix und kürzt die Bezeichnung stark.",
    "problem": "Bei 17 Einträgen tragen viele Jobs denselben Anfang. Kleine Thumbnails und Zeit/ID übernehmen fast die ganze Orientierung.",
    "suggestion": "Motivname als erste Zeile, Zustand als zweite. Batchherkunft gruppieren; Zeit und ID in Details. Kandidaten zur Auswahl gezielt filterbar halten.",
    "preserve": "Exakte Jobidentität, Quellenanker, einzelne Fehler und vollständige Historie.",
    "acceptance": "Ein Job lässt sich ohne Öffnen anhand von Motiv, Zustand und Batch eindeutig wiederfinden.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Remaster Worklist mit 17 gespeicherten Jobs und mehrfach identischen, abgeschnittenen Titeln. Installiert 1.4.286."
      }
    ],
    "basis": "UI"
  },
  {
    "id": "F1",
    "priority": "P2",
    "category": "Effects",
    "title": "Vier deaktivierte Aktionen belasten die Übersicht",
    "summary": "Ohne Auswahl stehen Randomize, Discard, Save und Stop dauerhaft in der Finishing-Leiste.",
    "problem": "Nicht verfügbare Aktionen nehmen die gleiche prominente Befehlszone ein wie tatsächlich nutzbare Funktionen.",
    "suggestion": "Eine Auswahlleiste erscheint nach Auswahl. Discard nur bei Entwürfen, Stop nur während Arbeit. Der Einzelkarten-Editor bleibt direkt erreichbar.",
    "preserve": "Auswahlumfang, Save-Receipt, private Vorschau, Undo und echtes Stop-Verhalten.",
    "acceptance": "Ohne Auswahl bleiben Einstieg, Suche und Ansicht. Mit Auswahl erscheinen Anzahl und passende verfügbare Aktionen.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Finishing mit drei Motiven, keiner Auswahl und vier deaktivierten Befehlen. Code: public/index.html:1933–1939. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "F2",
    "priority": "P2",
    "category": "Effects",
    "title": "Der Effects Editor zeigt zu viele Regler auf einmal",
    "summary": "Looks, Tone und Texture stehen gleichzeitig in einem langen rechten Scrollbereich.",
    "problem": "Presetwahl und Feineinstellung konkurrieren. Die lokale Vorschau und Undo funktionieren, doch viele inaktive Optionen erschweren den Einstieg.",
    "suggestion": "Zuerst komplette Looks. Danach nur die gewählte Effektgruppe aufklappen; aktive Gruppen knapp zusammenfassen. Vorschau und Speichern bleiben stabil sichtbar.",
    "preserve": "Alle Effektparameter und Seeds, direkte Feineinstellung, Originalvergleich, private Versionen und Undo.",
    "acceptance": "Ein Look ist unmittelbar wählbar; jede Effektgruppe mit einer Aktion erreichbar. Keine versteckten aktiven Änderungen.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Effects Editor: Light vintage lokal angewendet, Live draft und Vergleich sichtbar; Undo ausgeführt, ohne Version zu speichern. Installiert 1.4.286."
      }
    ],
    "basis": "UI"
  },
  {
    "id": "I1",
    "priority": "P1",
    "category": "Hinweise",
    "title": "Ein Qualitätshinweis erklärt lange und handelt spät",
    "summary": "IP Checks zeigt eine große gelbe technische Beschreibung; die Handlung liegt außerhalb des Hinweises.",
    "problem": "Im beobachteten Fall beschreibt der Text native RGBA-Messung und mehrere mögliche Korrekturen. Die nächste Owner-Aktion ist nur Open artwork in Review weiter unten.",
    "suggestion": "Kurz Ursache, Unsicherheit und Konsequenz zeigen: Transparenz visuell nicht bestätigt. Direkt Im Vergleich prüfen. Vollständigen Befund lokal aufklappen.",
    "preserve": "Bildqualität, Visual IP, Copyright, Trademark, Rechercheabdeckung und Owner-Entscheidung bleiben fachlich getrennt. Keine automatisch behauptete Klärung.",
    "acceptance": "Jeder handlungsfähige Hinweis führt mit einer Aktion zum exakten Motiv und passenden Vergleich. Fehlende Evidenz bleibt sichtbar.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native IP Checks: ausgeklappter finaler Artwork-Record. Code: public/ip-checks.js:2579, 3115. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "V1",
    "priority": "P2",
    "category": "Navigation",
    "title": "Vorhandene Ergebnisse wirken im Sessionfilter unsichtbar",
    "summary": "Vectorize zeigt Finished 0, obwohl frühere Ergebnisse im Arbeitsordner vorhanden sind.",
    "problem": "Der Leerzustand erklärt den Umweg über View → All files. Seine einzige direkte Aktion führt zur Queue.",
    "suggestion": "Im Leerzustand Vorhandene Ergebnisse anzeigen direkt anbieten und den Sessionfilter klar benennen.",
    "preserve": "Unterschied aktuelle Session versus gesamter Ordner und korrekte Ergebniszuordnung.",
    "acceptance": "Frühere Ergebnisse werden aus dem Leerzustand mit einer Aktivierung sichtbar; keine erneute Verarbeitung.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Vectorize Finished 0 mit Hinweis auf All files. Code: public/index.html:1436. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "U1",
    "priority": "P1",
    "category": "Upload",
    "title": "Draft und Publish brauchen sichtbare Konsequenzen",
    "summary": "Die präzise Erklärung der Upload-Modi ist nur für Screenreader vorhanden.",
    "problem": "Draft, Publish und Fill only liegen gleichrangig unten in der Seitenleiste. Der spätere Startbutton benennt die Aktion korrekt; die Moduswahl selbst bleibt für Sehende knapp.",
    "suggestion": "Eine sichtbare Zeile am Modus: Als Entwurf auf Amazon speichern, zur Veröffentlichung übermitteln oder nur ausfüllen. Übermittlung und bestätigter Live-Status bleiben getrennt. Keine zusätzliche Bestätigungsrunde.",
    "preserve": "Draft als Standard, exakter Startscope und echte Ergebnisbelege. Gespeicherter Draft bleibt von einer Veröffentlichung unterscheidbar.",
    "acceptance": "Die Konsequenz ist vor jedem Start sichtbar; der Abschluss benennt Entwurf oder Übermittlung. Live erscheint erst nach einem separaten Kontobeleg.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Upload Queue und Done mit gespeicherten Drafts. Code: public/index.html:3164–3170; public/upload.js:17–25, 91–101, 1945–1954. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "U2",
    "priority": "P2",
    "category": "Upload",
    "title": "Intake importieren steht nicht beim Leerzustand",
    "summary": "Der leere Upload empfiehlt Import, die Aktion liegt jedoch im Mehr-Menü.",
    "problem": "Der vorhandene Open Review Button ist hilfreich. Für den ebenfalls beschriebenen Intake-Weg muss das Menü erneut durchsucht werden.",
    "suggestion": "Im Leerzustand Aus Review öffnen und Intake importieren direkt anbieten. Nach Übergabe den betroffenen Upload fokussieren.",
    "preserve": "Review-Übergabe existiert bereits. Aufnahmeprüfung, Paketidentität und Ordner-Recovery bleiben beim zuständigen Owner.",
    "acceptance": "Beide erlaubten Aufnahmewege sind vom leeren Upload mit einer Aktivierung erreichbar.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Upload Leerzustand nach abgeschlossenem Laden. Code: public/index.html:3115–3123, 3190; public/upload.js:985–1040, 1218–1232. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  },
  {
    "id": "U3",
    "priority": "P2",
    "category": "Upload",
    "title": "Die Ladephase sieht kurz wie ein leerer Arbeitsbereich aus",
    "summary": "Beim ersten Öffnen waren leere Spalten und Nothing ready sichtbar, bevor der richtige Zustand erschien.",
    "problem": "Unbekannter Datenstand und bestätigte leere Queue sind zunächst kaum unterscheidbar. Der Ladehinweis liegt im Mehr-Menü. Der beobachtete Ladevorgang wurde später erfolgreich abgeschlossen.",
    "suggestion": "Sichtbar Wird geladen anzeigen; Start neutral halten und die leere Vorschau ausblenden. Bei tatsächlichem Fehler Erneut laden direkt im Bereich.",
    "preserve": "Vorhandener echter Leerzustand mit Open Review und vorhandene Fehler-Recovery. Kein Datenverlust oder dauerhaftes Hängen wurde nachgewiesen.",
    "acceptance": "Laden, leer und fehlgeschlagen zeigen drei eindeutige Zustände im selben Arbeitsbereich.",
    "evidence": [
      {
        "file": "Beobachtung und Quelle",
        "line": "1.4.286",
        "detail": "Native Upload Erstaufruf und späterer erfolgreicher Zustandswechsel. Code: public/index.html:3123–3127, 3134–3142, 3221–3227; public/upload.js:65–71, 1343–1368. Installiert 1.4.286."
      }
    ],
    "basis": "UI und Code"
  }
]);
window.flowwaveFindings.push(...[
  {
    "id": "B1",
    "priority": "P1",
    "category": "Autopilot",
    "title": "Große Workflow-Stapel brauchen eine scanbare Queue",
    "summary": "Autopilot navigiert gespeicherte Workflows über eine Auswahlliste und Back/Next. Die große Einzelansicht erschwert das Abarbeiten vieler unterschiedlicher Zustände.",
    "problem": "Die Oberfläche bietet an dieser Stelle keine suchbare Statusliste mit mehreren gleichzeitig sichtbaren Workflows. Bei großen Beständen müssen Titel und Zustände im Select oder nacheinander verglichen werden.",
    "suggestion": "Eine kompakte Workflow-Queue mit Suche, Statusgruppen, nächster Aktion und exakter Mehrfachauswahl anbieten. Den Sequenzeditor nur für den gewählten Auftrag öffnen.",
    "preserve": "Manual, Semi und Full Auto; gespeicherte Routen, Stop und Recovery; aktuelle Grenze von 25 Workflows pro Start. Finale Freigabe bleibt im Review.",
    "acceptance": [
      "Auch 1.000 Workflows lassen sich nach Aufgabe eingrenzen, ohne den Einzelinspektor durchzublättern.",
      "Ein Start benennt seine genauen IDs und höchstens 25 startbare Workflows.",
      "Fertige Geschwister bleiben erhalten; unklare Starts werden zuerst abgeglichen."
    ],
    "evidence": [
      {
        "file": "public/index.html",
        "line": 3010,
        "detail": "Saved workflow Select, Back/Next und Einzelinspektor bis Zeile3055."
      },
      {
        "file": "public/autopilot.js",
        "line": 288,
        "detail": "Alle Workflow-Optionen werden aus rows erzeugt; aktueller Datensatz wird im Stepper inspiziert."
      },
      {
        "file": "public/index.html",
        "line": 2987,
        "detail": "Full Auto nennt die bestehende Grenze von25 Workflows pro Start."
      }
    ],
    "basis": "Code · 1.4.286"
  },
  {
    "id": "B2",
    "priority": "P1",
    "category": "Aktivität",
    "title": "Aus einer Meldung direkt zum genauen Auftrag",
    "summary": "Activity kennt die ID der gemeldeten Arbeit. Open führt jedoch nur in den allgemeinen Bereich.",
    "problem": "Die Zeile bindet row.id an ihre Aktion, ruft aber openArea(area) ohne diese Identität auf. In großen Queues beginnt die Suche nach dem betroffenen Auftrag im Ziel erneut.",
    "suggestion": "Job-/Record-ID, aktuelle Version und Rückkehrkontext mitgeben. Der Zielbereich zeigt direkt diesen Auftrag und seine passende Recovery.",
    "preserve": "Vorhandene Bereichsrouten und Stop-Grenzen. Gemeinsame Zugangs-, Ordner- oder Quota-Blocker einmal bündeln; unklare Originalaufrufe nicht neu absenden.",
    "acceptance": [
      "Open aus Activity fokussiert genau den gemeldeten Auftrag.",
      "Die Rückkehr erhält Liste, Filter und Auswahl.",
      "Ein gemeinsamer Blocker erzeugt eine konkrete Recovery statt derselben Warnung pro Motiv."
    ],
    "evidence": [
      {
        "file": "public/activity-overview.js",
        "line": 361,
        "detail": "Die Aktion setzt activityOpen=row.id, ihr Handler öffnet aber nur openArea(area)."
      },
      {
        "file": "public/activity-overview.js",
        "line": 521,
        "detail": "openArea schließt Activity und ruft lediglich area.open() auf."
      }
    ],
    "basis": "Code · 1.4.286"
  },
  {
    "id": "B3",
    "priority": "P1",
    "category": "Import",
    "title": "Import mit automatischem Start klar benennen",
    "summary": "Der Import-Button nennt nur das Importieren. Bei aktivem Auto wird zusätzlich der Produktionsworkflow angestoßen.",
    "problem": "Auto ist standardmäßig an, sofern auf diesem Mac nicht anders gespeichert. Button und kurze Konsequenz beschreiben nur Import/Kopieren; der Request trägt bei aktivem Auto zusätzlich autoStart.",
    "suggestion": "Die Aktion bei aktivem Auto als „n importieren + Workflow starten“ beschriften. Zielroute, gewählte Motive und ausgelassene Problemfälle direkt daneben zeigen; gemerkte Wahl erhalten.",
    "preserve": "Originale, Importentscheidungen und gespeicherte Auto-Einstellung. Kein zusätzlicher Bestätigungsdialog für denselben bereits klar benannten Umfang.",
    "acceptance": [
      "Der Auslöser benennt die tatsächliche Folgeaktion bei Auto an und aus.",
      "Problematische Geschwister bleiben ausgenommen; gültige Motive können weiter.",
      "Der Import bleibt vor dem ersten Klick eine Vorschau."
    ],
    "evidence": [
      {
        "file": "public/folder-import.js",
        "line": 313,
        "detail": "Auto ist an, außer die gespeicherte Wahl ist false."
      },
      {
        "file": "public/folder-import.js",
        "line": 367,
        "detail": "Button und Konsequenz benennen Import/Kopieren."
      },
      {
        "file": "public/folder-import.js",
        "line": 633,
        "detail": "Der Import-Request übergibt bei aktivem Auto zusätzlich die Produktionsroute."
      }
    ],
    "basis": "Code · 1.4.286"
  },
  {
    "id": "B4",
    "priority": "P2",
    "category": "Import",
    "title": "Große Importprüfungen gezielt eingrenzen",
    "summary": "Import bietet All und Needs a look, aber keine Suche, Sortierung oder Seiten. Alle passenden Datensätze werden gleichzeitig gerendert.",
    "problem": "Bei Hunderten oder Tausenden Entscheidungen fehlt die gezielte Orientierung nach Titel, ID und Problemart. Das vollständige Rendern ist zusätzlich ein Skalierungsrisiko; eine tatsächliche Verlangsamung wurde nicht gemessen.",
    "suggestion": "Suche, kompakte Zustandsgruppen und eine begrenzte Seite oder virtuelle Liste einführen. Entscheidungen an genaue IDs binden und über Filter-/Seitenwechsel erhalten.",
    "preserve": "Versionen, Alternativen, mitgebrachte Listings, per-Record Entscheidungen und ausgelassene Geschwister. Keine künstliche Obergrenze für den Gesamtbestand.",
    "acceptance": [
      "Die Suche erreicht auch den letzten Datensatz eines großen Importbestands.",
      "Nur ein begrenzter sichtbarer Ausschnitt wird gerendert; vollständige Zähler bleiben korrekt.",
      "Seitenauswahl und alle gefilterten Treffer sind getrennt; keine Entscheidung geht beim Blättern verloren."
    ],
    "evidence": [
      {
        "file": "public/index.html",
        "line": 5309,
        "detail": "Importfilter All / Needs a look; keine Suche, Sortierung oder Pagination."
      },
      {
        "file": "public/folder-import.js",
        "line": 374,
        "detail": "renderList ersetzt die Liste durch sämtliche passenden Records per map."
      }
    ],
    "basis": "Code · 1.4.286"
  }
]);
window.flowwaveFindings.push(
  {
    id: 'S1', priority: 'P1', category: 'Imported Sets',
    title: 'Der Leerzustand führt nicht zuverlässig ins Import-Setup.',
    summary: 'Ein nativer Versuch ließ den Leerzustand stehen. Im späteren isolierten Browser-Test öffnete derselbe Einstieg das Setup korrekt. Der native Einzelfall bleibt gezielt nachzuprüfen.',
    problem: 'Native Nachbegehung in 1.4.287: Im leeren Imported-Sets-Bereich wurde „Go to Import setup“ einmal aktiviert. Das Setup erschien dabei nicht. Die Gegenprobe über „Import a new set“ öffnete Dateien-/Ordnerauswahl mit 50-MB-Limit und dem Hinweis auf null Generierungen. Beide Auslöser rufen laut Code openCollectionSetup(\'\') auf; die Ursache der unterschiedlichen beobachteten Wirkung ist damit nicht erklärt.',
    suggestion: 'Beide Einstiege als denselben zuverlässigen Ein-Klick-Weg prüfen und integrieren. Das geöffnete Setup und der Fokus auf dem ersten bedienbaren Feld müssen die erfolgreiche Navigation erkennbar machen.',
    preserve: 'Dateien- und Ordneraufnahme, Größenlimit, bestehende Importziele und gestagte Dateien. Das Öffnen des Setups startet weder Import noch Generierung.',
    acceptance: [
      'Der Leerzustand-Einstieg und „Import a new set“ öffnen aus derselben Ausgangslage jeweils das Setup.',
      'Nach dem Öffnen liegt der Tastaturfokus auf dem ersten bedienbaren Feld; beim Schließen kehrt er zum Auslöser zurück.',
      'Die Prüfung startet keinen Import und keine Generierung.'
    ],
    basis: 'Native UI und Code; Browser-Gegenprobe am 14.11. · 1.4.287',
    sourceVersion: '1.4.287', sourceCommit: '85e457e',
    evidence: [
      {file: 'Native UI · 1.4.287', detail: 'Einmaliger Leerzustand-Klick ohne sichtbares Setup; anschließende Gegenprobe über „Import a new set“ erfolgreich. Kein Import und keine Generierung ausgeführt.'},
      {file: 'public/app.js', line: 31794, detail: 'Der Leerzustand-Button ruft openCollectionSetup(\'\') auf (bis Zeile 31796).'},
      {file: 'public/app.js', line: 33669, detail: 'Der obere Import-Auslöser verwendet denselben Funktionsaufruf.'},
      {file: 'public/app.js', line: 33204, detail: 'Die gemeinsame Funktion öffnet den Setup-Controller und fokussiert bei sichtbarem Dialog das Dateifeld (bis Zeile 33211). Das erklärt die beobachtete Abweichung noch nicht.'}
    ]
  },
  {
    id: 'S2', priority: 'P1', category: 'Repairs',
    title: '„All“ stellt die vorhandenen Repairs-Motive nicht wieder her.',
    summary: 'Repairs zeigte zunächst drei Records. Nach „Needs attention“ blieben 0 von 3 sichtbar; „All“ brachte die Records nicht zurück. Der Codebeleg liegt im gemeinsamen Filter-Controller.',
    problem: 'In der nativen App 1.4.287 blockierte der Weg All → Needs attention → All die Rückkehr zur vorhandenen Sammlung. Ein Inhaltsverlust wurde dabei nicht beobachtet. Der gemeinsame Controller liest options.valueOf auch dann, wenn nur die geerbte Object.prototype.valueOf-Methode vorhanden ist. Repairs liefert keinen eigenen valueOf-Callback: Der daraus entstehende Wert „[object Object]“ passt zu keinem erlaubten Filter und schließt alle Records aus.',
    suggestion: 'Die Ermittlung zulässiger Filterwerte im gemeinsamen Owner korrigieren. Ohne eigenen Callback muss der tatsächliche data-filter-value-Wert gelten; fremde oder ungültige Werte dürfen nicht als aktive Auswahl übernommen werden.',
    preserve: 'Alle Records, gespeicherte Reparaturen und Versionen. Anzeige, aria-pressed, Tastaturzustand und gegebenenfalls Seitenauswahl müssen denselben echten Filterwert abbilden; Auswahl und aktuelle Sammlung bleiben erhalten.',
    acceptance: [
      'Eine fokussierte Regression durchläuft All → Needs attention → All im tatsächlichen Repairs-Renderer und zeigt anschließend wieder die ursprünglichen drei Records.',
      'Nur zulässige Filterwerte werden übernommen; aktive Darstellung und aria-pressed stimmen mit der sichtbaren Teilmenge überein.',
      'Suche, Sortierung und Auswahl bleiben konsistent; der Filterwechsel verändert keine gespeicherten Inhalte.'
    ],
    basis: 'Native UI und Code · 1.4.287',
    sourceVersion: '1.4.287', sourceCommit: '85e457e',
    evidence: [
      {file: 'Native UI · 1.4.287', detail: 'Anfangs drei Records unter All; nach Needs attention 0 von 3. All stellte die drei Records im beobachteten Ablauf nicht wieder her.'},
      {file: 'public/app.js', line: 130, detail: 'options.valueOf?.(control) wird vor data-filter-value ausgewertet; eine geerbte valueOf-Methode verhindert den vorgesehenen Fallback (bis Zeile 131).'},
      {file: 'public/artwork-repairs.js', line: 651, detail: 'Repairs übergibt getSelectedValue und onSelect, aber keinen eigenen valueOf-Callback (bis Zeile 652).'},
      {file: 'public/artwork-repairs.js', line: 142, detail: 'itemMatches akzeptiert nur all, repaired, unrepaired oder attention; „[object Object]“ erfüllt keine Bedingung (bis Zeile 144).'}
    ]
  }
);
window.flowwaveFindings.push(...[
  {
    "id": "B5",
    "priority": "P1",
    "category": "Stapelverarbeitung",
    "title": "Ein großer Bestand darf den Arbeitsbereich nicht blockieren.",
    "summary": "Nach 1.000 importierten Designs und 576 gequeueten Ausschnitten blieb die Oberfläche bei „Loading artwork“ und „Run status unavailable“. Lokale Statusabfragen liefen in Timeouts.",
    "problem": "Im isolierten Test mit dem installierten Code 1.4.287 waren die Dateien vollständig gespeichert. Beim anschließenden Öffnen des Bestands reagierte der Server nicht mehr innerhalb der Status-Timeouts; sein Prozess belegte ungefähr einen CPU-Kern. Ein kurzes CPU-Sample zeigte verschachtelte Verarbeitung mit synchronen JSON-Dateilesungen. Der Hub prüft je Design drei Routen und ermittelt dabei wiederholt den gemeinsamen Studio-Status, der sämtliche Jobs liest. Dieser Codepfad erklärt den Engpass plausibel; eine exakte Zuordnung benannter JavaScript-Frames oder allgemeine Kapazitätsgrenze wurde nicht gemessen.",
    "suggestion": "Gemeinsamen Laufstatus einmal je konsistenter Antwort ermitteln. Bestände und Jobstatus über begrenzte, aktualisierbare Leseprojektionen laden; Details erst für den geöffneten Eintrag. Bei einem Ladefehler eine Meldung mit „Laden erneut versuchen“ zeigen. Auswahl und fertige Dateien bleiben erhalten; unabhängige vorhandene Ergebnisse bleiben nutzbar.",
    "preserve": "Aktuelle Start-/Mutationsprüfungen, exakte IDs und dauerhafte Ergebnisse. Ein Cache darf keine veraltete Zulässigkeit zum Starten oder Freigeben verwenden.",
    "acceptance": [
      "1.000 Designs plus 96 Blätter und 576 wartende Kinder lassen sich öffnen, durchsuchen und bearbeiten, während weitere Bereiche reagieren.",
      "Der gemeinsame Studio-Status wird pro Bestandsantwort begrenzt gelesen; die Anzahl der Dateilesungen wächst nicht je Design × Route × sämtliche Jobs.",
      "Ein fehlgeschlagener Ladevorgang bietet genau einen Wiederherstellungsweg ohne erneuten Import oder doppelte Aufträge."
    ],
    "basis": "Lokaler Mengenlauf, UI-Beobachtung, CPU-Sample und installierter Code · 1.4.287",
    "sourceVersion": "1.4.287",
    "sourceCommit": "85e457e",
    "evidence": [
      {
        "file": "Isolierter Mengenlauf · 14.11.2026",
        "detail": "1.000 Original-/Zielhashes, 96 Kontaktblätter und 576 pixelgenaue Crops gespeichert. Nach Neustart erneut schreibgeschützt bestätigt. Keine Generierung."
      },
      {
        "file": "UI-Beobachtung · 1.4.287",
        "detail": "Loading artwork, Run status unavailable, Queue-/Recovery-Timeouts. Eine lokale Statusabfrage antwortete innerhalb von 10 Sekunden nicht; Testprozess ungefähr 100 % CPU."
      },
      {
        "file": "server.js",
        "line": 5580,
        "detail": "Alle Designs werden verarbeitet; drei Routen je Design rufen in Zeile 5622–5624 hubIntakeBusyReason auf."
      },
      {
        "file": "server.js",
        "line": 5510,
        "detail": "Gemeinsamer Zustand über studioIsBusy (2588–2601) und service.status."
      },
      {
        "file": "src/image-studio-service.js",
        "line": 1018,
        "detail": "status liest sämtliche Jobs über listJobs; src/image-studio-store.js:2577–2604 liest deren JSON-Dateien synchron."
      }
    ]
  },
  {
    "id": "B6",
    "priority": "P2",
    "category": "Imported Sets",
    "title": "96 Kontaktblätter brauchen eine gezielte Blattwahl.",
    "summary": "Die Blattwahl besteht aus einer langen horizontalen Reihe. Bei 96 Blättern sind nur wenige sichtbar; Dateinamen und wiederholte Statusangaben werden abgeschnitten.",
    "problem": "Die Suche links findet Sets, aber kein bestimmtes Blatt innerhalb eines Sets. Im Testbestand mit 96 Blättern und je sechs gespeicherten Ausschnitten fehlte ein kurzer Weg zum gesuchten Dateinamen oder zu noch offenen Motiven. Die seitlich scrollende Reihe wiederholt dieselben Zahlen und beansprucht viel Fläche.",
    "suggestion": "Eine kompakte Blattliste mit Suche, Filter und Seiten anbieten. Jede Zeile nennt Dateiname, offenen Umfang und eine konkrete Aktion. Das gewählte Blatt bearbeitet man direkt darunter oder daneben. Bereits übergebene Ausschnitte führen zu ihrem bestehenden Remaster-Auftrag.",
    "preserve": "Feste Blatt- und Annotations-IDs, aktuelle Ausschnittrevisionen, Originale und vorhandene Kinder. Filtern darf Blätter nicht neu gruppieren oder eine schon übergebene Auswahl erneut queuen.",
    "acceptance": [
      "Blatt 96 ist per Dateiname auffindbar, ohne 95 Tabs zu durchlaufen.",
      "Seiten- und Filterwechsel erhalten die genaue Auswahl sowie gespeicherte Ausschnitte.",
      "Import, Rahmen speichern und lokal queuen benötigen weder IP-Prüfung noch erneute Review-Navigation."
    ],
    "basis": "UI mit 96 Kontaktblättern und installierter Code · 1.4.287",
    "sourceVersion": "1.4.287",
    "sourceCommit": "85e457e",
    "evidence": [
      {
        "file": "UI-Beobachtung · 14.11.2026",
        "detail": "Ein Set mit 96 Blatt-Tabs, sechs Ausschnitten je Blatt und 576 vorhandenen Queue-Kindern geöffnet. Die globale Worklist-Suche findet Sets; die Blattreihe hat keine eigene Suche."
      },
      {
        "file": "public/app.js",
        "detail": "Imported-Sets-Renderer: Choose one imported sheet to edit; ein Tab pro conceptSheet mit wiederholtem saved/to queue/queued-Text."
      }
    ]
  }
]);
window.flowwaveFindings.push(...[
  {
    "id": "L1",
    "priority": "P1",
    "category": "Bestandsverwaltung",
    "title": "Ein Designbestand unter Account Management.",
    "summary": "FlowWave verknüpft lokale Archiv- und Kontoeinträge bereits. Das Konzept soll diese gemeinsame Ansicht klar zeigen: Lokal + Online, Nur lokal oder Nur online.",
    "problem": "Design management ist im installierten Stand bereits ein eigener Bereich neben Produktion und Upload. Es nutzt gemeinsame Karten-/Zeilenrenderer und die Herkunftsgruppen Account only, Linked und Archive only. Die sichtbare Hierarchie Account Management → Designbestand soll diese vorhandene Zuordnung verständlich abbilden: passende Informationen und Aktionen am selben Eintrag. Zusätzlich bleibt der Produktionsabschluss zu präzisieren: Der Hub-Exportstatus ist kein bestätigter Amazon-Speichervorgang.",
    "suggestion": "Zwei klare Hauptbereiche zeigen: Produktion und Account Management. Prozessschritte und Werkzeuge stehen jeweils in einer eigenen Navigation darunter. Im Account Management verwendet Designbestand dieselbe Zeilen- und Detailstruktur für alle drei Ablagefälle. Bei Lokal + Online erscheinen Datei- und Kontoaktionen am selben Design; nur lokale oder nur Online-Daten erhalten jeweils die passenden Felder. Bestehende Identitäten und Verknüpfungen weiterverwenden. Archiviert bleibt ein Abschlussmerkmal; Dateien und historische Stände sind von diesem Bestand aus erreichbar.",
    "preserve": "Vorhandene Account-/Archiv-IDs und Produktzuordnungen. Ein lokaler Katalogeintrag beweist keine verfügbaren Mediabytes auf diesem Mac. Herkunft, Entwurf, Übermittlung und Live-Status bleiben unabhängige Merkmale. Unklare Uploads bleiben offen; kein Abschluss allein durch ZIP, Klick oder Fill only.",
    "acceptance": [
      "Design management ist sichtbar unter Account Management und nicht in der Produktion eingeordnet.",
      "Lokal + Online, Nur lokal und Nur online verwenden denselben Renderer; Filter verändern weder Identität noch Auswahl.",
      "Ein verknüpftes Design erscheint einmal mit lokalen Dateien und seinen Kontoprodukten. Kein automatisches Zusammenführen über Titel oder Dateiname.",
      "Nur vorhandene Informationen und passende Aktionen erscheinen; fehlende lokale Dateien oder ein fehlender Kontoeintrag erzeugen keine leeren Formularbereiche.",
      "Bestätigte Uploadabschlüsse sind mit dem exakten Produktionsstand verbunden. Offene Geschwister und weitere Marktaufgaben bleiben bearbeitbar."
    ],
    "basis": "Gezielter Quellabgleich des bestehenden Design management · 1.4.287",
    "sourceVersion": "1.4.287",
    "sourceCommit": "85e457e",
    "evidence": [
      {
        "file": "public/production-navigation.js",
        "line": 37,
        "detail": "Design management besitzt bereits einen eigenen Bereich außerhalb Produktion (bis 43). public/index.html:197–198 bietet den eigenen Einstieg."
      },
      {
        "file": "public/design-management.js",
        "line": 18,
        "detail": "Vorhandene Herkunftsfilter All, Account only, Linked und Archive only."
      },
      {
        "file": "public/design-management.js",
        "line": 888,
        "detail": "Gemeinsamer Kartenrenderer tile; gemeinsamer Zeilenrenderer row bei 1019."
      },
      {
        "file": "src/design-portfolio.js",
        "line": 154,
        "detail": "Bestehende Filter für Account only, Linked und Archive only. Verknüpfung über gespeicherte Amazon-Design-IDs bei 436–456; eindeutige Linkschlüssel bei 99–100."
      },
      {
        "file": "src/upload-run.js",
        "line": 116,
        "detail": "Uploadabschluss bleibt an den tatsächlichen Save-Ausgang gebunden (bis 145)."
      },
      {
        "file": "src/hub-projection.js",
        "line": 593,
        "detail": "Hub-Exportangaben belegen nicht die erfolgreiche Upload-Speicherung; public/hub.js:825–843 blendet Exported/Archived im Active-Filter bereits aus."
      }
    ]
  },
  {
    "id": "L2",
    "priority": "P2",
    "category": "Dateiablage",
    "title": "Dateien, Versionen und Exporte am Design finden.",
    "summary": "Die lokale Grundstruktur ist vorhanden. Exporte landen jedoch neben Arbeitsbereichen; ungewählte Importversionen bleiben am externen Quellpfad. Eine gemeinsame Dateiansicht fehlt.",
    "problem": "Die schreibgeschützte Ordnerprüfung bestätigt getrennte Produktions-, Archiv- und Systembereiche. Export-Owner legen ZIPs im Elternordner des aktuellen Hub-Bereichs ab. Ungewählte Importversionen speichern Pfad, Hash und Vorschau, aber keine vollständige eigene Kopie. Der Nutzer muss deshalb wissen, welche Datei übernommen wurde, welche extern verknüpft bleibt und wo das zugehörige Paket liegt. Mehrere technische Speicher und absichtliche Kopien allein beweisen weder Chaos noch unnötigen physischen Speicherverbrauch.",
    "suggestion": "Pro Design eine kurze Dateiansicht anbieten: Original, Arbeitsversion, Upload-Dateien und Exportpakete mit tatsächlichem Ort und Verfügbarkeit. „Im Finder zeigen“ führt jeweils direkt zum richtigen Ziel. Neue Exportpakete in einem dedizierten, indexierten Exportbereich ordnen. Aktiven Arbeitsbereich benennen; ältere Bereiche gesammelt schreibgeschützt auffindbar halten. Bei Importversionen „kopiert“ und „extern verknüpft“ unterscheiden.",
    "preserve": "Bestehende IDs, relative Referenzen, Quellordner-Abhängigkeiten, Receipts, Upload-Locks, Sicherung und Wiederherstellung. Keine blinde Ordnerzusammenführung oder manuelle Umbenennung. APFS-Klone können Blöcke teilen; logische Dateigröße ist kein Beweis für doppelten Platzverbrauch.",
    "acceptance": [
      "Die aktuelle Version und ihr Exportpaket sind vom Design aus mit einer Aktion auffindbar.",
      "Nur die wirklich kopierte Importversion heißt übernommen; weitere verknüpfte Versionen zeigen ihren Quellort und dessen Erreichbarkeit.",
      "Neue Exporte besitzen Pakettyp, Export-ID und einen eigenen auffindbaren Bereich. Bestehende Pakete bleiben referenzierbar.",
      "Eine spätere Migration wird vorab mit Zuordnungsplan und Wiederherstellung geprüft; im Audit werden keine Nutzerdaten verschoben."
    ],
    "basis": "Lokale Verzeichnismetadaten und installierter Code schreibgeschützt geprüft · 1.4.287",
    "sourceVersion": "1.4.287",
    "sourceCommit": "85e457e",
    "evidence": [
      {
        "file": "Lokale Ordnerprüfung · 14.11.2026",
        "detail": "Bestätigt: Hub-Arbeitsbereich, Upload/eingang, katalog, dateien, sperren, sicherung, system und Left over. Nur Verzeichnismetadaten gelesen, keine Dateien verschoben oder Bildinhalte geladen."
      },
      {
        "file": "server.js",
        "line": 20936,
        "detail": "Listing-ZIP verwendet den Elternordner des aktuellen Input-Ordners. Flying-Upload-ZIP ebenso bei 26379/26452."
      },
      {
        "file": "src/folder-import-store.js",
        "line": 1,
        "detail": "Weitere Versionen werden über Quellpfad, Hash und Thumbnail behalten; sie sind keine vollständig kopierten Originale (bis Zeile 8)."
      },
      {
        "file": "src/flowwave-folder.js",
        "line": 317,
        "detail": "Zusätzliche Arbeitsbereichsuffixe schützen getrennte Installationen; nicht als wegwerfbare Dubletten behandeln (bis 334)."
      },
      {
        "file": "src/clone-copy.js",
        "line": 1,
        "detail": "APFS-Klonkopien und physische Speicherteilung (bis 28)."
      }
    ]
  }
]);
window.flowwaveFindings.push(...(window.FlowWaveManagementAudit?.findings || []));
const managementL1=window.flowwaveFindings.find(finding=>finding.id==='L1');
managementL1.basis='Native Bestandsprüfung, isolierter Originalrenderer und Quellabgleich · 1.4.287';
managementL1.problem+=' Die native Vertiefung zeigt 6.521 Designs und die Herkunftswahl erst im allgemeinen Filtermenü. 6.519 Einträge sind Account only, zwei Linked und keiner Archive only. Der zusätzliche isolierte Originalrenderer mit 10.000 synthetischen Designs bestätigt 6.000 Account only, 3.000 Linked und 1.000 Archive only sowie zwei Archivstände an einer einzigen Identität. Datei-Bytes und echte Cloud-Bereitstellung wurden damit nicht geprüft.';
managementL1.suggestion+=' Die drei Herkunftsgruppen direkt am Bestand anbieten. Nur lokale Einträge führen mit Datei- und Archivaktionen statt leeren Amazon-Bereichen; Produktmatrix und Historie öffnen bei Bedarf.';
managementL1.evidence.push({file:'Native und isolierte Vertiefung · 14.11.2026',detail:'6.521 reale gespeicherte Designs; 60er-Seiten. Isolierter Originalrenderer/Service mit 10.000 synthetischen Einträgen und drei Herkunftsgruppen; keine echte Kontolesung oder Schreibaktion.'});
const auditPriorityOrder = ["B5", "DM1", "AC3", "AC1", "AC2", "AC4", "L1", "L2", "DM2", "D1", "R2", "S2", "S1", "R1", "B3", "B1", "B2", "N1", "C1", "I1", "N4", "U1", "N2", "R5", "R4", "R3", "R6", "F1", "F2", "M1", "V1", "U2", "U3", "R7", "N3", "B4", "B6", "AC5"];
window.flowwaveFindings.sort((a,b) => auditPriorityOrder.indexOf(a.id)-auditPriorityOrder.indexOf(b.id));

(function () {
  'use strict';
  const findings = window.flowwaveFindings;
  const areas = window.FlowWaveManagementAudit.areas;
  const areaOf = new Map(areas.flatMap(area=>area.ids.map(id=>[id,area.id])));
  const areaTitle = new Map(areas.map(area=>[area.id,area.title]));
  const grid = document.getElementById('findingsGrid');
  const category = document.getElementById('categoryFilter');
  const result = document.getElementById('filterResult');
  const showAll = document.getElementById('showAllFindings');
  const priorityButtons = [...document.querySelectorAll('[data-priority]')];
  let selectedPriority = 'all';
  let showAllMatching = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const paragraph = value => Array.isArray(value) ? `<ul>${value.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : `<p>${escape(value)}</p>`;
  const renderPart = (title, value, className = '') => value ? `<div class="detail-part ${className}"><h4>${title}</h4>${paragraph(value)}</div>` : '';

  grid.innerHTML = findings.map(finding => `<article class="finding-card" id="${escape(finding.id)}" data-priority-value="${escape(finding.priority)}" data-category="${escape(finding.category)}" data-audit-area="${escape(areaOf.get(finding.id))}">
    <div class="finding-card-top"><div class="finding-meta"><a class="finding-id" href="#${escape(finding.id)}" aria-label="Direktlink zu Finding ${escape(finding.id)}">${escape(finding.id)}</a><span class="finding-priority"><i class="priority-dot ${finding.priority === 'P1' ? 'p1' : 'p2'}" aria-hidden="true"></i>${escape(finding.priority)}</span><span class="finding-category">${escape(finding.category)}</span></div><h3>${escape(finding.title)}</h3><p class="finding-summary">${escape(finding.summary)}</p></div>
    <details class="finding-details"><summary>Beleg und Verbesserung<span class="sr-only"></span></summary><div class="finding-detail-body">${renderPart('Evidenzart', finding.basis || (['R1','R2','R3','R4','R6'].includes(finding.id) ? 'Native UI und Code' : 'Codebefund'))}${renderPart('Das Problem',finding.problem)}${renderPart('Der Vorschlag',finding.suggestion)}${renderPart('Das bleibt erhalten',finding.preserve)}${renderPart('Abnahmekriterium',finding.acceptance,'acceptance')}
      <div class="detail-part"><h4>Quelle</h4><ul class="evidence-list">${(finding.evidence || []).map(evidence => `<li><code>${escape(evidence.file)}${evidence.line == null ? '' : `:${escape(evidence.line)}`}</code>${evidence.detail ? `<span>${escape(evidence.detail)}</span>` : ''}</li>`).join('')}</ul><p class="source-version">Installierte FlowWave ${escape(finding.sourceVersion || '1.4.286')} · Quellstand ${escape(finding.sourceCommit || '9c4f181')}</p></div>
    </div></details><div class="finding-feedback af-topic-action"><button class="af-feedback-button" type="button" data-feedback-topic="finding-${escape(finding.id)}" aria-label="Feedback zu Finding ${escape(finding.id)}: ${escape(finding.title)}">Kommentieren <span aria-hidden="true">↗</span></button></div></article>`).join('');

  areas.forEach(area => { const option=document.createElement('option');option.value=area.id;option.textContent=area.title;category.append(option); });
  document.getElementById('auditAreaIndex').innerHTML=areas.map(area=>`<a href="#area-${escape(area.id)}">${escape(area.title)} <span>${area.ids.length}</span></a>`).join('');
  document.getElementById('findingTotal').textContent = findings.length;
  document.getElementById('allCount').textContent = findings.length;

  function applyFilters() {
    let matching = 0;
    let visible = 0;
    [...grid.children].forEach(card => {
      const matches = (selectedPriority === 'all' || card.dataset.priorityValue === selectedPriority) && (category.value === 'all' || card.dataset.auditArea === category.value);
      if (matches) matching++;
      card.hidden = !matches || (!showAllMatching && matching > 6);
      if (!card.hidden) visible++;
    });
    priorityButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.priority === selectedPriority)));
    result.textContent = `${visible} von ${matching} passenden Findings${selectedPriority !== 'all' ? ` · ${selectedPriority}` : ''}${category.value !== 'all' ? ` · ${areaTitle.get(category.value)}` : ''}`;
    document.getElementById('noResults').hidden = visible > 0;
    showAll.parentElement.hidden = matching <= 6;
    showAll.textContent = showAllMatching ? 'Wieder kompakt anzeigen' : `Alle ${matching} Findings anzeigen`;
    showAll.setAttribute('aria-expanded', String(showAllMatching));
  }
  priorityButtons.forEach(button => button.addEventListener('click', () => { selectedPriority = button.dataset.priority; showAllMatching = false; applyFilters(); }));
  category.addEventListener('change', () => { showAllMatching = false; applyFilters(); });
  showAll.addEventListener('click', () => { showAllMatching = !showAllMatching; applyFilters(); });
  document.getElementById('resetFilters').addEventListener('click', () => { selectedPriority = 'all'; category.value = 'all'; showAllMatching = false; applyFilters(); priorityButtons[0].focus(); });
  document.getElementById('printAudit').addEventListener('click', () => window.print());

  function showLinkedFinding() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const finding = findings.find(value => value.id === id);
    if (!finding) return;
    selectedPriority = 'all'; category.value = 'all'; showAllMatching = true; applyFilters();
    const card = document.getElementById(finding.id);
    const details = card.querySelector('details'); details.open = true;
    requestAnimationFrame(() => card.scrollIntoView({block:'start',behavior:'instant'}));
  }
  function showLinkedArea() {
    const id=location.hash.replace(/^#area-/,'');
    if(!areaTitle.has(id))return;
    selectedPriority='all';category.value=id;showAllMatching=true;applyFilters();
    requestAnimationFrame(()=>grid.scrollIntoView({block:'start',behavior:'instant'}));
  }
  window.addEventListener('hashchange', showLinkedArea);
  window.addEventListener('hashchange', showLinkedFinding);
  applyFilters();
  showLinkedArea();
  showLinkedFinding();
}());
