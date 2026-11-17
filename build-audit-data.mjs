#!/usr/bin/env node
/* Rebuild report assets only; no network or production data access. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const write=(name,text)=>fs.writeFileSync(path.join(root,name),text);
const tasks=read('team-tasks.json');
write('team-tasks-data.js','/* Generated from team-tasks.json. No production status or external calls. */\nwindow.FlowWaveTeamTasks = '+JSON.stringify(tasks)+';\n');
write('feature-history-data.js','/* Generated from feature-history.json. Source history, not runtime acceptance. */\nwindow.FlowWaveFeatureHistory = '+JSON.stringify(read('feature-history.json'))+';\n');
const headers=['ID','Priorität','Bereich','Titel','Art','Status','Zuständigkeit (Rolle)','Abhängigkeiten','Findings','Historienbelege','Ziel','Umsetzung','Abnahmekriterien','Screens','Audit-Link'];
const rows=tasks.tasks.map(t=>[t.id,t.priority,t.area,t.title,t.kind,t.status,t.owner,t.depends.join(' · '),t.sources.join(' · '),(t.historySources||[]).join(' · '),t.outcome,t.work,t.acceptance.map((x,i)=>`${i+1}. ${x}`).join('\n'),t.screens.join(' · '),`https://smoremore.github.io/flowwave-ux-audit-2026-11-13/#task-${t.id}`]);
const quote=value=>/[",\r\n]/.test(String(value))?'"'+String(value).replace(/"/g,'""')+'"':String(value);
write('team-tasks.csv','\ufeff'+[headers,...rows].map(row=>row.map(quote).join(',')).join('\n')+'\n');
console.log(`Rebuilt ${tasks.tasks.length} tasks and ${read('feature-history.json').entries.length} history entries.`);
