(function(){
  var VIEW='photoSorter';
  var state={files:[],results:[],busy:false,filter:'ALL',worker:null};
  var rx=/\b(MVS|MV)\s*[-–—_:.]?\s*([0-9O]{1,3})\b/ig;
  function q(id){return document.getElementById(id)}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function moduleFrom(text){
    var found=[],m,s=String(text||'').toUpperCase(); rx.lastIndex=0;
    while((m=rx.exec(s))){
      var n=String(m[2]).replace(/O/g,'0').replace(/\D/g,'');
      if(n){var v=m[1].toUpperCase()+'-'+n.padStart(2,'0');if(found.indexOf(v)<0)found.push(v)}
    }
    return {name:found[0]||'NEOZNAČENE',all:found};
  }
  function load(src,test){
    if(test())return Promise.resolve();
    return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  }
  function counts(){
    var x={};state.results.forEach(function(r){x[r.module]=(x[r.module]||0)+1});
    return Object.keys(x).sort(function(a,b){if(a==='NEOZNAČENE')return 1;if(b==='NEOZNAČENE')return -1;return a.localeCompare(b,undefined,{numeric:true})}).map(function(k){return [k,x[k]]});
  }
  function summary(){
    if(!state.results.length)return '<div class="ps-empty"><b>Još nema sortiranih fotografija.</b><span>Nakon obrade ovdje će se pojaviti folderi.</span></div>';
    var h='<div class="ps-head"><div><h3>Sortirani folderi</h3><small>Ukupno '+state.results.length+' fotografija</small></div><button class="filter ps-filter" data-folder="ALL">Sve</button></div><div class="ps-folders">';
    counts().forEach(function(x){h+='<button class="ps-folder '+(state.filter===x[0]?'active':'')+'" data-folder="'+x[0]+'"><span>▰</span><b>'+x[0]+'</b><strong>'+x[1]+'</strong></button>'});
    return h+'</div>';
  }
  function rows(){
    if(!state.results.length){
      if(!state.files.length)return '';
      var p='<div class="ps-list"><h3>Odabrane fotografije ('+state.files.length+')</h3>';
      state.files.forEach(function(f){p+='<div class="ps-row"><div class="ps-name"><b>'+esc(f.name)+'</b><small>Čeka obradu</small></div><span class="ps-badge wait">Čeka</span></div>'});
      return p+'</div>';
    }
    var arr=state.filter==='ALL'?state.results:state.results.filter(function(r){return r.module===state.filter});
    var h='<div class="ps-list"><h3>Fotografije ('+arr.length+')</h3>';
    arr.forEach(function(r){
      var i=state.results.indexOf(r);
      var note=r.all.length>1?'Više oznaka: '+r.all.join(', '):(r.module==='NEOZNAČENE'?'Oznaka nije pronađena':'Prepoznato');
      h+='<div class="ps-row"><div class="ps-name"><b>'+esc(r.file.name)+'</b><small>'+esc(note)+'</small></div><input class="ps-edit" data-i="'+i+'" value="'+(r.module==='NEOZNAČENE'?'':esc(r.module))+'" placeholder="NEOZNAČENE"><span class="ps-badge '+(r.module==='NEOZNAČENE'?'warn':'ok')+'">'+r.module+'</span></div>';
    });
    return h+'</div>';
  }
  function render(){
    var c=q('content'),t=q('title');if(!c)return;if(t)t.textContent='Sortiranje fotografija';
    c.innerHTML='<div class="ps-hero"><div><small>TASKER / FOTO SORTER</small><h2>Sortiranje fotografija po oznaci modula</h2><p>Dodaj fotografije. Tasker čita oznake poput <b>MV-08</b>, <b>MV - 11</b> i <b>MVS-01</b>. Slike bez prepoznate oznake idu u <b>NEOZNAČENE</b>.</p></div><span class="ps-local">LOKALNA OBRADA</span></div>'+
    '<div class="ps-grid"><div class="card ps-main"><div class="ps-drop" id="psDrop"><input id="psFiles" type="file" accept="image/*,.heic,.heif" multiple hidden><b>Dodaj fotografije</b><p>Na telefonu odaberi slike iz galerije. Na računalu ih možeš i prevući ovdje.</p><button class="btn" id="psPick">Odaberi fotografije</button></div>'+
    '<div class="ps-actions"><button class="btn" id="psStart" '+(!state.files.length?'disabled':'')+'>Prepoznaj i sortiraj</button><button class="btn secondary" id="psZip" '+(!state.results.length?'disabled':'')+'>Preuzmi sortirane foldere (.zip)</button><button class="filter" id="psClear" '+(!state.files.length&&!state.results.length?'disabled':'')+'>Obriši listu</button></div>'+
    '<div class="ps-progress" id="psProgress"></div><div id="psSummary">'+summary()+'</div><div id="psRows">'+rows()+'</div></div>'+
    '<aside class="card ps-help"><h3>Kako radi</h3><ol><li>Odaberi sve fotografije.</li><li>Pokreni prepoznavanje.</li><li>Provjeri oznake i po potrebi ih ispravi.</li><li>Preuzmi ZIP s folderima po modulima.</li></ol><p><b>Originali ostaju netaknuti.</b> Tasker pravi sortiranu kopiju.</p><p>Razumije: MV-08, MV - 08, MV 08, mv-08.</p></aside></div>';
    bind();
  }
  function bind(){
    var inp=q('psFiles'),drop=q('psDrop'),pick=q('psPick');
    if(pick)pick.onclick=function(){inp.click()};
    if(inp)inp.onchange=function(e){add([].slice.call(e.target.files))};
    if(drop){
      drop.ondragover=function(e){e.preventDefault();drop.classList.add('drag')};
      drop.ondragleave=function(){drop.classList.remove('drag')};
      drop.ondrop=function(e){e.preventDefault();drop.classList.remove('drag');add([].slice.call(e.dataTransfer.files))};
    }
    if(q('psStart'))q('psStart').onclick=process;
    if(q('psZip'))q('psZip').onclick=zip;
    if(q('psClear'))q('psClear').onclick=function(){if(!state.busy){state.files=[];state.results=[];state.filter='ALL';render()}};
    document.querySelectorAll('.ps-filter,[data-folder]').forEach(function(b){b.onclick=function(){state.filter=b.getAttribute('data-folder');refresh()}});
    document.querySelectorAll('.ps-edit').forEach(function(i){i.onchange=function(){fix(Number(i.getAttribute('data-i')),i.value)}});
  }
  function refresh(){if(q('psSummary'))q('psSummary').innerHTML=summary();if(q('psRows'))q('psRows').innerHTML=rows();bind()}
  function add(files){
    files.filter(function(f){return f.type.indexOf('image/')===0||/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name)}).forEach(function(f){state.files.push(f)});
    state.results=[];state.filter='ALL';render();
  }
  function fix(i,v){
    var r=state.results[i];if(!r)return;v=String(v||'').trim().toUpperCase();
    if(!v){r.module='NEOZNAČENE';r.all=[]}else{var d=moduleFrom(v);r.module=d.name==='NEOZNAČENE'?v.replace(/\s+/g,'-'):d.name;r.all=[r.module]}
    refresh();
  }
  function progress(txt){var p=q('psProgress');if(p)p.textContent=txt}
  async function process(){
    if(state.busy||!state.files.length)return;state.busy=true;state.results=[];render();
    try{
      progress('Učitavam OCR...');
      await load('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',function(){return !!window.Tesseract});
      state.worker=await Tesseract.createWorker('eng');
      await state.worker.setParameters({tessedit_pageseg_mode:'11',preserve_interword_spaces:'1'});
      for(var i=0;i<state.files.length;i++){
        progress('Čitam fotografiju '+(i+1)+' od '+state.files.length+'...');
        var text='';try{var o=await state.worker.recognize(state.files[i]);text=o.data.text||''}catch(e){}
        var d=moduleFrom(text);state.results.push({file:state.files[i],module:d.name,all:d.all,text:text});refresh();
      }
      await state.worker.terminate();state.worker=null;progress('Sortiranje završeno: '+state.results.length+' fotografija.');
    }catch(e){console.error(e);alert('OCR se nije mogao pokrenuti. Provjeri internetsku vezu i pokušaj ponovno.')}
    state.busy=false;render();
  }
  function unique(folder,name){
    folder._names=folder._names||{};var n=name,k=n.toLowerCase(),i=2,d=n.lastIndexOf('.'),a=d>0?n.slice(0,d):n,b=d>0?n.slice(d):'';
    while(folder._names[k]){n=a+' ('+(i++)+')'+b;k=n.toLowerCase()}folder._names[k]=1;return n;
  }
  async function zip(){
    if(!state.results.length)return;
    var b=q('psZip');if(b){b.disabled=true;b.textContent='Pripremam ZIP...'}
    try{
      await load('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',function(){return !!window.JSZip});
      var z=new JSZip(),folders={};
      state.results.forEach(function(r){var n=r.module||'NEOZNAČENE';folders[n]=folders[n]||z.folder(n);folders[n].file(unique(folders[n],r.file.name),r.file)});
      var blob=await z.generateAsync({type:'blob',compression:'STORE'});
      var a=document.createElement('a'),u=URL.createObjectURL(blob),d=new Date();
      a.href=u;a.download='Tasker-fotografije-'+d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},60000);
    }catch(e){console.error(e);alert('ZIP se nije mogao napraviti. Pokušaj s manjim brojem fotografija.')}
    if(b){b.disabled=false;b.textContent='Preuzmi sortirane foldere (.zip)'}
  }
  var old=window.show;
  window.show=function(v){if(v===VIEW){document.querySelectorAll('[data-view]').forEach(function(x){x.classList.toggle('active',x.dataset.view===VIEW)});render();window.scrollTo(0,0);return}return typeof old==='function'?old(v):undefined};
  document.addEventListener('click',function(e){var b=e.target.closest('[data-view="photoSorter"]');if(b){e.preventDefault();setTimeout(function(){window.show(VIEW)},0)}});
})();