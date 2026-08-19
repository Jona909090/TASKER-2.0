const DELIVERY_KEY='tasker2_delivery_docs_v1';
const deliveryDefaults=[
{id:'DOC-2026-031',name:'Račun 698-1-1',sender:'Radnik usluge d.o.o.',date:'18.08.2026',type:'Ulazni račun',status:'Novo',note:'',file:''},
{id:'DOC-2026-030',name:'Ponuda P-2026-044',sender:'Demo dobavljač',date:'18.08.2026',type:'Ponuda',status:'Novo',note:'',file:''},
{id:'DOC-2026-029',name:'Dokument radnika',sender:'Kadrovska',date:'17.08.2026',type:'Dokument',status:'Zaprimljeno',note:'',file:''}
];
let deliveryDocs=loadDeliveryDocs();
let deliveryFilter='Sve';
let deliverySearch='';
function loadDeliveryDocs(){try{const d=JSON.parse(localStorage.getItem(DELIVERY_KEY)||'null');return Array.isArray(d)&&d.length?d:JSON.parse(JSON.stringify(deliveryDefaults))}catch(e){return JSON.parse(JSON.stringify(deliveryDefaults))}}
function saveDeliveryDocs(){localStorage.setItem(DELIVERY_KEY,JSON.stringify(deliveryDocs))}
function dEsc(s){return String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]))}
function deliveryStatusClass(s){return s==='Novo'?'delivery-new':s==='Obrađeno'?'delivery-done':'delivery-received'}
function deliveryView(){
 title.textContent='Dostava dokumenata';
 content.innerHTML=`<div class="delivery-head"><div><h2>Dostava dokumenata</h2><p>Dokumenti poslani firmi na obradu.</p></div><button class="btn delivery-add" onclick="openDeliveryForm()">+ Dostavi dokument</button></div>
 <div class="delivery-controls"><div class="delivery-tabs"><button class="delivery-tab active" data-dfilter="Sve">Sve</button><button class="delivery-tab" data-dfilter="Novo">Novo</button><button class="delivery-tab" data-dfilter="Zaprimljeno">Zaprimljeno</button><button class="delivery-tab" data-dfilter="Obrađeno">Obrađeno</button></div><div class="delivery-search">⌕ <input id="deliverySearchInput" placeholder="Pretraži dokumente..."></div></div>
 <div class="delivery-summary"><div><span>Ukupno</span><b>${deliveryDocs.length}</b></div><div><span>Novo</span><b>${deliveryDocs.filter(x=>x.status==='Novo').length}</b></div><div><span>Zaprimljeno</span><b>${deliveryDocs.filter(x=>x.status==='Zaprimljeno').length}</b></div><div><span>Obrađeno</span><b>${deliveryDocs.filter(x=>x.status==='Obrađeno').length}</b></div></div>
 <div class="card delivery-table-wrap"><table class="delivery-table"><thead><tr><th>Dokument</th><th>Pošiljatelj</th><th>Datum</th><th>Vrsta</th><th>Status</th><th></th></tr></thead><tbody id="deliveryRows"></tbody></table><div id="deliveryEmpty" class="delivery-empty" hidden>Nema dokumenata za odabrani filter.</div></div>`;
 bindDeliveryControls();renderDeliveryRows();
}
function bindDeliveryControls(){
 document.querySelectorAll('[data-dfilter]').forEach(b=>b.onclick=()=>{deliveryFilter=b.dataset.dfilter;document.querySelectorAll('[data-dfilter]').forEach(x=>x.classList.toggle('active',x===b));renderDeliveryRows()});
 const s=document.getElementById('deliverySearchInput');if(s)s.oninput=()=>{deliverySearch=s.value.trim().toLowerCase();renderDeliveryRows()};
}
function renderDeliveryRows(){
 const body=document.getElementById('deliveryRows');if(!body)return;
 const rows=deliveryDocs.filter(d=>(deliveryFilter==='Sve'||d.status===deliveryFilter)&&(`${d.name} ${d.sender} ${d.type} ${d.id}`.toLowerCase().includes(deliverySearch)));
 body.innerHTML=rows.map(d=>`<tr class="delivery-row" onclick="openDeliveryDetail('${d.id}')"><td><div class="delivery-doc-name"><span class="delivery-file-icon">▤</span><div><b>${dEsc(d.name)}</b><small>${dEsc(d.id)}</small></div></div></td><td>${dEsc(d.sender)}</td><td>${dEsc(d.date)}</td><td>${dEsc(d.type)}</td><td><span class="delivery-status ${deliveryStatusClass(d.status)}">${dEsc(d.status)}</span></td><td><button class="delivery-open" onclick="event.stopPropagation();openDeliveryDetail('${d.id}')">Otvori →</button></td></tr>`).join('');
 document.getElementById('deliveryEmpty').hidden=rows.length!==0;
}
function openDeliveryForm(){
 document.getElementById('deliveryOverlay')?.remove();
 const today=new Date().toISOString().slice(0,10);
 document.body.insertAdjacentHTML('beforeend',`<div class="delivery-overlay" id="deliveryOverlay"><div class="delivery-modal"><div class="delivery-modal-head"><div><small>NOVI ZAPIS</small><h3>Dostavi dokument</h3></div><button onclick="closeDeliveryOverlay()">×</button></div><div class="delivery-form"><label><span>Naziv dokumenta</span><input id="dName" placeholder="npr. Račun 698-1-1"></label><label><span>Pošiljatelj</span><input id="dSender" placeholder="Naziv firme ili osobe"></label><label><span>Vrsta dokumenta</span><select id="dType"><option>Ulazni račun</option><option>Ponuda</option><option>Ugovor</option><option>Dopis</option><option>Dokument radnika</option><option>Ostalo</option></select></label><label><span>Datum</span><input id="dDate" type="date" value="${today}"></label><label class="wide"><span>Napomena</span><textarea id="dNote" rows="3" placeholder="Opcionalna napomena..."></textarea></label><label class="wide delivery-file-picker"><span>Datoteka</span><input id="dFile" type="file"><small id="dFileName">Nije odabrana datoteka</small></label></div><div class="delivery-modal-actions"><button class="filter" onclick="closeDeliveryOverlay()">Odustani</button><button class="btn" onclick="saveNewDelivery()">Spremi dokument</button></div></div></div>`);
 const f=document.getElementById('dFile');f.onchange=()=>document.getElementById('dFileName').textContent=f.files[0]?.name||'Nije odabrana datoteka';
}
function closeDeliveryOverlay(){document.getElementById('deliveryOverlay')?.remove()}
function saveNewDelivery(){
 const name=document.getElementById('dName').value.trim(),sender=document.getElementById('dSender').value.trim();if(!name||!sender){alert('Unesi naziv dokumenta i pošiljatelja.');return}
 const raw=document.getElementById('dDate').value;const parts=raw.split('-');const date=parts.length===3?`${parts[2]}.${parts[1]}.${parts[0]}`:'';
 const n=deliveryDocs.length?Math.max(...deliveryDocs.map(x=>parseInt((x.id.match(/(\d+)$/)||['','0'])[1],10)))+1:1;
 deliveryDocs.unshift({id:`DOC-2026-${String(n).padStart(3,'0')}`,name,sender,date,type:document.getElementById('dType').value,status:'Novo',note:document.getElementById('dNote').value.trim(),file:document.getElementById('dFile').files[0]?.name||''});
 saveDeliveryDocs();closeDeliveryOverlay();deliveryView();
}
function openDeliveryDetail(id){
 const d=deliveryDocs.find(x=>x.id===id);if(!d)return;
 document.getElementById('deliveryOverlay')?.remove();
 document.body.insertAdjacentHTML('beforeend',`<div class="delivery-overlay" id="deliveryOverlay"><div class="delivery-modal delivery-detail-modal"><div class="delivery-modal-head"><div><small>${dEsc(d.id)}</small><h3>${dEsc(d.name)}</h3></div><button onclick="closeDeliveryOverlay()">×</button></div><div class="delivery-detail-grid"><div><span>Pošiljatelj</span><b>${dEsc(d.sender)}</b></div><div><span>Datum</span><b>${dEsc(d.date)}</b></div><div><span>Vrsta</span><b>${dEsc(d.type)}</b></div><div><span>Status</span><b><span class="delivery-status ${deliveryStatusClass(d.status)}">${dEsc(d.status)}</span></b></div><div class="wide"><span>Datoteka</span><b>${d.file?dEsc(d.file):'Nije priložena'}</b></div><div class="wide"><span>Napomena</span><b>${d.note?dEsc(d.note):'—'}</b></div></div><div class="delivery-status-actions"><button onclick="setDeliveryStatus('${id}','Novo')">Novo</button><button onclick="setDeliveryStatus('${id}','Zaprimljeno')">Zaprimljeno</button><button onclick="setDeliveryStatus('${id}','Obrađeno')">Obrađeno</button></div><div class="delivery-modal-actions"><button class="delivery-delete" onclick="deleteDelivery('${id}')">Obriši</button><button class="filter" onclick="closeDeliveryOverlay()">Zatvori</button></div></div></div>`);
}
function setDeliveryStatus(id,status){const d=deliveryDocs.find(x=>x.id===id);if(!d)return;d.status=status;saveDeliveryDocs();closeDeliveryOverlay();deliveryView()}
function deleteDelivery(id){if(!confirm('Obrisati ovaj dokument?'))return;deliveryDocs=deliveryDocs.filter(x=>x.id!==id);saveDeliveryDocs();closeDeliveryOverlay();deliveryView()}
