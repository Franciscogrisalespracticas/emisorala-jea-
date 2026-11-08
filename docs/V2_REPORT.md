# Informe V2 — La Jefa 91.1

## Objetivo

Convertir la versión anterior en una experiencia regional presentable a cliente: sin etiquetas visibles de prototipo, con identidad propia por municipio, contenido editorial verificable, audio diferenciado, navegación funcional y panel editorial con acciones reales dentro de una aplicación estática.

## Resultado

### Contenido regional
- 14 municipios de Risaralda configurados.
- 14 fichas regionales con fotografía de referencia real de Wikimedia Commons y atribución documentada.
- 14 contenidos editoriales distintos, uno por municipio como mínimo, con fuente y fecha.
- 35 entradas de programación distribuidas de lunes a domingo.
- 5 microboletines con audio propio.
- 3 eventos regionales verificables incluidos en agenda y calendario.

### Audio
- 14 piezas abiertas documentadas para las selecciones municipales.
- Cada pieza conserva autor/fuente, licencia y URL de ficha.
- 14 respaldos sonoros locales originales evitan que el player quede inutilizable sin conexión.
- 5 MP3 de microboletines originales están incluidos físicamente en el proyecto.
- El estado `EN VIVO` solo se activa cuando el panel editorial verifica una URL de reproducción y la habilita.
- El player incorpora play/pause, anterior, siguiente, mute, volumen, progreso, playlist, compartir y Media Session API.

### Interacción pública
Se implementaron los flujos de municipio, noticia, búsqueda, programación, programas y voces, mapa, podcasts, archivo de podcasts, eventos, calendario, saludos, encuesta y reproductor expandido. La matriz completa se encuentra en `docs/INTERACTION_MATRIX.md`.

### Panel editorial
Se implementó gestión local funcional para:
- noticias;
- programación;
- programas y voces;
- eventos;
- señales y verificación;
- moderación de saludos;
- configuración de encuesta;
- usuarios y roles.

Las ediciones usan overrides por ID, evitando duplicados cuando se modifica contenido base.

## Fuentes y licencias
- Fotografías: `docs/MEDIA_CREDITS.md`.
- Audio: `docs/AUDIO_LICENSES.md`.
- Noticias: `docs/EDITORIAL_SOURCES.md`.
- Página navegable: `credits.html`.

## Caché local de medios abiertos

El entorno de construcción bloqueó resolución DNS hacia `commons.wikimedia.org`, por lo que no fue posible descargar físicamente las fotografías y audios abiertos durante el empaquetado. Se incluyó `PREPARAR_MEDIA_LOCAL.ps1`, y los scripts `ABRIR_LA_JEFA.bat/.ps1` lo ejecutan automáticamente la primera vez si no existe la caché municipal.

El sitio prioriza la caché local cuando está disponible. Mientras se prepara, las fotografías pueden usar la URL abierta de Commons y, ante error, la imagen maestra; el audio tiene además respaldo local incluido.

## Validaciones ejecutadas

- Sintaxis `app.js`: PASS.
- Sintaxis `admin.js`: PASS.
- Sintaxis `credits.js`: PASS.
- JSON de contenido: PASS.
- 14/14 municipios con noticia: PASS.
- 14/14 municipios con audio: PASS.
- 7/7 días con programación: PASS.
- Fuentes HTTP documentadas: PASS.
- Audios locales requeridos: PASS.
- IDs HTML duplicados: 0.
- `href="#"`: 0.
- Etiquetas visibles DEMO/PROTOTIPO: 0.
- Assets locales referenciados: PASS.
- Auditoría estática: 31/31 PASS.

### Navegador automatizado

Se creó `tests/test_v2_interactions.py` con el recorrido Home → municipio → noticia → búsqueda → programa → podcast → evento → calendario → comunidad → admin → publicación → programación → moderación → señal → usuarios → sitio público → créditos.

La ejecución automatizada no pudo completarse en este entorno porque Chromium bloquea por política administrativa tanto `localhost` como `file://` (`ERR_BLOCKED_BY_ADMINISTRATOR`). Esto es una restricción del entorno de ejecución, no un resultado PASS del navegador. La suite queda incluida para ejecutar en un equipo local normal antes de producción.

## Lo que todavía no es producción

- No existe backend ni base de datos persistente.
- No existe autenticación real del panel.
- No se ha entregado una URL oficial de stream de La Jefa.
- Debe confirmarse la parrilla oficial y el equipo humano antes de publicarlos como información institucional.
- Las licencias de cada fotografía de Commons deben revisarse una última vez tras descargar el archivo exacto.
- Hace falta prueba E2E local y auditoría de seguridad antes de despliegue público.

# V2 DECISION

**READY FOR CLIENT REVIEW**

La versión está lista para demostración y revisión funcional con el cliente. No está clasificada como lista para producción.

## Ajuste final de audio

Las selecciones musicales municipales no asociadas a un stream verificado se limitan en el reproductor a bloques de aproximadamente 60 segundos. Los streams reales verificados no se recortan.
