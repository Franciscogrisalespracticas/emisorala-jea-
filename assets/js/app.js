(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const json=(k,f=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const fmtDate=s=>new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${s}T12:00:00`));
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const fetchJSON=async u=>{const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error(`${u}: ${r.status}`); return r.json();};
  const data={};
  const state={municipality:localStorage.getItem('lajefa_municipality')||'Pereira', day:((new Date().getDay()+6)%7), currentAudio:null, sourceType:null, usingFallback:false, searchIndex:-1};
  const audio=$('#radioAudio'); audio.volume=.78;

  async function init(){
    try{
      const [municipalities,news,audioData,programs,podcasts,events,voices]=await Promise.all([
        'municipalities','news','audio','programs','podcasts','events','voices'
      ].map(x=>fetchJSON(`data/${x}.json`)));
      Object.assign(data,{municipalities,news,audio:audioData,programs,podcasts,events,voices});
    }catch(err){console.error(err); document.body.insertAdjacentHTML('afterbegin','<div class="load-error">No se pudieron cargar los datos. Abre el sitio mediante ABRIR_LA_JEFA.bat o un servidor local.</div>'); return;}
    if(!data.municipalities.some(m=>m.name===state.municipality)) state.municipality='Pereira';
    bindStatic(); renderAll(); setPlayerForMunicipality(state.municipality,false);
  }

  function municipality(name=state.municipality){return data.municipalities.find(m=>m.name===name)||data.municipalities[0]}
  function music(name=state.municipality){return data.audio.find(a=>a.municipality===name)||data.audio[0]}
  function mergeData(base,key){const map=new Map(base.map(x=>[String(x.id),{...x}]));json(key).forEach(x=>{if(x.deleted)map.delete(String(x.id));else map.set(String(x.id),{...(map.get(String(x.id))||{}),...x})});return [...map.values()]}
  function allNews(){return mergeData(data.news,'lajefa_news_custom').filter(x=>x.status!=='archived')}
  function allPrograms(){return mergeData(data.programs,'lajefa_programs_custom')}
  function allEvents(){return mergeData(data.events,'lajefa_events_custom')}
  function allVoices(){return mergeData(data.voices,'lajefa_voices_custom')}
  function verifiedSignal(name){return json('lajefa_signals').find(x=>x.municipality===name&&x.enabled&&x.verified&&x.primaryUrl)}

  const bars=(count=46)=>Array.from({length:count},(_,i)=>`<i style="--i:${i};--h:${18+((i*17)%62)}%"></i>`).join('');
  $$('.waveform').forEach(el=>el.innerHTML=bars(54)); $$('.mini-wave').forEach(el=>el.innerHTML=bars(24));

  function setPlaying(on){$$('.play-symbol').forEach(x=>x.textContent=on?'Ⅱ':'▶'); document.body.classList.toggle('audio-playing',on)}
  async function canUseLocal(path){try{const r=await fetch(path,{method:'HEAD',cache:'no-store'}); return r.ok}catch{return false}}
  async function setPlayerForMunicipality(name,autoplay=true){
    const sig=verifiedSignal(name), a=music(name); state.usingFallback=false; audio.pause(); audio.loop=true;
    if(sig){state.sourceType='stream';state.currentAudio={title:'La Jefa 91.1',artist:'Transmisión verificada',municipality:name,sourceUrl:sig.primaryUrl,license:'Señal configurada por el equipo editorial'};audio.dataset.remote=sig.primaryUrl;audio.dataset.backup=sig.backupUrl||'';audio.dataset.fallback=a.fallback;audio.dataset.local='';audio.src=sig.primaryUrl;audio.load();}
    else{state.sourceType='music';state.currentAudio={...a,municipality:name};audio.dataset.remote=a.url;audio.dataset.backup='';audio.dataset.fallback=a.fallback;audio.dataset.local=a.localCache||'';const local=a.localCache && await canUseLocal(a.localCache);audio.src=local?a.localCache:a.url;audio.load();}
    updatePlayerUI(); updateMediaSession(); if(autoplay){try{await audio.play()}catch(e){console.warn('play',e)}}
  }
  async function playPodcast(p){state.sourceType='podcast'; state.currentAudio={title:p.title,artist:'La Jefa 91.1',municipality:p.municipality,sourceUrl:'credits.html',license:'Boletín original basado en fuentes citadas',localCache:p.audio}; state.usingFallback=false; audio.pause(); audio.loop=false; audio.removeAttribute('data-remote'); audio.removeAttribute('data-fallback'); audio.src=p.audio; audio.load(); updatePlayerUI(); updateMediaSession(); try{await audio.play()}catch(e){console.warn(e)}}
  async function toggleSelected(){if(!audio.src) await setPlayerForMunicipality(state.municipality,false); if(audio.paused){try{await audio.play()}catch(e){console.warn(e)}} else audio.pause()}
  async function playNeighbor(delta){
    if(state.sourceType==='podcast'){
      const i=Math.max(0,data.podcasts.findIndex(p=>p.title===state.currentAudio?.title));
      const next=data.podcasts[(i+delta+data.podcasts.length)%data.podcasts.length];if(next)await playPodcast(next);return;
    }
    const i=Math.max(0,data.audio.findIndex(a=>a.municipality===(state.currentAudio?.municipality||state.municipality)));
    const next=data.audio[(i+delta+data.audio.length)%data.audio.length];if(next){state.municipality=next.municipality;localStorage.setItem('lajefa_municipality',next.municipality);renderMunicipalities();renderRegional();renderNews();renderMap();await setPlayerForMunicipality(next.municipality,true)}
  }
  audio.addEventListener('play',()=>setPlaying(true)); audio.addEventListener('pause',()=>setPlaying(false));
  audio.addEventListener('ended',()=>{if(state.sourceType==='music'){audio.currentTime=0; audio.play().catch(()=>{})}else setPlaying(false)});
  audio.addEventListener('error',()=>{if(state.sourceType==='stream'&&audio.dataset.backup&&!state.usingFallback){state.usingFallback=true;audio.src=audio.dataset.backup;audio.load();updatePlayerUI();audio.play().catch(()=>{});return}if((state.sourceType==='music'||state.sourceType==='stream')&&audio.dataset.fallback){state.sourceType='music';state.currentAudio={...music(state.currentAudio?.municipality||state.municipality),municipality:state.currentAudio?.municipality||state.municipality};state.usingFallback=true;audio.src=audio.dataset.fallback;audio.loop=true;audio.load();updatePlayerUI();audio.play().catch(()=>{})}});
  audio.addEventListener('timeupdate',()=>{
    if(state.sourceType==='music' && audio.currentTime>=60){
      audio.currentTime=0;
    }
    updatePlayerModalProgress();
  });

  function updatePlayerUI(){
    const c=state.currentAudio||music(state.municipality); const mun=c.municipality||state.municipality;
    $('#playerMode').textContent=state.sourceType==='podcast'?'PODCAST':state.sourceType==='stream'?'EN VIVO':'SELECCIÓN';
    $('#playerSubtitle').textContent=`${c.title||'Selección musical'} · ${mun}${state.usingFallback?' · respaldo local':''}`;
    $('#heroMunicipality').textContent=state.sourceType==='stream'?`${state.municipality} · transmisión verificada`:`${state.municipality} · ${music(state.municipality).title}`; const heroLabel=document.querySelector('.hero-player-meta b');if(heroLabel)heroLabel.textContent=state.sourceType==='stream'?'EN VIVO':'SELECCIÓN LA JEFA';
    if($('#playerModal').open) renderPlayerModal();
  }
  function updateMediaSession(){if(!('mediaSession' in navigator)||!state.currentAudio)return; const m=municipality(state.currentAudio.municipality); navigator.mediaSession.metadata=new MediaMetadata({title:state.currentAudio.title,artist:state.currentAudio.artist||'La Jefa 91.1',album:state.currentAudio.municipality||'Risaralda',artwork:[{src:m.image,sizes:'512x512'}]});}

  function bindStatic(){
    $$('[data-play-selected]').forEach(b=>b.addEventListener('click',toggleSelected));
    $('#volumeSlider').addEventListener('input',e=>{audio.volume=+e.target.value;audio.muted=false;$('#muteBtn').textContent='🔊'});
    $('#muteBtn').addEventListener('click',()=>{audio.muted=!audio.muted;$('#muteBtn').textContent=audio.muted?'🔇':'🔊'});
    $('#playerExpand').addEventListener('click',()=>{renderPlayerModal();$('#playerModal').showModal()});
    $('#prevTrack').addEventListener('click',()=>playNeighbor(-1));
    $('#nextTrack').addEventListener('click',()=>playNeighbor(1));
    $('#listenMunicipality').addEventListener('click',()=>setPlayerForMunicipality(state.municipality,true));
    $('#mapListen').addEventListener('click',()=>setPlayerForMunicipality(state.municipality,true));
    $('#mapExplore').addEventListener('click',()=>$('#regionalFocus').scrollIntoView({behavior:'smooth'}));
    $('#openMunicipalityNews').addEventListener('click',()=>$('#noticiasGrid').scrollIntoView({behavior:'smooth'}));
    $('#openMunicipalities').addEventListener('click',()=>$('#municipalityModal').showModal());
    $('#searchOpen').addEventListener('click',()=>{$('#searchModal').showModal(); setTimeout(()=>$('#searchInput').focus(),20)});
    $('#podcastArchiveBtn').addEventListener('click',openPodcastArchive);
    $('#calendarBtn').addEventListener('click',openCalendar);
    $('#greetingBtn').addEventListener('click',()=>openCommunity('greeting'));
    $('#pollBtn').addEventListener('click',()=>openCommunity('poll'));
    $('#featuredNewsOpen').addEventListener('click',()=>{const id=$('#featuredNewsOpen').dataset.newsId;if(id)openNews(id)});

    const drawer=$('#menuDrawer'),scrim=$('#scrim');
    const openDrawer=()=>{drawer.classList.add('open');scrim.classList.add('show');drawer.setAttribute('aria-hidden','false')};
    const closeDrawer=()=>{drawer.classList.remove('open');scrim.classList.remove('show');drawer.setAttribute('aria-hidden','true')};
    $('#menuOpen').addEventListener('click',openDrawer); $('#mobileMore').addEventListener('click',openDrawer); $('[data-close-drawer]').addEventListener('click',closeDrawer); scrim.addEventListener('click',closeDrawer); $$('.drawer a').forEach(a=>a.addEventListener('click',closeDrawer));
    $$('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close())); $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
    bindSearch();
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('.desktop-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`))}),{rootMargin:'-35% 0px -60%'}); ['inicio','emisoras','noticias','programacion','podcasts','eventos'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el)});
    if('mediaSession' in navigator){navigator.mediaSession.setActionHandler('play',toggleSelected);navigator.mediaSession.setActionHandler('pause',()=>audio.pause())}
  }

  function renderAll(){renderMunicipalities();renderRegional();renderNews();renderSchedule();renderVoices();renderMap();renderPodcasts();renderEvents()}
  function renderMunicipalities(){
    const featured=['Pereira','Dosquebradas','Santa Rosa de Cabal','La Virginia','La Celia'];
    $('#municipalityChips').innerHTML=featured.map(m=>`<button class="municipality-chip ${m===state.municipality?'active':''}" data-municipality="${esc(m)}"><span>⌖</span>${esc(m==='Santa Rosa de Cabal'?'Santa Rosa':m)}</button>`).join('');
    $('#municipalityModalGrid').innerHTML=data.municipalities.map(m=>`<button class="municipality-option ${m.name===state.municipality?'active':''}" data-municipality="${esc(m.name)}"><b>${esc(m.name)}</b><small>${esc(m.featuredPlace)}</small><span>Explorar →</span></button>`).join('');
    $$('[data-municipality]').forEach(b=>b.addEventListener('click',()=>selectMunicipality(b.dataset.municipality)));
  }
  function selectMunicipality(name){state.municipality=name;localStorage.setItem('lajefa_municipality',name);renderMunicipalities();renderRegional();renderNews();renderMap();document.querySelectorAll('dialog[open]').forEach(d=>d.close())}
  function setSmartImage(img,m){img.src=m.localImage;img.dataset.remote=m.image;img.onerror=()=>{if(img.src!==m.image){img.onerror=()=>{img.onerror=null;img.src='assets/img/hero-master.jpg'};img.src=m.image}}}
  function renderRegional(){const m=municipality(); $('#municipalityBadge').textContent=m.name.toUpperCase();$('#municipalityTitle').textContent=m.name;$('#municipalityIntro').textContent=m.accent;$('#listenMunicipality').textContent=`Escuchar ${m.name}`; setSmartImage($('#municipalityPhoto'),m);$('#municipalityPhotoCredit').href=m.imageSource;$('#municipalityPhotoCredit').textContent=`Foto: ${m.imageCredit}`;$('#mapMunicipality').textContent=m.name;$('#mapCoverage').textContent=m.featuredPlace;$('#newsFilterLabel').textContent=m.name;$('#heroMunicipality').textContent=`${m.name} · ${music(m.name).title}`}

  function renderNews(){
    const m=municipality(), list=allNews().filter(n=>n.municipality===m.name); const first=list[0]||allNews()[0];
    if(first){$('#featuredNewsTitle').textContent=first.title;$('#featuredNewsText').textContent=first.summary;$('#featuredNewsCategory').textContent=first.category.toUpperCase();$('#featuredNewsOpen').dataset.newsId=first.id;setSmartImage($('#featuredNewsImage'),municipality(first.municipality));}
    $('#newsGrid').innerHTML=(list.length?list:allNews().slice(0,6)).map(n=>{const mm=municipality(n.municipality);return `<article class="news-card"><button class="news-card-media clickable-media" data-news-id="${esc(n.id)}"><img src="${esc(mm.localImage)}" data-remote="${esc(mm.image)}" alt="${esc(n.municipality)}"><span>${esc(n.category)}</span></button><div><small>${esc(n.municipality)} · ${fmtDate(n.publishedAt)}</small><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><button class="text-link" data-news-id="${esc(n.id)}">Leer noticia →</button></div></article>`}).join('');
    $$('#newsGrid img[data-remote]').forEach(img=>img.onerror=()=>{img.onerror=null;img.src=img.dataset.remote}); $$('[data-news-id]').forEach(b=>b.addEventListener('click',()=>openNews(b.dataset.newsId)));
  }
  function findNews(id){return allNews().find(n=>String(n.id)===String(id))}
  function openNews(id){const n=findNews(id);if(!n)return;const m=municipality(n.municipality);$('#contentModalBody').innerHTML=`<article class="article-modal"><img id="modalNewsImage" src="${esc(m.localImage)}" data-remote="${esc(m.image)}" alt="${esc(n.municipality)}"><span class="modal-kicker">${esc(n.category)} · ${esc(n.municipality)}</span><h2>${esc(n.title)}</h2><p class="article-date">${fmtDate(n.publishedAt)} · Fuente: ${esc(n.sourceName)}</p><p>${esc(n.summary)}</p><p>Este portal ofrece un resumen original del hecho y conserva el enlace a la publicación de referencia para ampliar la información.</p><div class="modal-actions"><a class="primary-btn button-link" href="${esc(n.sourceUrl)}" target="_blank" rel="noopener">Consultar fuente original ↗</a><button class="secondary-btn" id="shareContent">Compartir</button></div></article>`;const im=$('#modalNewsImage');im.onerror=()=>{im.onerror=null;im.src=im.dataset.remote};$('#contentModal').showModal();$('#shareContent').addEventListener('click',()=>share(n.title,n.sourceUrl));}

  function renderSchedule(){
    const list=allPrograms().filter(p=>+p.day===state.day); const today=((new Date().getDay()+6)%7); const min=allPrograms().filter(p=>+p.day===today).slice(0,3);
    $('#scheduleMini').innerHTML=min.map((p,i)=>`<button class="schedule-item ${i===0?'current':''}" data-program-id="${esc(p.id)}"><time>${esc(p.start)}</time><div><b>${esc(p.name)}</b><small>${esc(p.description)}</small></div><span>${i===0?'◉':'♫'}</span></button>`).join('');
    const labels=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']; $('#dayTabs').innerHTML=labels.map((d,i)=>`<button class="day-tab ${i===state.day?'active':''}" data-day="${i}">${d}</button>`).join('');
    $('#fullSchedule').innerHTML=list.map((p,i)=>`<button class="full-schedule-row ${i===0?'live':''}" data-program-id="${esc(p.id)}"><time>${esc(p.start)}–${esc(p.end)}</time><div><b>${esc(p.name)}</b><span>${esc(p.description)}</span></div><em>${esc(p.category)}</em></button>`).join('');
    $$('.day-tab').forEach(b=>b.addEventListener('click',()=>{state.day=+b.dataset.day;renderSchedule()})); $$('[data-program-id]').forEach(b=>b.addEventListener('click',()=>openProgram(b.dataset.programId)));
  }
  function openProgram(id){const p=allPrograms().find(x=>String(x.id)===String(id));if(!p)return;$('#contentModalBody').innerHTML=`<span class="modal-kicker">${esc(p.dayLabel||'PROGRAMACIÓN')} · ${esc(p.category)}</span><h2>${esc(p.name)}</h2><p><b>${esc(p.start)}–${esc(p.end)}</b></p><p>${esc(p.description)}</p><p>Para esta experiencia el espacio se enlaza con una selección musical abierta asociada a ${esc(p.audioMunicipality||state.municipality)}.</p><button class="primary-btn" id="programListen">Escuchar contenido asociado</button>`;$('#contentModal').showModal();$('#programListen').addEventListener('click',()=>{setPlayerForMunicipality(p.audioMunicipality||state.municipality,true);$('#contentModal').close()})}

  function renderVoices(){const list=allVoices(),card=v=>`<button class="voice-card" data-voice-id="${v.id}"><span>${v.icon}</span><b>${esc(v.title)}</b><small>${esc(v.program)}</small></button>`;$('#voicesMini').innerHTML=list.map(card).join('');$('#voicesDetailGrid').innerHTML=list.map(v=>`<article class="host-detail voice-detail"><div class="voice-art">${v.icon}</div><div><small>${esc(v.program)}</small><h3>${esc(v.title)}</h3><p>${esc(v.description)}</p><span>${esc(v.schedule)}</span><button class="text-link" data-voice-id="${v.id}">Abrir espacio →</button></div></article>`).join('');$$('[data-voice-id]').forEach(b=>b.addEventListener('click',()=>openVoice(b.dataset.voiceId)))}
  function openVoice(id){const v=allVoices().find(x=>x.id===id);if(!v)return;const p=allPrograms().find(x=>x.name===v.program)||allPrograms()[0];$('#contentModalBody').innerHTML=`<div class="voice-modal"><div class="voice-art large">${v.icon}</div><span class="modal-kicker">PROGRAMAS Y VOCES</span><h2>${esc(v.title)}</h2><b>${esc(v.program)} · ${esc(v.schedule)}</b><p>${esc(v.description)}</p><button class="primary-btn" id="voiceListen">Escuchar contenido asociado</button></div>`;$('#contentModal').showModal();$('#voiceListen').addEventListener('click',()=>{setPlayerForMunicipality(p.audioMunicipality||state.municipality,true);$('#contentModal').close()})}

  function renderMap(){const pos=[[62,25],[38,31],[72,40],[30,52],[53,58],[82,61],[18,66],[43,72],[67,76],[88,33],[24,80],[55,88],[76,87],[37,91]];$('#regionMap').innerHTML=data.municipalities.map((m,i)=>`<button style="--x:${pos[i][0]}%;--y:${pos[i][1]}%" class="map-point ${m.name===state.municipality?'active':''}" data-municipality="${esc(m.name)}" title="${esc(m.name)}"><i></i><span>${esc(m.name)}</span></button>`).join('');$$('.map-point').forEach(b=>b.addEventListener('click',()=>selectMunicipality(b.dataset.municipality)))}

  function renderPodcasts(){
    $('#podcastGrid').innerHTML=data.podcasts.map(p=>`<article class="podcast-card"><div class="podcast-cover"><span>91.1</span><i>▶</i></div><small>${esc(p.municipality)}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><b>${fmtDate(p.date)}</b><button class="podcast-play" data-podcast-id="${p.id}">Escuchar boletín</button></article>`).join('');$$('[data-podcast-id]').forEach(b=>b.addEventListener('click',()=>{const p=data.podcasts.find(x=>x.id===b.dataset.podcastId);if(p)playPodcast(p)}));
  }
  function openPodcastArchive(){
    $('#podcastArchiveContent').innerHTML=`<span class="modal-kicker">ARCHIVO DE AUDIO</span><h2>Podcasts y boletines</h2><div class="archive-filters"><input id="podcastSearch" placeholder="Buscar episodio"><select id="podcastMunicipality"><option value="">Todos los municipios</option>${data.municipalities.map(m=>`<option>${esc(m.name)}</option>`).join('')}</select></div><div id="podcastArchiveList" class="archive-list"></div>`;$('#podcastArchiveModal').showModal();const render=()=>{const q=$('#podcastSearch').value.toLowerCase(),m=$('#podcastMunicipality').value;const list=data.podcasts.filter(p=>(!q||(p.title+p.description).toLowerCase().includes(q))&&(!m||p.municipality===m));$('#podcastArchiveList').innerHTML=list.map(p=>`<button data-archive-podcast="${p.id}"><span><b>${esc(p.title)}</b><small>${esc(p.municipality)} · ${fmtDate(p.date)}</small></span><em>▶</em></button>`).join('');$$('[data-archive-podcast]').forEach(b=>b.addEventListener('click',()=>playPodcast(data.podcasts.find(p=>p.id===b.dataset.archivePodcast))))};$('#podcastSearch').addEventListener('input',render);$('#podcastMunicipality').addEventListener('change',render);render();
  }

  function renderEvents(){const list=allEvents();$('#eventGrid').innerHTML=list.map(e=>`<article class="event-card"><time>${new Date(`${e.start}T12:00:00`).toLocaleDateString('es-CO',{day:'2-digit',month:'short'}).toUpperCase()}</time><div><small>${esc(e.municipality)}</small><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p><button class="text-link" data-event-id="${esc(e.id)}">Ver detalles →</button></div></article>`).join('');$$('[data-event-id]').forEach(b=>b.addEventListener('click',()=>openEvent(b.dataset.eventId)))}
  function openEvent(id){const e=allEvents().find(x=>String(x.id)===String(id));if(!e)return;$('#contentModalBody').innerHTML=`<span class="modal-kicker">AGENDA · ${esc(e.municipality)}</span><h2>${esc(e.title)}</h2><p><b>${fmtDate(e.start)}${e.end&&e.end!==e.start?` – ${fmtDate(e.end)}`:''}</b></p><p>${esc(e.description)}</p><p>${esc(e.venue||e.municipality)}</p><div class="modal-actions">${e.sourceUrl?`<a class="primary-btn button-link" href="${esc(e.sourceUrl)}" target="_blank" rel="noopener">Fuente / organizador ↗</a>`:''}<button class="secondary-btn" id="addCalendar">Agregar al calendario</button></div>`;$('#contentModal').showModal();$('#addCalendar').addEventListener('click',()=>downloadICS(e))}
  function openCalendar(){const y=2026,m=10,days=new Date(y,m+1,0).getDate(),first=(new Date(y,m,1).getDay()+6)%7, events=allEvents();let cells=''.padStart(first,' ').split('').map(()=>'<span class="calendar-empty"></span>').join('');for(let d=1;d<=days;d++){const iso=`2026-11-${String(d).padStart(2,'0')}`,has=events.filter(e=>e.start<=iso&&(e.end||e.start)>=iso);cells+=`<button class="calendar-day ${has.length?'has-event':''}" data-calendar-date="${iso}"><b>${d}</b>${has.slice(0,2).map(e=>`<small>${esc(e.title)}</small>`).join('')}</button>`}$('#calendarContent').innerHTML=`<span class="modal-kicker">AGENDA REGIONAL</span><h2>Noviembre 2026</h2><div class="calendar-week"><b>Lun</b><b>Mar</b><b>Mié</b><b>Jue</b><b>Vie</b><b>Sáb</b><b>Dom</b></div><div class="calendar-grid">${cells}</div><div id="calendarDetail"></div>`;$('#calendarModal').showModal();$$('[data-calendar-date]').forEach(b=>b.addEventListener('click',()=>{const list=events.filter(e=>e.start<=b.dataset.calendarDate&&(e.end||e.start)>=b.dataset.calendarDate);$('#calendarDetail').innerHTML=list.length?list.map(e=>`<button data-event-id="${e.id}"><b>${esc(e.title)}</b><small>${esc(e.municipality)}</small></button>`).join(''):'<p>Sin eventos registrados para esta fecha.</p>';$$('#calendarDetail [data-event-id]').forEach(x=>x.addEventListener('click',()=>{openEvent(x.dataset.eventId);$('#calendarModal').close()}))}))}

  function openCommunity(type){
    if(type==='greeting'){$('#communityModalContent').innerHTML=`<span class="modal-kicker">PARTICIPACIÓN</span><h2>Enviar saludo</h2><p>Tu saludo quedará pendiente de moderación editorial antes de ser considerado para emisión.</p><form id="greetingForm" class="interaction-form"><label>Nombre<input name="name" required maxlength="60"></label><label>Municipio<select name="municipality">${data.municipalities.map(m=>`<option>${esc(m.name)}</option>`).join('')}</select></label><label>Mensaje<textarea name="message" required maxlength="240"></textarea></label><button class="primary-btn">Guardar para moderación</button></form><div id="communityFeedback"></div>`;$('#communityModal').showModal();$('#greetingForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),list=json('lajefa_greetings');list.unshift({id:`g-${Date.now()}`,name:f.get('name'),municipality:f.get('municipality'),message:f.get('message'),date:new Date().toISOString(),status:'pendiente'});save('lajefa_greetings',list);$('#communityFeedback').innerHTML='<p class="success-message">Saludo guardado para moderación.</p>';e.currentTarget.reset()})}
    else{const cfg=json('lajefa_poll_config',{id:'regional-2026-11',question:'¿Qué contenido regional quieres escuchar más?',options:['Noticias locales','Música','Entrevistas','Eventos'],active:true});if(!cfg.active){$('#communityModalContent').innerHTML='<span class="modal-kicker">ENCUESTA</span><h2>Participación</h2><p>No hay una encuesta activa en este momento.</p>';$('#communityModal').showModal();return}const key=cfg.id||'regional-2026-11',options=cfg.options||[],votes=json('lajefa_poll_votes',{}),voted=localStorage.getItem(`lajefa_poll_voted_${key}`);const result=()=>{const total=options.reduce((s,o)=>s+(votes[o]||0),0)||1;return options.map(o=>`<div class="poll-result"><span>${esc(o)}</span><b>${Math.round((votes[o]||0)*100/total)}%</b><i style="--w:${(votes[o]||0)*100/total}%"></i></div>`).join('')};$('#communityModalContent').innerHTML=`<span class="modal-kicker">ENCUESTA</span><h2>${esc(cfg.question)}</h2>${voted?`<p>Tu voto: <b>${esc(voted)}</b></p><div>${result()}</div>`:`<div class="poll-options">${options.map(o=>`<button data-poll-option="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="pollResults"></div>`}`;$('#communityModal').showModal();$$('[data-poll-option]').forEach(b=>b.addEventListener('click',()=>{const o=b.dataset.pollOption;votes[o]=(votes[o]||0)+1;save('lajefa_poll_votes',votes);localStorage.setItem(`lajefa_poll_voted_${key}`,o);$('#pollResults').innerHTML=`<p class="success-message">Voto registrado.</p>${result()}`;$$('[data-poll-option]').forEach(x=>x.disabled=true)}))}
  }

  function bindSearch(){const input=$('#searchInput'); const draw=()=>{const q=input.value.trim().toLowerCase();state.searchIndex=-1;if(!q){$('#searchResults').innerHTML='';return}const rows=[...data.municipalities.map(x=>({type:'Municipio',id:x.name,title:x.name,sub:x.featuredPlace})),...allNews().map(x=>({type:'Noticia',id:x.id,title:x.title,sub:x.municipality})),...allPrograms().map(x=>({type:'Programa',id:x.id,title:x.name,sub:x.dayLabel||''})),...data.podcasts.map(x=>({type:'Podcast',id:x.id,title:x.title,sub:x.municipality})),...allEvents().map(x=>({type:'Evento',id:x.id,title:x.title,sub:x.municipality}))].filter(x=>(x.title+' '+x.sub).toLowerCase().includes(q)).slice(0,10);$('#searchResults').innerHTML=rows.length?rows.map((x,i)=>`<button data-search-index="${i}" data-search-type="${x.type}" data-search-id="${esc(x.id)}"><small>${x.type} · ${esc(x.sub)}</small><b>${esc(x.title)}</b></button>`).join(''):'<p>Sin resultados.</p>';$$('[data-search-index]').forEach(b=>b.addEventListener('click',()=>activateSearch(b)))};input.addEventListener('input',draw);input.addEventListener('keydown',e=>{const items=$$('[data-search-index]');if(!items.length)return;if(e.key==='ArrowDown'){e.preventDefault();state.searchIndex=(state.searchIndex+1)%items.length}else if(e.key==='ArrowUp'){e.preventDefault();state.searchIndex=(state.searchIndex-1+items.length)%items.length}else if(e.key==='Enter'&&state.searchIndex>=0){e.preventDefault();activateSearch(items[state.searchIndex])}else if(e.key==='Escape'){$('#searchModal').close();return}else return;items.forEach((x,i)=>x.classList.toggle('active',i===state.searchIndex));items[state.searchIndex]?.scrollIntoView({block:'nearest'})})}
  function activateSearch(b){const t=b.dataset.searchType,id=b.dataset.searchId;$('#searchModal').close();if(t==='Municipio'){selectMunicipality(id);$('#regionalFocus').scrollIntoView({behavior:'smooth'})}else if(t==='Noticia')openNews(id);else if(t==='Programa')openProgram(id);else if(t==='Podcast'){const p=data.podcasts.find(x=>x.id===id);if(p)playPodcast(p)}else if(t==='Evento')openEvent(id)}

  function renderPlayerModal(){const c=state.currentAudio||music(state.municipality),m=municipality(c.municipality||state.municipality);$('#playerModalContent').innerHTML=`<div class="expanded-player"><img src="${esc(m.localImage)}" data-remote="${esc(m.image)}" alt="${esc(m.name)}"><span class="modal-kicker">${state.sourceType==='podcast'?'PODCAST':'SELECCIÓN MUSICAL'}</span><h2>${esc(c.title||'Selección La Jefa')}</h2><p>${esc(c.artist||'La Jefa 91.1')} · ${esc(c.municipality||state.municipality)}</p><div class="player-progress"><span id="playerCurrent">0:00</span><input id="playerSeek" type="range" min="0" max="100" value="0"><span id="playerDuration">0:00</span></div><div class="modal-actions"><button class="secondary-btn" id="modalPrev">Anterior</button><button class="primary-btn" id="modalPlay">${audio.paused?'Reproducir':'Pausar'}</button><button class="secondary-btn" id="modalNext">Siguiente</button><button class="secondary-btn" id="modalShare">Compartir</button></div>${c.sourceUrl?`<p class="license-note">Fuente/licencia: <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">${esc(c.license||'Consultar fuente')} ↗</a></p>`:''}<h3>Selecciones por municipio</h3><div class="player-playlist">${data.audio.slice(0,8).map(a=>`<button data-player-municipality="${esc(a.municipality)}"><span>${esc(a.municipality)}</span><b>${esc(a.title)}</b></button>`).join('')}</div></div>`;const img=$('#playerModalContent img[data-remote]');if(img)img.onerror=()=>{img.onerror=null;img.src=img.dataset.remote};$('#modalPlay')?.addEventListener('click',toggleSelected);$('#modalPrev')?.addEventListener('click',()=>playNeighbor(-1));$('#modalNext')?.addEventListener('click',()=>playNeighbor(1));$('#modalShare')?.addEventListener('click',()=>share(c.title||'La Jefa 91.1',location.href));$$('[data-player-municipality]').forEach(b=>b.addEventListener('click',()=>setPlayerForMunicipality(b.dataset.playerMunicipality,true)));$('#playerSeek')?.addEventListener('input',e=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=(+e.target.value/100)*audio.duration});updatePlayerModalProgress()}
  function updatePlayerModalProgress(){if(!$('#playerModal').open)return;const f=s=>{if(!Number.isFinite(s))return'0:00';const m=Math.floor(s/60),sec=Math.floor(s%60);return`${m}:${String(sec).padStart(2,'0')}`};$('#playerCurrent')&&($('#playerCurrent').textContent=f(audio.currentTime));$('#playerDuration')&&($('#playerDuration').textContent=f(audio.duration));$('#playerSeek')&&($('#playerSeek').value=audio.duration?audio.currentTime/audio.duration*100:0)}

  async function share(title,url){if(navigator.share){try{await navigator.share({title,url});return}catch{}}try{await navigator.clipboard.writeText(url);toast('Enlace copiado')}catch{toast(url)}}
  function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
  function downloadICS(e){const d=s=>s.replace(/-/g,'');const content=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:${d(e.start)}\nDTEND;VALUE=DATE:${d(e.end||e.start)}\nSUMMARY:${e.title}\nLOCATION:${e.venue||e.municipality}\nDESCRIPTION:${e.description}\nEND:VEVENT\nEND:VCALENDAR`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:'text/calendar'}));a.download=`${slug(e.title)}.ics`;a.click();URL.revokeObjectURL(a.href)}

  const rerenderExternal=()=>{renderNews();renderSchedule();renderVoices();renderEvents();updatePlayerUI()};window.addEventListener('storage',rerenderExternal);window.addEventListener('lajefa-data-change',rerenderExternal);
  init();
})();
