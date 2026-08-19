(()=>{
const money=v=>String(v||'0,00').includes('€')?String(v):String(v||'0,00')+' EUR';
function getInvoiceRows(){try{return JSON.parse(localStorage.getItem('tasker2_rich_invoices_v2')||'null')}catch{return null}}
function demoRows(){return [
{id:'IFA-2026-14-1-1',status:'Knjiženo',invoice:'14-1-1',eracun:'POSLANO',fis:'✓',type:'RN',partner:'LAZZZ d.o.o.',date:'31.07.2026',due:'15.09.2026',amount:'57.638,26',vat:'0,00',total:'57.638,26',currency:'EUR'},
{id:'IFA-2026-13-1-1',status:'Knjiženo',invoice:'13-1-1',eracun:'POSLANO',fis:'✓',type:'RN',partner:'LAZZZ d.o.o.',date:'27.07.2026',due:'27.07.2026',amount:'360.000,00',vat:'0,00',total:'360.000,00',currency:'EUR'}]}
function currentRows(){const r=getInvoiceRows();return Array.isArray(r)&&r.length?r:demoRows()}
function invoiceDetail(r){
 title.textContent='Faktura '+(r.invoice||r.id||'');
 const total=r.total||r.amount||'0,00';
 content.innerHTML=`<div class="iskap-detail">
 <div class="iskap-back"><button class="filter" onclick="show('invoices')">← Povratak na fakture</button></div>
 <div class="iskap-detail-top"><div class="iskap-detail-title"><h2>KOMERCIJALNI RAČUN ${r.invoice||r.id||''}</h2><p>Operator: Stefan • TASKER 2.0</p></div><div class="iskap-badges"><span class="iskap-badge">${r.status||'Knjiženo'}</span><span class="iskap-badge ok">${r.eracun||'POSLANO'}</span><span class="iskap-badge ok">${r.fis?'FISKALIZIRANO':'SPREMNO'}</span></div></div>
 <div class="iskap-actionbar"><button>⊗ Storniraj</button><button>▣ Kopiraj</button><button>⌘ Detalji</button><button>▤ Temeljnica</button><button onclick="window.print()">🖨 Ispis</button><button>✉ Slanje</button><button id="invoiceAttachBtn">📎 Dokument</button><input id="invoiceAttachInput" type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"></div>
 <div class="iskap-detail-grid">
  <div class="iskap-info"><small>Kupac</small><b>${r.partner||'LAZZZ d.o.o.'}</b><span>Stari Laz 113C, 51314 Ravna Gora</span><span>OIB: 13189342499</span></div>
  <div class="iskap-info"><small>Datumi</small><b>Datum računa: ${r.date||'—'}</b><span>Datum dospijeća: ${r.due||'—'}</span><span>Razdoblje: 01.07.2026. – 31.07.2026.</span></div>
  <div class="iskap-info"><small>Referenca</small><b>Ugovor: 2025-51</b><span>Narudžbenica: —</span><span>PJ: LAZZZ Ravna Gora</span></div>
  <div class="iskap-info"><small>Plaćanje</small><b>TRR: ERSTE</b><span>HR2624020061100796882</span><span>Valuta: ${r.currency||'EUR'}</span></div>
 </div>
 <div class="iskap-lines"><table><thead><tr><th>#</th><th>Opis stavke</th><th>Kol.</th><th>Cijena</th><th>Popust</th><th>Ukupno</th><th>PDV %</th></tr></thead><tbody><tr><td>1</td><td>Vrijednost obavljenih radova / usluga prema ugovoru i obračunskom razdoblju</td><td>1 Kom</td><td>${money(r.amount)}</td><td>0%</td><td>${money(total)}</td><td>0%</td></tr></tbody></table></div>
 <div class="iskap-summary">
  <div class="iskap-box"><h3>Napomena i uvjeti</h3><p>Faktura izrađena prema ugovoru. Podaci su demo i služe za izradu funkcionalnosti Tasker 2.0 sustava.</p><div class="iskap-eracun"><b>eRačun</b><br><span>POSLANO • FISKALIZIRANO</span></div></div>
  <div class="iskap-box iskap-recap"><h3>Rekapitulacija</h3><div><span>Ukupno:</span><b>${money(r.amount)}</b></div><div><span>PDV:</span><b>${money(r.vat)}</b></div><div><span>Troškovi:</span><b>0,00 EUR</b></div><div class="total"><span>Sveukupno:</span><b>${money(total)}</b></div></div>
  <div class="iskap-box"><h3>Plaćanje</h3><button class="btn">+ Dodaj plaćanje</button><p style="margin-top:14px">Status: nije evidentirana uplata</p></div>
 </div></div>`;
 const ab=document.getElementById('invoiceAttachBtn'),ai=document.getElementById('invoiceAttachInput');if(ab&&ai){ab.onclick=()=>ai.click();ai.onchange=()=>{if(ai.files[0])ab.textContent='📎 '+ai.files[0].name}}
}
function hookInvoiceRows(){if(!document.getElementById('mb')||title.textContent!=='Fakture')return;const rows=currentRows();document.querySelectorAll('#mb tr').forEach((tr,i)=>{tr.style.cursor='pointer';tr.title='Otvori detalj računa';tr.addEventListener('click',e=>{if(e.target.closest('button'))return;const id=tr.querySelector('td b')?.textContent?.trim();const r=rows.find(x=>x.id===id)||rows[i];if(r)invoiceDetail(r)})})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-view="invoices"]');if(b)setTimeout(hookInvoiceRows,80)});
const obs=new MutationObserver(()=>{if(title&&title.textContent==='Fakture')setTimeout(hookInvoiceRows,0)});if(content)obs.observe(content,{childList:true,subtree:true});
window.openTaskerInvoiceDetail=invoiceDetail;
})();