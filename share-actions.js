(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const textFromModal=modal=>{
  const title=(modal.querySelector('h2')?.textContent||document.getElementById('title')?.textContent||'TASKER dokument').trim();
  const fields=[...modal.querySelectorAll('label')].map(label=>{
    const name=label.querySelector('span')?.textContent?.trim();
    const el=label.querySelector('input:not([type="file"]),select,textarea');
    if(!name||!el)return null;
    const value=(el.value||'').trim();
    return value?`${name}: ${value}`:null;
  }).filter(Boolean);
  const summaries=[...modal.querySelectorAll('.pc-summary > div')].map(x=>{
    const a=x.querySelector('span')?.textContent?.trim(),b=x.querySelector('strong')?.textContent?.trim();
    return a&&b?`${a}: ${b}`:null;
  }).filter(Boolean);
  return {title,body:[title,'',...fields,...(summaries.length?['','REKAPITULACIJA',...summaries]:[])].join('\n')};
};
function printModal(modal){
  const {title}=textFromModal(modal);
  const clone=modal.cloneNode(true);
  clone.querySelectorAll('button,.rf-actions,input[type="file"]').forEach(el=>el.remove());
  clone.querySelectorAll('input,textarea,select').forEach(el=>{
    const span=document.createElement('div');span.className='print-value';span.textContent=el.value||'—';el.replaceWith(span);
  });
  const w=window.open('','_blank','width=1000,height=800');
  if(!w)return alert('Preglednik je blokirao prozor za ispis. Dozvoli pop-up za TASKER.');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;color:#111;background:#fff;margin:28px}h2{font-size:28px;margin:0 0 20px}.rf-kicker,.rf-subnote{color:#555}.rf-section{border:1px solid #bbb;border-radius:10px;margin:14px 0;overflow:hidden}.rf-section h3{margin:0;padding:10px 14px;background:#eee;font-size:13px}.rf-grid,.rf-topline{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px}.rf-field{display:block}.rf-field span{display:block;font-size:11px;font-weight:700;color:#555;margin-bottom:4px}.print-value{border-bottom:1px solid #ddd;padding:5px 0 8px;font-size:14px;min-height:18px}.pc-summary{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px}.pc-summary>div{padding:10px;border:1px solid #ddd}.pc-summary span{display:block;font-size:11px;color:#555}.pc-summary strong{font-size:18px}.rf-head button{display:none}@media print{body{margin:0}.rf-section{break-inside:avoid}}</style></head><body>${clone.innerHTML}</body></html>`);
  w.document.close();w.focus();setTimeout(()=>w.print(),250);
}
function emailModal(modal){
  const {title,body}=textFromModal(modal);
  const subject=encodeURIComponent(`TASKER - ${title}`);
  const msg=encodeURIComponent(`${body}\n\nOtvoreno iz TASKER 2.0.`);
  window.location.href=`mailto:?subject=${subject}&body=${msg}`;
}
function whatsAppModal(modal){
  const {title,body}=textFromModal(modal);
  const msg=encodeURIComponent(`TASKER - ${title}\n\n${body}`);
  window.open(`https://wa.me/?text=${msg}`,'_blank','noopener');
}
function addActions(modal){
  if(!modal||modal.dataset.shareActions==='1')return;
  const actions=modal.querySelector('.rf-actions');
  if(!actions)return;
  modal.dataset.shareActions='1';
  const box=document.createElement('div');box.className='doc-share-actions';
  box.innerHTML='<button class="rf-btn doc-print" type="button">🖨 Ispiši</button><button class="rf-btn doc-email" type="button">✉ E-mail</button><button class="rf-btn doc-wa" type="button">◉ WhatsApp</button>';
  actions.prepend(box);
  box.querySelector('.doc-print').onclick=()=>printModal(modal);
  box.querySelector('.doc-email').onclick=()=>emailModal(modal);
  box.querySelector('.doc-wa').onclick=()=>whatsAppModal(modal);
}
function scan(){document.querySelectorAll('.rf-modal').forEach(addActions)}
new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
scan();
window.TaskerDocumentShare={print:printModal,email:emailModal,whatsapp:whatsAppModal};
})();