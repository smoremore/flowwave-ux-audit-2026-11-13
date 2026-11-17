/* Traceable proposals; these links never mark production work complete. */
(() => {
  'use strict';
  const screens=window.FlowWaveAuditMap?.screens;
  const tasks=window.FlowWaveTeamTasks?.tasks;
  if(!screens||!tasks)return;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link=(href,label,title='')=>`<a href="${esc(href)}"${title?` title="${esc(title)}"`:''}>${esc(label)}</a>`;
  const taskLink=task=>link(`#task-${task.id}`,`${task.id} · ${task.priority}`,task.title);
  const screenLink=id=>link(`#screen-${id}`,screens[id].title);
  function findingLinks(id){
    const relatedTasks=tasks.filter(task=>task.kind!=='Auditpaket'&&task.sources.includes(id));
    const relatedScreens=Object.keys(screens).filter(key=>screens[key].findings.includes(id));
    return `<div class="detail-part audit-related"><h4>Umsetzung und Screen-Vorschläge</h4><div class="audit-related-links">${relatedTasks.map(taskLink).join('')}${relatedScreens.map(screenLink).join('')}</div></div>`;
  }
  function taskLinks(task){
    return (task.screens||[]).length?`<div class="audit-related task-screen-links"><span>Screen-Vorschläge</span><div class="audit-related-links">${task.screens.map(screenLink).join('')}</div></div>`:'';
  }
  function updateScreen(id){
    const host=document.querySelector('[data-screen-audit-links]');
    const definition=screens[id];if(!host||!definition)return;
    const relatedTasks=tasks.filter(task=>task.kind!=='Auditpaket'&&task.screens?.includes(id));
    const history=(window.FlowWaveFeatureHistory?.entries||[]).filter(entry=>entry.screens.includes(id));
    host.parentElement.querySelector('summary').textContent=`${definition.title}${history.length?` · ${history.length} Rückblick`:''} · ${definition.findings.length} ${definition.findings.length===1?'Finding':'Findings'} · ${relatedTasks.length} ${relatedTasks.length===1?'Aufgabe':'Aufgaben'}`;
    host.innerHTML=`<p>Die Links verbinden App-Befunde, Gestaltungsvorschlag und offene Umsetzung. Der Screen ersetzt keine Produktionsabnahme.</p><div class="audit-related"><strong>Findings</strong><div class="audit-related-links">${definition.findings.map(finding=>link(`#${finding}`,finding)).join('')}</div></div><div class="audit-related"><strong>Aufgaben</strong><div class="audit-related-links">${relatedTasks.map(taskLink).join('')}</div></div>${history.length?`<div class="audit-related"><strong>Feature-Rückblick</strong><div class="audit-related-links">${history.map(entry=>link(`#history-${entry.id}`,entry.id,entry.title)).join('')}</div></div>`:''}`;
  }
  window.FlowWaveAuditLinks=Object.freeze({findingLinks,taskLinks,screenTitle:id=>screens[id]?.title||id});
  document.addEventListener('flowwave:screenchange',event=>updateScreen(event.detail.screen));
  document.addEventListener('DOMContentLoaded',()=>updateScreen(document.querySelector('#flowwave-bento-concept .fw-screen:not([hidden])')?.dataset.view||'designs'));
})();
