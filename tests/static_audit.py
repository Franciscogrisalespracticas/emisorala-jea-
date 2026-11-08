import json,re,pathlib,sys
from html.parser import HTMLParser
root=pathlib.Path(__file__).resolve().parents[1]
checks=[]
def add(name,ok,detail=''): checks.append({'check':name,'status':'PASS' if ok else 'FAIL','detail':detail})
# JSON/data integrity
data={}
for name in ['municipalities','news','audio','programs','podcasts','events','voices']:
    try:
        data[name]=json.load(open(root/f'data/{name}.json',encoding='utf8'));add(f'JSON válido: {name}',True,f'{len(data[name])} registros')
    except Exception as e:add(f'JSON válido: {name}',False,str(e))
mun=[m['name'] for m in data.get('municipalities',[])]
add('14 municipios de Risaralda',len(mun)==14 and len(set(mun))==14,str(mun))
news_m={n['municipality'] for n in data.get('news',[])}
add('Cada municipio tiene contenido editorial',set(mun)<=news_m,f'{len(news_m)}/14')
audio_m={a['municipality'] for a in data.get('audio',[])}
add('Cada municipio tiene selección sonora',set(mun)<=audio_m,f'{len(audio_m)}/14')
add('Programación cubre lunes-domingo',{p['day'] for p in data.get('programs',[])}==set(range(7)),str(sorted({p['day'] for p in data.get('programs',[])})))
# source URLs
for kind,items,keys in [('noticias',data.get('news',[]),['sourceUrl']),('audio',data.get('audio',[]),['sourceUrl']),('municipios',data.get('municipalities',[]),['imageSource'])]:
    bad=[]
    for x in items:
        for k in keys:
            if not str(x.get(k,'')).startswith('http'): bad.append((x.get('id') or x.get('name') or x.get('municipality'),k))
    add(f'Fuentes HTTP documentadas: {kind}',not bad,str(bad))
# local audio existence
missing=[]
for a in data.get('audio',[]):
    if not (root/a['fallback']).exists(): missing.append(a['fallback'])
for p in data.get('podcasts',[]):
    if not (root/p['audio']).exists(): missing.append(p['audio'])
add('Audios locales de respaldo y podcasts existen',not missing,str(missing))
# HTML parser
class P(HTMLParser):
    def __init__(self): super().__init__();self.buttons=[];self.links=[];self.ids=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get('id'): self.ids.append(d['id'])
        if tag=='button': self.buttons.append(d)
        if tag=='a': self.links.append(d)
for page in ['index.html','admin.html','credits.html']:
    p=P();p.feed((root/page).read_text(encoding='utf8'))
    dup=[x for x in set(p.ids) if p.ids.count(x)>1]
    add(f'{page}: IDs únicos',not dup,str(dup))
    badlinks=[x for x in p.links if x.get('href')=='#']
    add(f'{page}: sin href=#',not badlinks,str(badlinks))
# references from HTML
for page in ['index.html','admin.html','credits.html']:
    text=(root/page).read_text(encoding='utf8')
    refs=re.findall(r'(?:src|href)="([^"#?]+)"',text)
    missing=[]
    for r in refs:
        if r.startswith(('http:','https:','mailto:','tel:','data:')): continue
        if r.endswith('.html') or '/' in r or '.' in pathlib.Path(r).name:
            target=(root/r).resolve()
            try: target.relative_to(root.resolve())
            except: continue
            if not target.exists(): missing.append(r)
    add(f'{page}: assets/enlaces locales existen',not missing,str(missing))
# visible prototype wording in public/admin/credits HTML (text nodes only)
class TextP(HTMLParser):
    def __init__(self): super().__init__(); self.text=[]; self.skip=0
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style') and self.skip: self.skip-=1
    def handle_data(self,d):
        if not self.skip:self.text.append(d)
for page in ['index.html','admin.html','credits.html']:
    hp=TextP();hp.feed((root/page).read_text(encoding='utf8'));txt=' '.join(hp.text).lower()
    bad=[w for w in ['demo','prototipo','pendiente_datos_reales'] if w in txt]
    add(f'{page}: sin etiquetas de prototipo visibles',not bad,str(bad))
# JS action coverage markers
app=(root/'assets/js/app.js').read_text(encoding='utf8')
admin=(root/'assets/js/admin.js').read_text(encoding='utf8')
markers=['#searchOpen','#podcastArchiveBtn','#calendarBtn','#greetingBtn','#pollBtn','#playerExpand','#listenMunicipality','#mapListen','data-news-id','data-program-id','data-event-id','data-podcast-id','data-municipality']
add('app.js cubre controles públicos clave',all(m in app for m in markers),str([m for m in markers if m not in app]))
markers2=['newArticle','newProgram','newVoice','newEvent','data-edit-signal','data-greeting-action','newUser','editPoll']
add('admin.js cubre módulos administrativos',all(m in admin for m in markers2),str([m for m in markers2 if m not in admin]))
# forbidden old assets
old=['assets/js/data.js','assets/audio/la-jefa-demo.mp3']
add('Se retiraron assets antiguos de demostración',all(not (root/x).exists() for x in old),str([x for x in old if (root/x).exists()]))
# scripts/docs
needed=['PREPARAR_MEDIA_LOCAL.ps1','docs/MEDIA_CREDITS.md','docs/AUDIO_LICENSES.md','docs/EDITORIAL_SOURCES.md','tests/test_v2_interactions.py']
add('Documentación y preparación de media incluidas',all((root/x).exists() for x in needed),str([x for x in needed if not (root/x).exists()]))

report={'summary':{'pass':sum(c['status']=='PASS' for c in checks),'fail':sum(c['status']=='FAIL' for c in checks)},'checks':checks}
(root/'docs/STATIC_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(1 if report['summary']['fail'] else 0)
