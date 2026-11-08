from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
import json, pathlib, sys, os
BASE=os.environ.get('LAJEFA_BASE_URL','http://127.0.0.1:8080')
results=[]
def ok(name,detail=''):
    results.append({'test':name,'status':'PASS','detail':detail})
def fail(name,e):
    results.append({'test':name,'status':'FAIL','detail':str(e)[:500]})

def test(name, fn):
    try: fn(); ok(name)
    except Exception as e: fail(name,e)

def close_dialog(page, did):
    d=page.locator(did)
    if d.get_attribute('open') is not None:
        d.locator('[data-close-modal]').first.click()

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, args=['--autoplay-policy=no-user-gesture-required'])
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page()
    page_errors=[]
    page.on('pageerror',lambda e: page_errors.append(str(e)))

    page.goto(BASE+'/index.html',wait_until='domcontentloaded')
    page.wait_for_selector('#municipalityTitle')
    page.wait_for_function("document.querySelector('#municipalityTitle').textContent.trim().length>0")
    test('Home carga',lambda: page.locator('#heroTitle').wait_for(state='visible'))
    test('Sin enlaces href=#',lambda: (_ for _ in ()).throw(Exception('href=# encontrado')) if page.locator('a[href="#"]').count() else None)

    def municipality():
        page.locator('[data-municipality="Dosquebradas"]').first.click();page.wait_for_timeout(200)
        assert page.locator('#municipalityTitle').inner_text().strip()=='Dosquebradas'
        assert 'Dosquebradas' in page.locator('#featuredNewsTitle').inner_text()
    test('Cambio de municipio actualiza contexto',municipality)

    def news():
        page.locator('#featuredNewsOpen').click();page.locator('#contentModal[open]').wait_for();
        assert page.locator('#contentModal h2').inner_text().strip();close_dialog(page,'#contentModal')
    test('Noticia abre detalle y fuente',news)

    def search():
        page.locator('#searchOpen').click();page.locator('#searchModal[open]').wait_for();page.locator('#searchInput').fill('Santa Rosa');page.wait_for_timeout(150)
        assert page.locator('[data-search-type="Municipio"]').count()>0
        page.locator('[data-search-type="Municipio"]').first.click();page.wait_for_timeout(100)
        assert page.locator('#municipalityTitle').inner_text().strip()=='Santa Rosa de Cabal'
    test('Buscador navega a resultado',search)

    def program():
        page.locator('.schedule-item').first.click();page.locator('#contentModal[open]').wait_for();assert page.locator('#programListen').count()==1;close_dialog(page,'#contentModal')
    test('Programa abre ficha funcional',program)

    def podcast():
        page.locator('[data-podcast-id]').first.click();page.wait_for_timeout(350)
        src=page.locator('#radioAudio').evaluate('(a)=>a.getAttribute("src")||a.currentSrc')
        assert 'assets/audio/podcasts/' in src,src
        assert page.locator('#playerMode').inner_text().strip()=='PODCAST'
    test('Podcast usa audio propio',podcast)

    def event():
        page.locator('[data-event-id]').first.click();page.locator('#contentModal[open]').wait_for();assert page.locator('#addCalendar').count()==1;close_dialog(page,'#contentModal')
    test('Evento abre detalles',event)

    def calendar():
        page.locator('#calendarBtn').click();page.locator('#calendarModal[open]').wait_for();assert page.locator('.calendar-day').count()>=28;close_dialog(page,'#calendarModal')
    test('Calendario mensual abre',calendar)

    def greeting():
        page.locator('#greetingBtn').click();page.locator('#communityModal[open]').wait_for();f=page.locator('#greetingForm');f.locator('[name=name]').fill('Oyente Prueba');f.locator('[name=message]').fill('Mensaje para validar el flujo editorial.');f.locator('button[type=submit]').click();page.wait_for_timeout(100)
        count=page.evaluate("JSON.parse(localStorage.getItem('lajefa_greetings')||'[]').length")
        assert count>=1;close_dialog(page,'#communityModal')
    test('Saludo se guarda para moderación',greeting)

    def poll():
        page.locator('#pollBtn').click();page.locator('#communityModal[open]').wait_for();
        opts=page.locator('[data-poll-option]')
        if opts.count(): opts.first.click();page.wait_for_timeout(100);assert page.locator('.poll-result').count()>0
        else: assert 'Tu voto' in page.locator('#communityModalContent').inner_text()
        close_dialog(page,'#communityModal')
    test('Encuesta registra y muestra resultados',poll)

    def expanded():
        page.locator('#playerExpand').click();page.locator('#playerModal[open]').wait_for();assert page.locator('.player-playlist button').count()>=5;close_dialog(page,'#playerModal')
    test('Player expandido muestra metadata y lista',expanded)

    page.goto(BASE+'/admin.html',wait_until='domcontentloaded');page.wait_for_selector('#adminContent .admin-stats')
    test('Panel editorial carga',lambda: page.locator('[data-admin-view="noticias"]').wait_for())

    def create_news():
        page.locator('[data-admin-view="noticias"]').click();page.locator('#newArticle').click();page.locator('#newsForm [name=title]').fill('Noticia creada desde el panel editorial');page.locator('#newsForm [name=summary]').fill('Contenido local creado para comprobar el ciclo completo de publicación.');page.locator('#newsForm button[type=submit]').click();page.wait_for_timeout(100)
        assert 'Noticia creada desde el panel editorial' in page.locator('#adminContent').inner_text()
    test('Admin crea noticia',create_news)

    def edit_program():
        page.locator('[data-admin-view="programacion"]').click();page.locator('[data-edit-program]').first.click();inp=page.locator('#programForm [name=name]');name=inp.input_value();inp.fill(name+' Actualizado');page.locator('#programForm button[type=submit]').click();page.wait_for_timeout(100);assert 'Actualizado' in page.locator('#adminContent').inner_text()
    test('Admin edita programación',edit_program)

    def moderate():
        page.locator('[data-admin-view="comunidad"]').click();
        b=page.locator('[data-greeting-action="aprobar"]').first
        assert b.count()==1;b.click();page.wait_for_timeout(100);assert 'aprobado' in page.locator('#adminContent').inner_text().lower()
    test('Admin modera saludo',moderate)

    def signal():
        page.locator('[data-admin-view="senales"]').click();page.locator('[data-edit-signal="Pereira"]').click();f=page.locator('#signalForm');f.locator('[name=primaryUrl]').fill(BASE+'/assets/audio/podcasts/pereira.mp3');page.locator('#testSignal').click();page.wait_for_timeout(1200);assert 'REPRODUCIBLE' in page.locator('#signalTestBox').inner_text();f.locator('[name=enabled]').check();f.locator('button[type=submit]').click();page.wait_for_timeout(100)
        sig=page.evaluate("JSON.parse(localStorage.getItem('lajefa_signals')||'[]').find(x=>x.municipality==='Pereira')")
        assert sig and sig.get('verified') and sig.get('enabled')
    test('Admin prueba y habilita señal verificable',signal)

    def user_flow():
        page.locator('[data-admin-view="usuarios"]').click();page.locator('#newUser').click();page.locator('#userForm [name=name]').fill('Editor de prueba');page.locator('#userForm [name=role]').select_option(label='EDITOR');page.locator('#userForm button[type=submit]').click();page.wait_for_timeout(100);assert 'Editor de prueba' in page.locator('#adminContent').inner_text()
    test('Admin gestiona usuario y rol',user_flow)

    def public_override():
        page.goto(BASE+'/index.html',wait_until='domcontentloaded');page.wait_for_selector('#municipalityTitle');page.locator('[data-municipality="Pereira"]').first.click();page.wait_for_timeout(150)
        assert 'Noticia creada desde el panel editorial' in page.locator('#newsGrid').inner_text()
        page.locator('#listenMunicipality').click();page.wait_for_timeout(250);assert page.locator('#playerMode').inner_text().strip()=='EN VIVO'
    test('Cambios admin se reflejan y señal verificada activa EN VIVO',public_override)

    def credits():
        page.goto(BASE+'/credits.html',wait_until='domcontentloaded');page.wait_for_selector('.credit-row');assert page.locator('.credit-row').count()==14;page.locator('[data-credit-type="audio"]').click();page.wait_for_timeout(80);assert page.locator('.credit-row').count()==14
    test('Créditos y licencias navegables',credits)

    # Mobile smoke
    mobile=context.new_page();mobile.set_viewport_size({'width':390,'height':844});mobile.goto(BASE+'/index.html',wait_until='domcontentloaded');mobile.wait_for_selector('.mobile-nav');
    try:
        sw=mobile.evaluate('document.documentElement.scrollWidth');iw=mobile.evaluate('window.innerWidth');assert sw<=iw+2;ok('Responsive móvil sin overflow',f'{sw}/{iw}')
    except Exception as e: fail('Responsive móvil sin overflow',e)
    try:
        unlabeled=mobile.locator('button').evaluate_all("els=>els.filter(b=>!((b.innerText||'').trim()||b.getAttribute('aria-label')||b.getAttribute('title'))).length");assert unlabeled==0;ok('Botones accesibles con nombre',str(unlabeled))
    except Exception as e: fail('Botones accesibles con nombre',e)
    mobile.close()

    if page_errors: fail('Sin errores JavaScript', '; '.join(page_errors))
    else: ok('Sin errores JavaScript')
    page.goto(BASE+'/index.html');page.screenshot(path='/mnt/data/la-jefa-v2/site/docs/evidence/v2-desktop.png',full_page=False)
    context.close();browser.close()

out=pathlib.Path('/mnt/data/la-jefa-v2/site/docs/PLAYWRIGHT_REPORT.json')
out.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(results,ensure_ascii=False,indent=2))
failed=[r for r in results if r['status']=='FAIL']
sys.exit(1 if failed else 0)
