# La Jefa 91.1 · Portal regional interactivo

Versión navegable y funcional de la experiencia digital de La Jefa 91.1 para Risaralda. Conserva la portada audiovisual aprobada e incorpora exploración por los 14 municipios, noticias con fuente, programación semanal, programas y voces, podcasts, eventos, participación, reproductor persistente y panel editorial.

## Abrir en Windows

1. Descomprime el ZIP completo.
2. Ejecuta `ABRIR_LA_JEFA.bat`.
3. Se abrirá `http://localhost:8080`.
4. Panel editorial: `http://localhost:8080/admin.html`.
5. Créditos y fuentes: `http://localhost:8080/credits.html`.

También puedes abrir la carpeta en VS Code y ejecutar:

```bash
python -m http.server 8080
```

No se recomienda abrir `index.html` directamente con `file://` porque el portal carga archivos JSON mediante `fetch`.

## Preparar las fotografías y audios abiertos localmente

El portal prioriza archivos locales y tiene respaldo visual/sonoro para seguir operando sin conexión. Para descargar las fotografías reales y las piezas abiertas documentadas en Wikimedia Commons ejecuta:

```powershell
.\PREPARAR_MEDIA_LOCAL.ps1
```

El script crea la caché en:

- `assets/img/municipalities/`
- `assets/audio/open/`

Consulta `docs/MEDIA_CREDITS.md` y `docs/AUDIO_LICENSES.md` antes de publicar o redistribuir archivos.

## Transmisión

El sitio no afirma `EN VIVO` mientras no exista una señal verificada. En ausencia de stream oficial muestra una selección sonora. Desde `admin.html > Señales` se puede introducir una URL, probar su reproducción y habilitarla únicamente después de una comprobación satisfactoria.

## Persistencia editorial

Esta versión no requiere backend. Las modificaciones del panel editorial se guardan en `localStorage` del navegador y sustituyen los datos base por ID. Esto permite demostrar el ciclo completo de edición sin presentar esa persistencia local como infraestructura de producción.

Funciones editables:

- Noticias.
- Programación.
- Programas y voces.
- Eventos.
- Señales.
- Saludos y moderación.
- Encuesta.
- Usuarios y roles.

## Estructura

- `index.html`: portal público.
- `admin.html`: panel editorial.
- `credits.html`: créditos, licencias y fuentes.
- `data/`: contenido editorial base separado del código.
- `assets/js/app.js`: interacción pública y player.
- `assets/js/admin.js`: gestión editorial local.
- `assets/video/`: hero animado aprobado.
- `assets/audio/podcasts/`: microboletines originales.
- `docs/`: fuentes, licencias, matriz de interacción e informe de la versión.
- `tests/`: pruebas de interacción.

## Paso a producción

Antes de publicar como producto operativo deben incorporarse backend, autenticación, base de datos, almacenamiento, CDN, monitoreo y la señal oficial de La Jefa. La arquitectura de fases anteriores se conserva en `docs/architecture/`.
