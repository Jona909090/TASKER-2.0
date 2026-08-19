const PROJECTS_KEY='tasker2_projects_v2';
let projectFilter='Aktivni';
let projectSearch='';

function loadProjectsStore(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROJECTS_KEY)||'null');
    if(Array.isArray(saved)&&saved.length){projectsData.splice(0,projectsData.length,...saved)}
  }catch(e){}
}
function saveProjectsStore(){localStorage.setItem(PROJECTS_KEY,JSON.stringify(projectsData))}
function pEsc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function moneyNum(v){return Number(String(v??0).replace(/[^0-9,-]/g,'').replace(/\./g,'').replace(',','.'))||0}
function moneyFmt(v){return new Intl.NumberFormat('hr-HR',{minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v)||0)+' €'}
function displayDate(raw){if(!raw)return'';if(/^\d{2}\.\d{2}\.\d{4}$/.test(raw))return raw;const p=raw.split('-');return p.length===3?`${p[2]}.${p[1]}.${p[0]}`:raw}
function inputDate(raw){if(!raw)return'';if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;const m=raw.match(/(\d{2})\.(\d{2})\.(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:''}
function projectStatusClass(s){return s==='Aktivan'?'green':s==='Isporučeno'?'blue':'gray'}
function normalizeProject(p){
  p.id=p.id||('PRJ-'+Date.now()+'-'+Math.random().toString(16).slice(2,6));
  p.name=p.name||'Novo gradilište'; p.status=p.status||'Aktivan'; p.start=p.start||''; p.end=p.end||'';
  p.workers=Number(p.workers)||0; p.cost=typeof p.cost==='number'?moneyFmt(p.cost):p.cost||'0 €'; p.billed=typeof p.billed==='number'?moneyFmt(p.billed):p.billed||'0 €';
  p.result=moneyFmt(moneyNum(p.billed)-moneyNum(p.cost)); p.progress=Math.max(0,Math.min(100,Number(p.progress)||0));
  p.address=p.address||''; p.client=p.client||''; p.manager=p.manager||''; p.note=p.note||'';
  return p;
}
loadProjectsStore(); projectsData.forEach(normalizeProject);

function projects(){
 title.textContent='Gradilišta';
 const rows=getFilteredProjects();
 content.innerHTML=`<div class="projects-topbar">
   <div class="project-filter-group">
    <button class="filter ${projectFilter==='Aktivni'?'active':''}" onclick="setProjectFilter('Aktivni')">Aktivni</button>
    <button class="filter ${projectFilter==='Isporučeno'?'active':''}" onclick="setProjectFilter('Isporučeno')">Isporučeno</button>
    <button class="filter ${projectFilter==='Arhiva'?'active':''}" onclick="setProjectFilter('Arhiva')">Arhiva</button>
    <button class="filter ${projectFilter==='Sve'?'active':''}" onclick="setProjectFilter('Sve')">Sve</button>
   </div>
   <div class="project-top-actions"><div class="project-search">⌕ <input value="${pEsc(projectSearch)}" oninput="projectSearch=this.value;renderProjectRows()" placeholder="Pretraži gradilišta..."></div><button class="btn" onclick="openProjectForm()">+ Novo gradilište</button></div>
 </div>
 <div class="card table-card project-table-card"><table class="project-table"><thead><tr><th>Projekt</th><th>Status</th><th>Početak</th><th>Završetak</th><th>Radnici</th><th>Trošak</th><th>Fakturirano</th><th>Rezultat</th><th></th></tr></thead><tbody id="projectRows"></tbody></table><div class="project-empty" id="projectEmpty" hidden>Nema gradilišta u ovom prikazu.</div></div>`;
 renderProjectRows();
}
function getFilteredProjects(){
 const q=projectSearch.trim().toLowerCase();
 return projectsData.filter(p=>{
   const statusOk=projectFilter==='Sve'||(projectFilter==='Aktivni'&&p.status==='Aktivan')||(projectFilter==='Isporučeno'&&p.status==='Isporučeno')||(projectFilter==='Arhiva'&&p.status==='Arhiva');
   const searchOk=!q||`${p.name} ${p.client||''} ${p.address||''} ${p.manager||''}`.toLowerCase().includes(q);
   return statusOk&&searchOk;
 });
}
function setProjectFilter(v){projectFilter=v;projects()}
function renderProjectRows(){
 const body=document.getElementById('projectRows'); if(!body)return;
 const rows=getFilteredProjects();
 body.innerHTML=rows.map(p=>`<tr class="table-link" onclick="openProjectDetailById('${p.id}')"><td><b>${pEsc(p.name)}</b>${p.address?`<small class="project-sub">${pEsc(p.address)}</small>`:''}</td><td>${pill(pEsc(p.status),projectStatusClass(p.status))}</td><td>${pEsc(p.start||'—')}</td><td>${pEsc(p.end||'—')}</td><td>${p.workers}</td><td>${pEsc(p.cost)}</td><td>${pEsc(p.billed)}</td><td><b>${pEsc(p.result)}</b></td><td><button class="project-edit-btn" onclick="event.stopPropagation();openProjectForm('${p.id}')">Uredi</button></td></tr>`).join('');
 const empty=document.getElementById('projectEmpty'); if(empty)empty.hidden=rows.length!==0;
}
function openProjectForm(id){
 const current=id?projectsData.find(x=>x.id===id):null;
 document.getElementById('projectOverlay')?.remove();
 const p=current||{name:'',status:'Aktivan',start:'',end:'',workers:0,cost:'0 €',billed:'0 €',progress:0,address:'',client:'',manager:'',note:''};
 document.body.insertAdjacentHTML('beforeend',`<div class="project-overlay" id="projectOverlay"><div class="project-modal"><div class="project-modal-head"><div><small>${current?'UREĐIVANJE PROJEKTA':'NOVO GRADILIŠTE'}</small><h3>${current?pEsc(current.name):'Dodaj gradilište'}</h3></div><button onclick="closeProjectOverlay()">×</button></div><div class="project-form-grid">
 <label><span>Naziv projekta *</span><input id="prName" value="${pEsc(p.name)}" placeholder="npr. Kuća Čolak"></label>
 <label><span>Status</span><select id="prStatus"><option ${p.status==='Aktivan'?'selected':''}>Aktivan</option><option ${p.status==='Isporučeno'?'selected':''}>Isporučeno</option><option ${p.status==='Arhiva'?'selected':''}>Arhiva</option></select></label>
 <label><span>Datum početka</span><input id="prStart" type="date" value="${inputDate(p.start)}"></label>
 <label><span>Datum završetka</span><input id="prEnd" type="date" value="${inputDate(p.end)}"></label>
 <label><span>Investitor / kupac</span><input id="prClient" value="${pEsc(p.client)}" placeholder="Naziv investitora"></label>
 <label><span>Voditelj projekta</span><input id="prManager" value="${pEsc(p.manager)}" placeholder="Ime voditelja"></label>
 <label class="wide"><span>Adresa gradilišta</span><input id="prAddress" value="${pEsc(p.address)}" placeholder="Ulica, grad"></label>
 <label><span>Broj radnika</span><input id="prWorkers" type="number" min="0" value="${Number(p.workers)||0}"></label>
 <label><span>Napredak %</span><input id="prProgress" type="number" min="0" max="100" value="${Number(p.progress)||0}"></label>
 <label><span>Trošak (€)</span><input id="prCost" type="number" step="0.01" min="0" value="${moneyNum(p.cost)}"></label>
 <label><span>Fakturirano (€)</span><input id="prBilled" type="number" step="0.01" min="0" value="${moneyNum(p.billed)}"></label>
 <label class="wide"><span>Napomena</span><textarea id="prNote" rows="4" placeholder="Napomena o projektu...">${pEsc(p.note)}</textarea></label>
 </div><div class="project-modal-actions">${current?`<button class="project-delete" onclick="deleteProject('${current.id}')">Obriši gradilište</button>`:'<span></span>'}<div><button class="filter" onclick="closeProjectOverlay()">Odustani</button><button class="btn" onclick="saveProject('${current?.id||''}')">${current?'Sačuvaj promjene':'Dodaj gradilište'}</button></div></div></div></div>`);
}
function closeProjectOverlay(){document.getElementById('projectOverlay')?.remove()}
function saveProject(id){
 const name=document.getElementById('prName').value.trim(); if(!name){alert('Unesi naziv gradilišta.');return}
 const data={name,status:document.getElementById('prStatus').value,start:displayDate(document.getElementById('prStart').value),end:displayDate(document.getElementById('prEnd').value),client:document.getElementById('prClient').value.trim(),manager:document.getElementById('prManager').value.trim(),address:document.getElementById('prAddress').value.trim(),workers:Number(document.getElementById('prWorkers').value)||0,progress:Number(document.getElementById('prProgress').value)||0,cost:moneyFmt(Number(document.getElementById('prCost').value)||0),billed:moneyFmt(Number(document.getElementById('prBilled').value)||0),note:document.getElementById('prNote').value.trim()};
 data.result=moneyFmt(moneyNum(data.billed)-moneyNum(data.cost));
 if(id){const p=projectsData.find(x=>x.id===id);Object.assign(p,data)} else projectsData.unshift(normalizeProject({id:'PRJ-'+Date.now(),...data}));
 saveProjectsStore(); closeProjectOverlay(); projects();
}
function deleteProject(id){if(!confirm('Obrisati ovo gradilište?'))return;const i=projectsData.findIndex(x=>x.id===id);if(i>=0)projectsData.splice(i,1);saveProjectsStore();closeProjectOverlay();projects()}
function openProjectDetailById(id){const p=projectsData.find(x=>x.id===id);if(!p)return;openProjectWorkspace(p)}
function openProjectDetail(name){const p=projectsData.find(x=>x.name===name);if(!p)return;openProjectWorkspace(p)}
function openProjectWorkspace(p){
 title.textContent=p.name;
 content.innerHTML=`<div class="project-detail-toolbar"><button class="filter" onclick="projects()">← Sva gradilišta</button><div><button class="filter" onclick="openProjectForm('${p.id}')">Uredi</button><button class="btn" onclick="setProjectQuickStatus('${p.id}')">Promijeni status</button></div></div>
 <div class="hero"><div><h2>${pEsc(p.name)}</h2><p>${p.address?pEsc(p.address)+' • ':''}${p.client?'Investitor: '+pEsc(p.client)+' • ':''}Početak: ${pEsc(p.start||'—')}</p></div><div class="chip">${p.progress}% ZAVRŠENO</div></div>
 <div class="grid kpis">${detailKpi('Radnici',p.workers)}${detailKpi('Trošak',p.cost)}${detailKpi('Fakturirano',p.billed)}${detailKpi('Rezultat',p.result)}</div>
 <div class="project-progress-card card"><div class="section-title"><h3>Napredak projekta</h3><b>${p.progress}%</b></div><div class="progress large"><span style="width:${p.progress}%"></span></div></div>
 <div class="grid split"><div class="card"><div class="section-title"><h3>Podaci gradilišta</h3></div>${mini(['Podatak','Vrijednost'],[['Status',p.status],['Početak',p.start||'—'],['Završetak',p.end||'—'],['Investitor',p.client||'—'],['Voditelj',p.manager||'—'],['Adresa',p.address||'—'],['Napomena',p.note||'—']])}</div><div class="card"><div class="section-title"><h3>Rad u projektu</h3></div><button class="btn quick-action" onclick="show('hours')">Radni sati</button><button class="btn secondary quick-action" onclick="show('orders')">Narudžbenice</button><button class="btn secondary quick-action" onclick="show('incomingInvoices')">Ulazni računi</button><button class="btn secondary quick-action" onclick="show('invoices')">Fakture</button><button class="btn secondary quick-action" onclick="show('companyDocs')">Dokumentacija</button><button class="btn secondary quick-action" onclick="show('employees')">Radnici</button></div></div>`;
}
function setProjectQuickStatus(id){const p=projectsData.find(x=>x.id===id);if(!p)return;const order=['Aktivan','Isporučeno','Arhiva'];p.status=order[(order.indexOf(p.status)+1)%order.length];saveProjectsStore();openProjectWorkspace(p)}
