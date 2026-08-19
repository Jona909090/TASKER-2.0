document.addEventListener('DOMContentLoaded',()=>{
  const railButtons=[...document.querySelectorAll('.rail-btn')];
  const setRailActive=(btn)=>{railButtons.forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active')};
  const renderRailPage=(page,btn)=>{
    setRailActive(btn);
    if(page==='firma'){show('dashboard');return;}
    if(page==='postavke'){if(typeof requestMasterAccess==='function')requestMasterAccess();return;}
    const pages={
      izvjestaji:{title:'Izvještaji',html:`<div class="hero"><div><h2>Izvještaji poslovanja</h2><p>Pregled ključnih financijskih, operativnih i kadrovskih izvještaja.</p></div><div class="chip">● AŽURNO</div></div><div class="grid kpis">${kpi('Prihodi','442.000 €','tekuća godina')}${kpi('Troškovi','651.000 €','tekuća godina')}${kpi('Otvorena potraživanja','226.215 €','5 najvećih stavki')}${kpi('Aktivni projekti','7','trenutno')}</div><div class="card table-card" style="margin-top:16px"><table><thead><tr><th>Izvještaj</th><th>Razdoblje</th><th>Status</th><th>Akcija</th></tr></thead><tbody><tr><td>RDG</td><td>01–08/2026</td><td>${pill('Spremno','green')}</td><td><button class="btn secondary">Otvori</button></td></tr><tr><td>Troškovi po gradilištu</td><td>08/2026</td><td>${pill('Spremno','green')}</td><td><button class="btn secondary">Otvori</button></td></tr><tr><td>Radni sati</td><td>08/2026</td><td>${pill('U izradi','blue')}</td><td><button class="btn secondary">Otvori</button></td></tr></tbody></table></div>`},
      ovjera:{title:'Ovjera',html:`<div class="toolbar"><div><h2 style="margin:0">Dokumenti za ovjeru</h2><p class="muted">Stavke koje čekaju tvoju potvrdu.</p></div><button class="btn">Ovjeri odabrano</button></div><div class="card table-card"><table><thead><tr><th>Dokument</th><th>Partner</th><th>Datum</th><th>Iznos</th><th>Status</th></tr></thead><tbody><tr><td>Ulazni račun UR-2026-0812</td><td>Bačelić d.o.o.</td><td>18.08.2026</td><td>1.284,40 €</td><td>${pill('Čeka ovjeru','yellow')}</td></tr><tr><td>Narudžbenica N-2026-214</td><td>Demo dobavljač</td><td>18.08.2026</td><td>1.042,00 €</td><td>${pill('Čeka ovjeru','yellow')}</td></tr><tr><td>Putni nalog PN-2026-018</td><td>Interno</td><td>17.08.2026</td><td>286,50 €</td><td>${pill('Čeka ovjeru','yellow')}</td></tr></tbody></table></div>`},
      partneri:{title:'Partneri',html:`<div class="toolbar"><div class="filters"><button class="filter">Kupci</button><button class="filter">Dobavljači</button><button class="filter">Svi</button></div><button class="btn">+ Novi partner</button></div><div class="card table-card"><table><thead><tr><th>Partner</th><th>Vrsta</th><th>OIB</th><th>Kontakt</th><th>Otvoreno</th></tr></thead><tbody><tr><td><b>Demo Investitor d.o.o.</b></td><td>Kupac</td><td>Demo</td><td>info@demo.hr</td><td>57.638,26 €</td></tr><tr><td><b>Bačelić d.o.o.</b></td><td>Dobavljač</td><td>Demo</td><td>prodaja@demo.hr</td><td>3.041,59 €</td></tr><tr><td><b>VERTIV Croatia d.o.o.</b></td><td>Kupac</td><td>Demo</td><td>kontakt@demo.hr</td><td>0,00 €</td></tr></tbody></table></div>`}
    };
    const p=pages[page];if(!p)return;title.textContent=p.title;document.querySelectorAll('[data-view]').forEach(x=>x.classList.remove('active'));content.innerHTML=p.html;
  };
  railButtons.forEach(btn=>{
    const label=(btn.getAttribute('title')||'').toLowerCase();
    btn.addEventListener('click',()=>{
      if(label==='firma')renderRailPage('firma',btn);
      else if(label==='izvještaji')renderRailPage('izvjestaji',btn);
      else if(label==='ovjera')renderRailPage('ovjera',btn);
      else if(label==='partneri')renderRailPage('partneri',btn);
      else if(label==='postavke')renderRailPage('postavke',btn);
    });
  });
});