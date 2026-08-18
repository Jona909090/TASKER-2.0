const COMPANY_STORAGE_KEY='tasker2_company_profile_v1';
const companyDefaults={name:'TASKER d.o.o.',system:'Tasker 2.0',oib:'Demo podaci',status:'Aktivno',units:['Glavna poslovna jedinica'],activeUnit:'Glavna poslovna jedinica'};
let companyProfile=loadCompanyProfile();
function loadCompanyProfile(){try{return {...companyDefaults,...JSON.parse(localStorage.getItem(COMPANY_STORAGE_KEY)||'{}')}}catch(e){return {...companyDefaults}}}
function saveCompanyProfile(){localStorage.setItem(COMPANY_STORAGE_KEY,JSON.stringify(companyProfile));renderCompanyProfile();}
function renderCompanyProfile(){
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
  set('companyNameCard',companyProfile.name||companyDefaults.name);
  set('companySystemCard',companyProfile.system||companyDefaults.system);
  set('companyOibCard',companyProfile.oib||companyDefaults.oib);
  set('companyUnitCard',companyProfile.activeUnit||companyProfile.units?.[0]||'Nije odabrano');
  set('sidebarCompanyName',companyProfile.name||companyDefaults.name);
  const card=document.getElementById('companyCard');if(card)card.dataset.company=`${companyProfile.name} ${companyProfile.oib} ${(companyProfile.units||[]).join(' ')}`.toLowerCase();
  const status=document.getElementById('companyStatusLabel');if(status){status.textContent=`● ${companyProfile.status}`;status.className=`status ${companyProfile.status==='Aktivno'?'green':'yellow'}`}
}
function openCompanySettings(){
  document.getElementById('settingCompanyName').value=companyProfile.name||'';
  document.getElementById('settingCompanySystem').value=companyProfile.system||'';
  document.getElementById('settingCompanyOib').value=companyProfile.oib||'';
  document.getElementById('settingCompanyStatus').value=companyProfile.status||'Aktivno';
  renderUnitList();
  const modal=document.getElementById('companySettingsModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeCompanySettings(){const modal=document.getElementById('companySettingsModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
function renderUnitList(){
  const list=document.getElementById('unitList');
  const units=companyProfile.units||[];
  list.innerHTML=units.length?units.map((unit,i)=>`<div class="unit-row ${unit===companyProfile.activeUnit?'active':''}"><button class="unit-select" data-unit-index="${i}"><span class="unit-radio"></span><b>${escapeHtml(unit)}</b>${unit===companyProfile.activeUnit?'<small>Prikazuje se na kartici</small>':''}</button><button class="unit-delete" data-delete-index="${i}" ${units.length===1?'disabled':''}>×</button></div>`).join(''):'<div class="unit-empty">Nema poslovnih jedinica.</div>';
  list.querySelectorAll('.unit-select').forEach(btn=>btn.addEventListener('click',()=>{companyProfile.activeUnit=units[Number(btn.dataset.unitIndex)];renderUnitList()}));
  list.querySelectorAll('.unit-delete').forEach(btn=>btn.addEventListener('click',()=>{const idx=Number(btn.dataset.deleteIndex);const removed=companyProfile.units[idx];companyProfile.units.splice(idx,1);if(companyProfile.activeUnit===removed)companyProfile.activeUnit=companyProfile.units[0]||'';renderUnitList()}));
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
document.addEventListener('DOMContentLoaded',()=>{
  renderCompanyProfile();
  document.getElementById('adminSettingsBtn')?.addEventListener('click',openCompanySettings);
  document.getElementById('settingsClose')?.addEventListener('click',closeCompanySettings);
  document.getElementById('companySettingsModal')?.addEventListener('click',e=>{if(e.target.id==='companySettingsModal')closeCompanySettings()});
  document.getElementById('addUnitBtn')?.addEventListener('click',()=>{const input=document.getElementById('newUnitInput');const name=input.value.trim();if(!name)return;if(!companyProfile.units.includes(name))companyProfile.units.push(name);companyProfile.activeUnit=name;input.value='';renderUnitList()});
  document.getElementById('newUnitInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('addUnitBtn').click()}});
  document.getElementById('saveCompanyBtn')?.addEventListener('click',()=>{
    companyProfile.name=document.getElementById('settingCompanyName').value.trim()||companyDefaults.name;
    companyProfile.system=document.getElementById('settingCompanySystem').value.trim()||companyDefaults.system;
    companyProfile.oib=document.getElementById('settingCompanyOib').value.trim()||companyDefaults.oib;
    companyProfile.status=document.getElementById('settingCompanyStatus').value;
    if(!companyProfile.units?.length){companyProfile.units=[companyDefaults.units[0]];companyProfile.activeUnit=companyDefaults.units[0]}
    saveCompanyProfile();closeCompanySettings();
  });
  document.getElementById('resetCompanyBtn')?.addEventListener('click',()=>{companyProfile={...companyDefaults,units:[...companyDefaults.units]};localStorage.removeItem(COMPANY_STORAGE_KEY);saveCompanyProfile();openCompanySettings()});
});