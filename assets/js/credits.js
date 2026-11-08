(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data={}; let type='images';
  async function load(){try{[data.municipalities,data.audio,data.news]=await Promise.all(['municipalities','audio','news'].map(async n=>{const r=await fetch(`data/${n}.json`,{cache:'no-store'});if(!r.ok)throw new Error(n);return r.json()}));bind();render()}catch(e){$('#creditsList').innerHTML='<p>No se pudieron cargar los créditos. Abre el proyecto mediante el servidor local incluido.</p>'}}
  function bind(){$$('#creditsTabs button').forEach(b=>b.addEventListener('click',()=>{$$('#creditsTabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');type=b.dataset.creditType;render()}))}
  function row(k,title,sub,url,license='Fuente consultada'){return `<article class="credit-row"><b>${esc(k)}</b><div><strong>${esc(title)}</strong><small>${esc(sub)}</small><a href="${esc(url)}" target="_blank" rel="noopener">Consultar fuente ↗</a></div><span class="credit-license">${esc(license)}</span></article>`}
  function render(){if(type==='images')$('#creditsList').innerHTML=data.municipalities.map(m=>row(m.name,m.featuredPlace,`${m.imageCredit} · archivo de referencia`,m.imageSource,m.imageLicense)).join('');else if(type==='audio')$('#creditsList').innerHTML=data.audio.map(a=>row(a.municipality,a.title,a.artist,a.sourceUrl,a.license)).join('');else $('#creditsList').innerHTML=data.news.map(n=>row(n.municipality,n.title,`${n.sourceName} · ${n.publishedAt}`,n.sourceUrl,'Fuente editorial')).join('')}
  load();
})();
