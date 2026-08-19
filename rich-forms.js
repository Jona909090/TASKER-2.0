(()=>{
const CFG=()=>window.taskerFixedModules||{};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storeKey=v=>'tasker2_fixed_'+v+'_v1';
const load=v=>{try{const a=JSON.parse(localStorage.getItem(storeKey(v))||'[]');return Array.isArray(a)?a:[]}catch{return[]}};
const save=(v,a)=>localStorage.setItem(storeKey(v),JSON.stringify(a));
const T={date:/date|from|to|due|paid|valid|delivery|bookDate|payDate/i, money:/amount|vat|total|debit|credit|opening|income|expense|before|after|book|current/i, num:/age|days|hours|month|year|people|rows|rb|entitled|used|left/i, note:/note|subject|route|street|destination|description/i};
const layouts={
outgoing:{sub:'Evidencija izlazne pošte',sections:[['Dokument',['type','number','date']],['Primatelj i raspored',['partner','project']],['Napomena',['note']]]},
offers:{sub:'Komercijalna ponuda',sections:[['Kupac i ponuda',['partner','subject','date','valid']],['Financije',['amount','vat','total','currency']]]},
incomingInvoices:{sub:'Ulazni račun dobavljača',sections:[['Račun',['type','number','partner']],['Datumi i trošak',['date','due','paid','project']],['Iznosi',['amount','currency']]]},
invoices:{sub:'Komercijalni račun',sections:[['Račun i kupac',['invoice','type','partner']],['Datumi',['date','due']],['eRačun i fiskalizacija',['eracun','fis']],['Rekapitulacija',['amount','vat','total','currency']]]},
cash:{sub:'Blagajnički dnevnik',sections:[['Dnevnik',['date','partner','closedBy','closedAt']],['Promet blagajne',['opening','income','expense','amount']]]},
journal:{sub:'Temeljnica / izravno knjiženje',sections:[['Dokument knjiženja',['date','type']],['Opis knjiženja',['note']]]},
ledger:{sub:'Izvod prometa po kontu',sections:[['Dokument',['bookDate','type','docNo']],['Konto i analitika',['analytic','project']],['Promet',['debit','credit']],['Opis',['note']]]},
assets:{sub:'Kartica osnovnog sredstva',sections:[['Identifikacija sredstva',['inventory','subject','registration','group']],['Nabava',['partner','amount']],['Vrijednost i amortizacija',['current','book']]]},
amortization:{sub:'Obračun amortizacije',sections:[['Razdoblje obračuna',['date','from','to']],['Obračun',['amount']]]},
closing:{sub:'Otvorene stavke po analitici',sections:[['Konto i analitika',['account','analytic','currency']],['Otvoreni iznosi',['debit','credit','amount']]]},
vat:{sub:'PDV prijava za obračunsko razdoblje',sections:[['Razdoblje PDV prijave',['period','from','to']],['Podnositelj',['partner']],['Obračun PDV-a',['amount']]]},
reports:{sub:'Računovodstveni izvještaj',sections:[['Vrsta izvještaja',['subject','period']],['Opis / parametri',['note']]]},
gl:{sub:'Stavka glavne knjige',sections:[['Konto',['account','subject']],['Knjiženje',['debit','credit']]]},
opening:{sub:'Temeljnica početnog stanja',sections:[['Dokument',['date','type']],['Opis',['note']]]},
ios:{sub:'Izvod otvorenih stavaka',sections:[['Partner i datum',['date','partner']],['Saldo',['amount']]]},
finalState:{sub:'Završno knjiženje',sections:[['Dokument',['date','type']],['Opis',['note']]]},
bank:{sub:'Bankovni izvod / CAMT',sections:[['Izvod',['account','rb','date','currency']],['Promet',['income','expense','amount']],['Stanje računa',['before','after']],['Referenca',['note']]]},
payments:{sub:'Bankovni nalog za plaćanje',sections:[['Nalog i račun',['date','account']],['Iznos plaćanja',['amount','currency']],['Opis naloga',['note']]]},
candidates:{sub:'Kadrovska evidencija kandidata',sections:[['Osobni podaci',['partner','citizenship','age']],['Kontakt',['email','phone','city','street']]]},
travelOrders:{sub:'Putni nalog zaposlenika',sections:[['Zaposlenik i put',['partner','from','to','destination']],['Troškovi i svrha',['amount','note']]]},
leave:{sub:'Zahtjev za godišnji odmor',sections:[['Zaposlenik',['last','first','job']],['Razdoblje odmora',['from','to','days']],['Napomena',['note']]]},
leaveRights:{sub:'Evidencija prava na godišnji odmor',sections:[['Zaposlenik',['partner']],['Dani godišnjeg odmora',['entitled','used','left']]]},
travelPlan:{sub:'Plan službenog putovanja',sections:[['Ruta',['type','from','to']],['Vrijeme',['depart','arrival']],['Sudionici i upute',['people','route']]]},
hours:{sub:'Mjesečna evidencija radnih sati',sections:[['Poslovna jedinica i razdoblje',['project','month','year']],['Fond sati',['hours']]]},
payroll:{sub:'Obračun plaće',sections:[['Izvješće',['report','type']],['Razdoblje i isplata',['year','month','payDate']]]},
joppd:{sub:'JOPPD izvješće',sections:[['Izvješće',['report','date','type']],['Obuhvat',['people','rows']],['Sastavio / napomena',['partner','note']]]},
contracts:{sub:'Registar ugovora',sections:[['Ugovor',['type','subject','class','orderNo']],['Partner i vrijednost',['partner','amount']],['Trajanje',['from','to']]]},
companyDocs:{sub:'Dokumentacija društva',sections:[['Dokument',['type','date']],['Napomena / opis',['note']]]},
orders:{sub:'Narudžbenica dobavljaču',sections:[['Dobavljač i projekt',['partner','project']],['Datumi',['date','delivery']],['Iznos i napomena',['amount','note']]]},
items:{sub:'Šifrarnik robe, materijala i usluga',sections:[['Artikl / usluga',['code','subject','unit']],['Porez i cijena',['vat','amount']],['Dobavljač',['partner']]]}
};
function inputType(k){if(T.date.test(k))return'date';if(T.money.test(k)||T.num.test(k))return'text';return'text'}
function field(k,l,r){const val=esc(r[k]||'');if(T.note.test(k)&&!['subject','street','destination'].includes(k))return`<label class="rf-field wide"><span>${esc(l)}</span><textarea id="rf_${k}">${val}</textarea></label>`;return`<label class="rf-field"><span>${esc(l)}</span><input id="rf_${k}" type="${inputType(k)}" value="${val}"></label>`}
function richOpen(v,id=''){
 const c=CFG()[v];if(!c)return;const rows=load(v),cur=rows.find(x=>x.id===id),r=cur||{id:c.p+'-'+Date.now().toString().slice(-6),status:c.s[0],fileName:''},lay=layouts[v]||{sub:c.t,sections:[['Podaci',c.c.map(x=>x[0])]]};
 document.getElementById('rfOverlay')?.remove();document.getElementById('fxOverlay')?.remove();
 const labels=Object.fromEntries(c.c);const used=new Set();const sections=lay.sections.map(([name,keys])=>{const ks=keys.filter(k=>labels[k]);ks.forEach(k=>used.add(k));return`<section class="rf-section"><h3>${esc(name)}</h3><div class="rf-grid">${ks.map(k=>field(k,labels[k],r)).join('')}</div></section>`}).join('');const rest=c.c.filter(([k])=>!used.has(k));
 document.body.insertAdjacentHTML('beforeend',`<div class="rf-overlay" id="rfOverlay"><div class="rf-modal"><div class="rf-head"><div><div class="rf-kicker">${cur?'UREĐIVANJE ZAPISA':'NOVI ZAPIS'}</div><h2>${esc(c.t)}</h2></div><button class="rf-close" id="rfClose">×</button></div><div class="rf-body"><p class="rf-subnote">${esc(lay.sub)}</p><div class="rf-topline"><label class="rf-field"><span>Evidencijski broj</span><input id="rfId" value="${esc(r.id)}"></label><label class="rf-field"><span>Status</span><select id="rfStatus">${c.s.map(s=>`<option ${r.status===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label></div>${sections}${rest.length?`<section class="rf-section"><h3>Dodatni podaci</h3><div class="rf-grid">${rest.map(([k,l])=>field(k,l,r)).join('')}</div></section>`:''}<section class="rf-section"><h3>Dokument / prilog</h3><div class="rf-grid"><label class="rf-field wide"><span>Priloži dokument</span><div class="rf-filebox"><input id="rfFile" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"><span class="rf-hint">${r.fileName?'Trenutno: '+esc(r.fileName):'PDF, Word, Excel ili slika'}</span></div></label></div></section></div><div class="rf-actions">${cur?'<button class="rf-btn danger" id="rfDelete">Obriši zapis</button>':'<span></span>'}<div class="rf-actions-right"><button class="rf-btn" id="rfCancel">Odustani</button><button class="rf-btn primary" id="rfSave">Sačuvaj</button></div></div></div></div>`);
 const close=()=>document.getElementById('rfOverlay')?.remove();rfClose.onclick=close;rfCancel.onclick=close;
 rfSave.onclick=()=>{const o={id:rfId.value.trim(),status:rfStatus.value,fileName:r.fileName||''};if(!o.id)return alert('Unesi evidencijski broj.');c.c.forEach(([k])=>{const el=document.getElementById('rf_'+k);o[k]=el?el.value.trim():''});const f=rfFile.files[0];if(f)o.fileName=f.name;save(v,cur?rows.map(x=>x.id===id?o:x):[o,...rows]);close();window.show(v)};
 if(cur)rfDelete.onclick=()=>{if(confirm('Obrisati zapis '+cur.id+'?')){save(v,rows.filter(x=>x.id!==cur.id));close();window.show(v)}};
}
function currentView(){const t=document.getElementById('title')?.textContent||'';return Object.keys(CFG()).find(k=>CFG()[k].t===t)}
function hook(){const b=document.getElementById('fxNew');if(b&&!b.dataset.rich){b.dataset.rich='1';b.onclick=e=>{e.preventDefault();e.stopPropagation();const v=currentView();if(v)richOpen(v)}}}
new MutationObserver(hook).observe(document.documentElement,{childList:true,subtree:true});hook();
document.addEventListener('click',e=>{const edit=e.target.closest('[data-edit]');if(!edit)return;const v=currentView();if(!v)return;e.preventDefault();e.stopImmediatePropagation();richOpen(v,edit.dataset.edit)},true);
window.taskerRichForm=richOpen;
})();