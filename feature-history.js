/* Versioned source review, never a claim of native acceptance or a new provider run. */
(() => {
  'use strict';
  const PAGE_SIZE=12;
  const STATUS=Object.freeze({
    lost_ui:{label:'UI-Verlust belegt',meaning:'Ein früherer UI-Einstieg fehlt im geprüften heutigen Quellstand.'},
    restored:{label:'Regression behoben',meaning:'Ein früher funktionierender Weg ging zwischenzeitlich verloren und ist im heutigen Quellstand wieder vorhanden.'},
    intentional:{label:'Bewusst geändert',meaning:'Die Änderung ist als Produktentscheidung dokumentiert; sie ist kein unbeabsichtigter Funktionsverlust.'},
    preserved:{label:'Erhalten',meaning:'Die Funktion ist im früheren und im heutigen Quellstand vorhanden.'},
    expanded:{label:'Erweitert',meaning:'Die heutige Funktion geht über den früheren Umfang hinaus.'},
    historical_defect:{label:'Historischer Defekt',meaning:'Ein damaliger Fehler ist belegt. Ein davor funktionierender Stand und damit eine echte Regression sind nicht nachgewiesen.'},
    copy_gap:{label:'Aussage veraltet',meaning:'Beschreibung und Implementierung stimmen nicht überein. Das allein belegt keinen Featureverlust.'}
  });
  const asText=value=>Array.isArray(value)?value.map(asText).join(' '):value&&typeof value==='object'?asText(value.action||value.text||value.work||''):String(value??'');
  const esc=value=>asText(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const date=value=>/^\d{4}-\d{2}-\d{2}/.test(String(value||''))?String(value).slice(0,10).split('-').reverse().join('.'):asText(value);
  function sourceURL(evidence){
    if(!/^[a-f0-9]{7,40}$/.test(String(evidence.commit||'')))return null;
    const base='https://github.com/smoremore/flowwave';
    const file=String(evidence.file||'');
    if(!file)return `${base}/commit/${evidence.commit}`;
    if(file.startsWith('/')||file.split('/').some(part=>part==='..'||!part))return null;
    return `${base}/blob/${evidence.commit}/${file.split('/').map(encodeURIComponent).join('/')}${Number.isSafeInteger(evidence.line)&&evidence.line>0?`#L${evidence.line}`:''}`;
  }
  function entryId(value){
    let id;try{id=decodeURIComponent(String(value||'').replace(/^#/,''));}catch{return null;}
    const match=/^(?:(?:history|regression)-)?(H\d+)$/.exec(id);return match?match[1]:null;
  }
  function matches(entry,{query='',area='all',status='all'}={}){
    const text=query.trim().toLocaleLowerCase('de');
    const haystack=[entry.id,entry.key,entry.title,entry.area,STATUS[entry.status]?.label,entry.before,entry.change,entry.now,entry.impact,entry.recommendation,entry.intent,...(entry.acceptance||[]),...(entry.relatedTasks||[]),...(entry.relatedFindings||[]),...(entry.evidence||[]).flatMap(item=>[item.commit,item.file,item.version,item.detail])].map(asText).join(' ').toLocaleLowerCase('de');
    return (area==='all'||entry.area===area)&&(status==='all'||entry.status===status)&&(!text||haystack.includes(text));
  }
  const helpers={STATUS,PAGE_SIZE,matches,entryId,sourceURL,date};
  if(typeof module!=='undefined'&&module.exports)module.exports=helpers;
  if(typeof window==='undefined'||typeof document==='undefined')return;
  const data=window.FlowWaveFeatureHistory,section=document.getElementById('feature-history');
  if(!data||!section)return;
  const entries=Array.isArray(data.entries)?data.entries:[],byId=new Map(entries.map(entry=>[entry.id,entry]));
  const slot=name=>section.querySelector(`[data-history-${name}]`);
  const controls=slot('controls'),results=slot('results'),host=slot('list');
  if(!controls||!results||!host)return;
  const open=new Set(),disclosures=new Set();let limit=PAGE_SIZE,printing=false,printState=null;
  const areas=[...new Set(entries.map(entry=>entry.area))].sort((a,b)=>a.localeCompare(b,'de'));
  const counts=Object.fromEntries(Object.keys(STATUS).map(key=>[key,entries.filter(entry=>entry.status===key).length]));
  const metrics=slot('metrics');
  if(metrics)metrics.innerHTML=`<dl class="history-metrics">${[[entries.length,'Fälle eingeordnet'],[counts.lost_ui,'UI-Verluste belegt'],[counts.restored,'Regressionen behoben'],[counts.preserved+counts.intentional+counts.expanded,'Erhalten oder bewusst geändert']].map(([count,label])=>`<div><dt>${label}</dt><dd>${count}</dd></div>`).join('')}</dl>`;
  const timeline=slot('timeline');
  if(timeline){
    const points=[data.first,...(data.milestones||[]),data.baseline].filter(Boolean),seen=new Set();
    const unique=points.filter(point=>{const key=point.commit||`${point.version}/${point.date}`;if(seen.has(key))return false;seen.add(key);return true;});
    timeline.innerHTML=`<div class="history-timeline-scroll" role="region" aria-label="Versionsmeilensteine" tabindex="0"><ol class="history-timeline">${unique.map((point,index)=>`<li><time>${esc(date(point.date))}</time><strong>${esc(point.version?`v${point.version}`:'Quellstand')}</strong><span>${index===0?'Erster Git-Stand':point.commit===data.baseline?.commit?'Heutige Codebasis':'Meilenstein'}</span><code>${esc(String(point.commit||'').slice(0,8))}</code></li>`).join('')}</ol></div><p class="history-source-scope">${Number.isSafeInteger(data.commitCount)?`${data.commitCount.toLocaleString('de-DE')} erreichbare Commits · `:''}Versionsvergleich anhand der Quellen. Kein rückwirkender Nachweis aller produktiven Abläufe.</p>`;
  }
  const coverage=slot('coverage');
  if(coverage)coverage.innerHTML=`<div class="history-coverage-grid">${(data.coverage||[]).map(item=>`<article><h3>${esc(item.area)}</h3><p>${esc(item.result)}</p></article>`).join('')}</div>`;
  const limits=slot('limits');
  if(limits)limits.innerHTML=`<ul class="history-limits">${(data.limits||[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="history-private-source">Quellbelege öffnen das private Repository. Dafür ist Repositoryzugriff nötig; die Einordnung bleibt auf dieser Seite lesbar.</p>`;
  controls.innerHTML=`<div class="history-controls team-task-controls"><label>Feature suchen<input id="historySearch" type="search" placeholder="Feature, Bereich, Commit oder Aufgabe" aria-label="Feature suchen"></label><label>Bereich<select id="historyArea" aria-label="Historischer Bereich"><option value="all">Alle Bereiche</option>${areas.map(area=>`<option value="${esc(area)}">${esc(area)}</option>`).join('')}</select></label><label>Einordnung<select id="historyStatus" aria-label="Historische Einordnung"><option value="all">Alle Einordnungen</option>${Object.entries(STATUS).filter(([key])=>counts[key]).map(([key,value])=>`<option value="${key}">${value.label} (${counts[key]})</option>`).join('')}</select></label></div><div class="team-task-toolbar history-toolbar"><p>Entfernt, repariert und bewusst geändert bleiben getrennte Einordnungen.</p><button type="button" data-history-reset>Filter zurücksetzen</button></div>`;
  const query=controls.querySelector('#historySearch'),area=controls.querySelector('#historyArea'),status=controls.querySelector('#historyStatus');
  results.setAttribute('role','status');results.setAttribute('aria-live','polite');
  const screenTitle=id=>window.FlowWaveAuditLinks?.screenTitle(id)||id;
  const link=(href,label,title='')=>`<a href="${esc(href)}"${title?` title="${esc(title)}"`:''}>${esc(label)}</a>`;
  function evidenceRow(item){
    const url=sourceURL(item),file=item.file?`${item.file}${Number.isSafeInteger(item.line)&&item.line>0?`:${item.line}`:''}`:'Commit';
    const stamp=[item.version?`v${item.version}`:'',date(item.date),String(item.commit||'').slice(0,8)].filter(Boolean).join(' · ');
    return `<li>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(file)} ↗</a>`:`<code>${esc(file)}</code>`}<small>${esc(stamp)}</small>${item.detail?`<p>${esc(item.detail)}</p>`:''}</li>`;
  }
  function card(entry){
    const kind=STATUS[entry.status]||{label:'Nicht eingeordnet',meaning:'Die Einordnung ist noch offen.'};
    const taskLinks=(entry.relatedTasks||[]).map(id=>link(`#task-${id}`,id));
    const findingLinks=(entry.relatedFindings||[]).map(id=>link(`#${id}`,id));
    const screenLinks=(entry.screens||[]).map(id=>link(`#screen-${id}`,screenTitle(id)));
    const actionable=['lost_ui','copy_gap'].includes(entry.status)&&/^P[012]$/.test(String(entry.priority||''));
    return `<details class="team-task history-card" id="history-${esc(entry.id)}" data-history-id="${esc(entry.id)}"${open.has(entry.id)?' open':''}><summary><span class="team-task-id">${esc(entry.id)}</span>${actionable?`<span class="team-task-priority team-task-priority--${entry.priority}">${entry.priority}</span>`:''}<span class="team-task-copy"><strong>${esc(entry.title)}</strong><small>${esc(entry.area)} · <span class="history-kind" data-history-kind="${esc(entry.status)}">${kind.label}</span></small></span><span aria-hidden="true" class="team-task-plus">+</span></summary><div class="team-task-body"><p class="history-meaning">${esc(kind.meaning)}</p><div class="history-comparison">${[['Früher',entry.before],['Veränderung',entry.change],['Heutiger Quellstand',entry.now]].map(([label,value])=>value?`<div><h4>${label}</h4><p>${esc(value)}</p></div>`:'').join('')}</div>${entry.impact?`<h4>Auswirkung</h4><p>${esc(entry.impact)}</p>`:''}${entry.intent?`<h4>Dokumentierte Entscheidung</h4><p>${esc(entry.intent)}</p>`:''}${entry.recommendation?`<h4>Nächster Schritt</h4><p>${esc(entry.recommendation)}</p>`:''}${entry.acceptance?.length?`<h4>Abnahmekriterien</h4><ol>${entry.acceptance.map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`:''}${entry.evidence?.length?`<details class="history-evidence" data-history-disclosure="evidence-${esc(entry.id)}"${disclosures.has(`evidence-${entry.id}`)?' open':''}><summary>Quellbelege (${entry.evidence.length})</summary><ul>${entry.evidence.map(evidenceRow).join('')}</ul></details>`:''}${entry.limits?.length?`<details class="history-evidence" data-history-disclosure="limits-${esc(entry.id)}"${disclosures.has(`limits-${entry.id}`)?' open':''}><summary>Prüfgrenze dieses Falls</summary><ul>${entry.limits.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></details>`:''}<div class="team-task-links history-links">${taskLinks.length?`<span>Aufgaben</span>${taskLinks.join('')}`:''}${screenLinks.length?`<span>Screens</span>${screenLinks.join('')}`:''}${findingLinks.length?`<span>Auditbezug</span>${findingLinks.join('')}`:''}${link(`#history-${entry.id}`,'Direktlink ↗')}<button type="button" class="af-feedback-button" data-feedback-topic="regression-${esc(entry.id)}" aria-label="Historischen Fall ${esc(entry.id)} kommentieren">Fall kommentieren ↗</button></div></div></details>`;
  }
  function render(){
    const found=entries.filter(entry=>matches(entry,{query:query.value,area:area.value,status:status.value}));
    const visible=found.slice(0,limit);
    results.textContent=`${visible.length} von ${found.length} passenden Fällen · ${entries.length} insgesamt`;
    host.innerHTML=visible.length?visible.map(card).join(''):`<p class="history-empty">Keine Fälle für diese Auswahl. Filter oder Suchtext ändern.</p>`;
    if(visible.length<found.length)host.insertAdjacentHTML('beforeend',`<div class="history-more"><button type="button" data-history-more>Weitere ${Math.min(PAGE_SIZE,found.length-visible.length)} Fälle anzeigen</button></div>`);
  }
  function reset(){query.value='';area.value=status.value='all';limit=PAGE_SIZE;render();}
  [area,status].forEach(control=>control.addEventListener('change',()=>{limit=PAGE_SIZE;render();}));
  query.addEventListener('input',()=>{limit=PAGE_SIZE;render();});
  controls.querySelector('[data-history-reset]').addEventListener('click',()=>{reset();query.focus();});
  host.addEventListener('toggle',event=>{const node=event.target;if(printing||!node.isConnected)return;if(node.matches?.('details[data-history-id]'))node.open?open.add(node.dataset.historyId):open.delete(node.dataset.historyId);if(node.matches?.('details[data-history-disclosure]'))node.open?disclosures.add(node.dataset.historyDisclosure):disclosures.delete(node.dataset.historyDisclosure);},true);
  host.addEventListener('click',event=>{
    if(!event.target.closest?.('[data-history-more]'))return;
    const before=limit;limit+=PAGE_SIZE;render();const added=host.querySelectorAll('[data-history-id]')[before];added?.querySelector('summary')?.focus({preventScroll:true});added?.scrollIntoView({block:'nearest',behavior:'instant'});
  });
  function reveal(requested){
    const id=entryId(typeof requested==='string'?requested:location.hash),entry=id&&byId.get(id);if(!entry)return false;
    query.value='';area.value=status.value='all';limit=Math.max(PAGE_SIZE,entries.indexOf(entry)+1);open.add(id);
    window.FlowWaveAuditTabs?.revealFor(section);render();requestAnimationFrame(()=>document.getElementById(`history-${id}`)?.scrollIntoView({block:'start',behavior:'instant'}));return true;
  }
  window.FlowWaveHistoryView=Object.freeze({reveal});
  window.addEventListener('hashchange',reveal);
  window.addEventListener('beforeprint',()=>{
    if(printState)return;printing=true;printState={query:query.value,area:area.value,status:status.value,limit,open:[...open],disclosures:[...disclosures]};
    query.value='';area.value=status.value='all';limit=entries.length;entries.forEach(entry=>{open.add(entry.id);disclosures.add(`evidence-${entry.id}`);disclosures.add(`limits-${entry.id}`);});render();
  });
  window.addEventListener('afterprint',()=>{
    if(!printState)return;query.value=printState.query;area.value=printState.area;status.value=printState.status;limit=printState.limit;
    open.clear();printState.open.forEach(id=>open.add(id));disclosures.clear();printState.disclosures.forEach(id=>disclosures.add(id));render();printState=null;printing=false;
  });
  render();reveal();
})();
