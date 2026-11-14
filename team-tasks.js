/* Team backlog only: filtering and discussion links never change product state. */
(() => {
  'use strict';
  const data = window.FlowWaveTeamTasks;
  const host = document.getElementById('teamTaskList');
  if (!data || !host) return;
  const priorities = document.getElementById('teamTaskPriority');
  const area = document.getElementById('teamTaskArea');
  const order = document.getElementById('teamTaskOrder');
  const query = document.getElementById('teamTaskSearch');
  const result = document.getElementById('teamTaskCount');
  const empty = document.getElementById('teamTaskEmpty');
  const phase = document.getElementById('teamTaskPhase');
  const reset = document.getElementById('teamTaskReset');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rank = {P0:0,P1:1,P2:2};
  const open = new Set();
  const areas=['Bestände','Import & Sets','Autopilot','Übergaben','Review','Upload','Abnahme','Listings','Navigation','Dateien & Export','Create & Remaster','Hinweise & Zustände','Effects','Vectorize & Ergebnisse','Design Management','Account Management'];
  const areaOrder=(a,b)=>areas.indexOf(a.area)-areas.indexOf(b.area)||a.area.localeCompare(b.area,'de');
  [...new Set(data.tasks.map(t => t.area))].sort((a,b) => a.localeCompare(b,'de')).forEach(value => {
    const option = document.createElement('option'); option.value = value; option.textContent = value; area.appendChild(option);
  });
  const taskLink = id => `<a href="#task-${esc(id)}">${esc(id)}</a>`;
  function card(task) {
    return `<details class="team-task" id="task-${esc(task.id)}" ${open.has(task.id)?'open':''}>
      <summary><span class="team-task-id">${esc(task.id)}</span><span class="team-task-priority team-task-priority--${task.priority}">${task.priority}</span><span class="team-task-copy"><strong>${esc(task.title)}</strong><small>${esc(task.area)} · ${esc(task.kind)}</small></span><span class="team-task-status">${esc(task.status)}</span><span aria-hidden="true" class="team-task-plus">+</span></summary>
      <div class="team-task-body"><p class="team-task-outcome">${esc(task.outcome)}</p><dl class="team-task-meta"><div><dt>Zuständigkeit · Rolle</dt><dd>${esc(task.owner)}</dd></div><div><dt>Vorausgehende Aufgaben</dt><dd>${task.depends.length?task.depends.map(taskLink).join(' · '):'Keine'}</dd></div></dl><h4>Konkrete Umsetzung</h4><p>${esc(task.work)}</p><h4>Abnahmekriterien</h4><ol>${task.acceptance.map(text=>`<li>${esc(text)}</li>`).join('')}</ol><div class="team-task-links"><span>Auditbasis</span>${task.sources.map(id=>`<a href="#${esc(id)}">${esc(id)}</a>`).join('')}<a href="#task-${esc(task.id)}" aria-label="Direktlink zur Aufgabe ${esc(task.id)}">Direktlink ↗</a><button class="af-feedback-button" type="button" data-feedback-topic="task-${esc(task.id)}">Aufgabe kommentieren ↗</button></div></div></details>`;
  }
  function render() {
    const text = query.value.trim().toLocaleLowerCase('de');
    const matching = data.tasks.filter(t => (priorities.value==='all'||t.priority===priorities.value) && (area.value==='all'||t.area===area.value) && (phase.value==='all'||(t.kind==='Auditpaket')===(phase.value==='audit')) && (!text||[t.id,t.title,t.area,t.owner,t.kind,t.outcome,t.work,...t.acceptance,...t.sources].join(' ').toLocaleLowerCase('de').includes(text)));
    matching.sort((a,b) => Number(a.kind==='Auditpaket')-Number(b.kind==='Auditpaket') || (order.value==='area' ? areaOrder(a,b) || rank[a.priority]-rank[b.priority] : rank[a.priority]-rank[b.priority] || areaOrder(a,b)) || a.id.localeCompare(b.id));
    const groups = new Map();
    matching.forEach(task => {
      const key = task.kind==='Auditpaket'?'Danach · Geplanter Management-Audit':order.value==='area'?task.area:`${task.priority} · ${data.priorityMeaning[task.priority]}`;
      if(!groups.has(key))groups.set(key,[]); groups.get(key).push(task);
    });
    host.innerHTML = [...groups].map(([title,tasks])=>`<section class="team-task-group"><h3>${esc(title)} <span>${tasks.length}</span></h3>${tasks.map(card).join('')}</section>`).join('');
    result.textContent = `${matching.length} von ${data.tasks.length} Aufgaben · ${matching.filter(t=>t.kind!=='Auditpaket').length} Umsetzung · ${matching.filter(t=>t.kind==='Auditpaket').length} geplante Audits`;
    empty.hidden=matching.length>0;
  }
  host.addEventListener('toggle', event => { const node=event.target; if(node.classList?.contains('team-task')) {const id=node.id.slice(5);node.open?open.add(id):open.delete(id);} },true);
  [priorities,area,order,phase].forEach(input=>input.addEventListener('change',render));
  query.addEventListener('input',render);
  reset.addEventListener('click',()=>{priorities.value=area.value=phase.value='all';order.value='priority';query.value='';render();query.focus();});
  function revealLinkedTask() {
    const anchor = location.hash.slice(1);
    if (['team-tasks','upload-findings','plan'].includes(anchor)) {
      const target = anchor==='plan'?'team-tasks':anchor;
      requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({block:'start',behavior:'instant'}));
      return;
    }
    const id = location.hash.replace(/^#task-/,'');
    if (!data.tasks.some(task=>task.id===id)) return;
    priorities.value=area.value=phase.value='all';query.value='';open.add(id);render();
    requestAnimationFrame(()=>document.getElementById(`task-${id}`)?.scrollIntoView({block:'start',behavior:'instant'}));
  }
  window.addEventListener('hashchange',revealLinkedTask);
  render();revealLinkedTask();
})();
