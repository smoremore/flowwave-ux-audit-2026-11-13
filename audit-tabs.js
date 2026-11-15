/* One report, persistent panels. Moving a section never recreates its controls or drafts. */
(() => {
  'use strict';
  const main=document.querySelector('main#top');
  const bar=document.querySelector('[data-audit-tablist]');
  if(!main||!bar)return;
  const sections=[...main.children];
  const specs=[
    {id:'overview',target:'top',nodes:sections.filter(n=>n.matches('.hero,.priorities,.management-audit-section,.flow-section,.paths-section'))},
    {id:'findings',target:'findings',nodes:sections.filter(n=>n.matches('.findings-section'))},
    {id:'screens',target:'concept',nodes:sections.filter(n=>n.matches('.concept-section,.app-scope-section'))},
    {id:'tasks',target:'team-tasks',nodes:sections.filter(n=>n.matches('.team-backlog'))},
    {id:'method',target:'coverage',nodes:sections.filter(n=>n.matches('.coverage-section,.concept-log-section'))}
  ];
  const panels=new Map(),buttons=new Map();
  const scrollTargets=new Map();
  const counts={findings:window.FlowWaveManagementAudit?.areas.reduce((n,a)=>n+a.ids.length,0)||38,tasks:window.FlowWaveTeamTasks?.tasks.length||28};
  for(const spec of specs){
    const panel=document.createElement('div');panel.className='audit-tabpanel';panel.id=`audit-panel-${spec.id}`;
    panel.dataset.auditPanel=spec.id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`audit-tab-${spec.id}`);panel.tabIndex=0;
    for(const node of spec.nodes)panel.appendChild(node);
    main.appendChild(panel);panels.set(spec.id,panel);
    const button=bar.querySelector(`[data-audit-tab="${spec.id}"]`);buttons.set(spec.id,button);
    button.setAttribute('aria-controls',panel.id);
    const count=button.querySelector('[data-audit-tab-count]');if(count&&counts[spec.id])count.textContent=counts[spec.id];
    scrollTargets.set(spec.id,spec.target);
  }
  // Directory is secondary to the working screen; keep its existing IDs and links.
  const directory=document.getElementById('areas');
  if(directory){const disclosure=document.createElement('details');disclosure.className='audit-screen-directory section-wrap';const summary=document.createElement('summary');summary.textContent='Alle 22 Arbeitsansichten';disclosure.append(summary,directory);panels.get('screens').appendChild(disclosure);}
  const preserve=document.getElementById('preserve');
  if(preserve){const wrapper=document.createElement('div');wrapper.className='section-wrap audit-preserve-wrap';wrapper.appendChild(preserve);panels.get('method').appendChild(wrapper);}
  let active='overview',printing=false;
  const header=document.querySelector('.site-header');
  function measure(){document.documentElement.style.setProperty('--audit-header-height',`${Math.ceil(header.getBoundingClientRect().height)}px`);}
  measure();if(typeof ResizeObserver==='function')new ResizeObserver(measure).observe(header);
  function activate(id){
    if(!panels.has(id))return;
    active=id;
    for(const [key,panel]of panels)panel.hidden=!printing&&key!==id;
    for(const [key,button]of buttons){button.setAttribute('aria-selected',String(key===id));button.tabIndex=key===id?0:-1;}
    document.dispatchEvent(new CustomEvent('flowwave:audit-tabchange',{detail:{tab:id}}));
  }
  function idForHash(hash){
    let id;try{id=decodeURIComponent(String(hash||'').replace(/^#/,''));}catch{return null;}
    if(!id||id==='top')return 'overview';
    if(id.startsWith('screen-')||id==='concept'||id==='areas')return 'screens';
    if(id.startsWith('task-')||['team-tasks','plan','upload-findings'].includes(id))return 'tasks';
    if(id.startsWith('area-')||['findings','consistency','findingsGrid'].includes(id))return 'findings';
    if(['coverage','concept-log','preserve'].includes(id)||/^K\d+$/.test(id))return 'method';
    const element=document.getElementById(id);return element?.closest('[data-audit-panel]')?.dataset.auditPanel||null;
  }
  function revealFor(target){
    const id=typeof target==='string'?idForHash(target):target?.closest?.('[data-audit-panel]')?.dataset.auditPanel;
    if(id)activate(id);
    const element=typeof target==='string'?document.getElementById(target.replace(/^#/,'')):target;
    for(let parent=element?.parentElement;parent;parent=parent.parentElement){if(parent.matches('details.audit-screen-directory'))parent.open=true;}
    return !!id;
  }
  function align(id){const target=document.getElementById(scrollTargets.get(id));if(id==='overview')window.scrollTo({top:0,behavior:'instant'});else target?.scrollIntoView({block:'start',behavior:'instant'});}
  function choose(id,focus=false){
    activate(id);const target=scrollTargets.get(id);history.pushState(history.state,'',`#${target}`);align(id);
    if(focus)buttons.get(id)?.focus({preventScroll:true});
  }
  bar.addEventListener('click',event=>{const button=event.target.closest('[data-audit-tab]');if(button)choose(button.dataset.auditTab);});
  bar.addEventListener('keydown',event=>{
    const current=event.target.closest('[data-audit-tab]');if(!current)return;
    const keys=[...buttons.keys()],index=keys.indexOf(current.dataset.auditTab);let next;
    if(event.key==='ArrowRight')next=keys[(index+1)%keys.length];
    if(event.key==='ArrowLeft')next=keys[(index-1+keys.length)%keys.length];
    if(event.key==='Home')next=keys[0];if(event.key==='End')next=keys.at(-1);
    if(next){event.preventDefault();choose(next,true);}
  });
  function revealSameHash(id){
    const topics=window.FlowWaveFeedbackConfig?.topics;
    const topic=topics?.[id]||topics?.[`finding-${id}`];
    if(topic?.kind==='finding'&&window.FlowWaveAuditFindings){window.FlowWaveAuditFindings.reveal(topic.id);return true;}
    if(topic?.kind==='task'&&window.FlowWaveTeamTaskView){window.FlowWaveTeamTaskView.reveal(topic.id);return true;}
    if(topic?.kind==='screen'&&window.FlowWaveConceptCore){window.FlowWaveConceptCore.show(topic.id);return true;}
    // Area filtering is owned by audit.js; a same-fragment click has no native hashchange.
    if(id.startsWith('area-')&&window.FlowWaveManagementAudit?.areas.some(area=>area.id===id.slice(5))){window.dispatchEvent(new Event('hashchange'));return true;}
    return false;
  }
  // Capturing phase precedes native fragment scrolling and other route owners.
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank')return;
    let url;try{url=new URL(link.href,location.href);}catch{return;}
    if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
    revealFor(url.hash);
    if(url.hash===location.hash){let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{return;}if(revealSameHash(id))return;const element=document.getElementById(id);requestAnimationFrame(()=>element?.scrollIntoView({block:'start',behavior:'instant'}));}
  },true);
  const followHash=()=>revealFor(location.hash);
  window.addEventListener('hashchange',followHash);window.addEventListener('popstate',followHash);
  let printScroll=0;
  window.addEventListener('beforeprint',()=>{printScroll=window.scrollY;printing=true;for(const panel of panels.values())panel.hidden=false;});
  window.addEventListener('afterprint',()=>{printing=false;activate(active);requestAnimationFrame(()=>window.scrollTo({top:printScroll,behavior:'instant'}));});
  window.FlowWaveAuditTabs=Object.freeze({revealFor,select:id=>choose(id),active:()=>active});
  activate(idForHash(location.hash)||'overview');
})();
