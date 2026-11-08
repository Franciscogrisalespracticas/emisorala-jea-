# Matriz de interacción — La Jefa 91.1 V2

La matriz registra la acción esperada detrás de cada control visible. `PASS` significa que el flujo está implementado y fue validado estructuralmente; la suite Playwright para validación de navegador se incluye en `tests/test_v2_interactions.py`. El navegador automatizado de este entorno bloqueó `localhost`/`file://` por política administrativa, por lo que esa suite debe ejecutarse en un entorno local normal antes de producción.

| Elemento | Ubicación | Acción esperada | Implementación | Prueba asociada | Estado |
|---|---|---|---|---|---|
| Logo La Jefa | Header | Volver al inicio | Anchor `#inicio` | Auditoría HTML | PASS |
| Inicio | Header | Ir al hero | Anchor accesible | Auditoría HTML | PASS |
| Emisoras | Header | Ir a selector regional | Anchor `#emisoras` | Auditoría HTML | PASS |
| Noticias | Header | Ir a noticias | Anchor | Auditoría HTML | PASS |
| Programación | Header | Ir a parrilla | Anchor | Auditoría HTML | PASS |
| Podcasts | Header | Ir a podcasts | Anchor | Auditoría HTML | PASS |
| Eventos | Header | Ir a agenda | Anchor | Auditoría HTML | PASS |
| Escuchar ahora | Header | Play/pause del player persistente | `data-play-selected` | Playwright: audio | PASS |
| Buscar | Header | Abrir búsqueda | Dialog con índice multi-entidad | Playwright: búsqueda | PASS |
| Menú | Header/móvil | Abrir drawer | Drawer + scrim + cierre | Playwright: navegación | PASS |
| Play hero | Hero | Play/pause | Mismo AudioElement persistente | Playwright: audio | PASS |
| Municipio destacado | Selector | Cambiar contexto editorial | Foto, noticias, mapa, texto; no cambia audio | Playwright: municipio | PASS |
| Ver todo Risaralda | Selector | Mostrar 14 municipios | Modal completo | Auditoría de datos | PASS |
| Escuchar municipio | Foco regional | Cargar selección/señal del municipio | Audio abierto o stream verificado | Playwright: audio | PASS |
| Ver noticias locales | Foco regional | Llevar a noticias del municipio | Scroll + filtro contextual | Playwright: municipio | PASS |
| Crédito de foto | Foco regional | Abrir fuente/licencia | Enlace Commons | Auditoría de fuentes | PASS |
| Leer noticia | Noticias | Abrir detalle | Modal con fecha, resumen, fuente y compartir | Playwright: noticia | PASS |
| Consultar fuente | Noticia | Abrir publicación original | Link externo seguro | Auditoría de fuentes | PASS |
| Compartir noticia | Noticia | Share API / portapapeles | `navigator.share` + fallback | Inspección JS | PASS |
| Día de parrilla | Programación | Cambiar día | 7 datasets distintos | Auditoría de datos | PASS |
| Programa | Programación | Abrir ficha | Modal con horario/descripción/audio | Playwright: programa | PASS |
| Escuchar programa | Programa | Reproducir contenido asociado | Player global | Playwright: programa | PASS |
| Programa y voz | Espacios | Abrir ficha | Modal editable desde admin | Inspección JS | PASS |
| Mapa: municipio | Mapa | Seleccionar municipio | Actualiza contexto regional | Playwright: municipio | PASS |
| Mapa: explorar | Mapa | Ir al contenido regional | Scroll al foco | Inspección JS | PASS |
| Mapa: escuchar | Mapa | Reproducir municipio | Player global | Playwright: audio | PASS |
| Podcast | Podcasts | Reproducir su archivo | Cada episodio tiene MP3 propio | Playwright: podcast | PASS |
| Ver archivo | Podcasts | Abrir archivo filtrable | Search + municipio + play | Playwright: archivo | PASS |
| Evento | Eventos | Abrir ficha | Modal con fuente y calendario | Playwright: evento | PASS |
| Calendario | Eventos | Abrir vista mensual | Calendario noviembre 2026 | Playwright: calendario | PASS |
| Agregar al calendario | Evento | Descargar ICS | Blob `.ics` | Inspección JS | PASS |
| Enviar saludo | Comunidad | Registrar para moderación | localStorage + status pendiente | Playwright: comunidad | PASS |
| Encuesta | Comunidad | Registrar voto y resultados | Persistencia + control de voto | Playwright: encuesta | PASS |
| Créditos y fuentes | Footer | Abrir transparencia editorial | `credits.html` | Auditoría HTML | PASS |
| Panel editorial | Footer/drawer | Abrir administración | `admin.html` | Auditoría HTML | PASS |
| Player: anterior | Player | Selección anterior | Municipio/podcast anterior | Inspección JS | PASS |
| Player: play/pause | Player | Control de reproducción | AudioElement persistente | Playwright: audio | PASS |
| Player: siguiente | Player | Selección siguiente | Municipio/podcast siguiente | Inspección JS | PASS |
| Player: silenciar | Player | Toggle mute | API audio | Inspección JS | PASS |
| Player: volumen | Player | Ajustar volumen | `audio.volume` | Inspección JS | PASS |
| Player: expandir | Player | Abrir player completo | Metadata, progreso, playlist, licencia | Playwright: player | PASS |
| Player: seek | Player expandido | Cambiar posición | `audio.currentTime` | Inspección JS | PASS |
| Player: compartir | Player expandido | Compartir | Share/clipboard | Inspección JS | PASS |
| Playlist | Player expandido | Cambiar selección | Municipio + audio | Inspección JS | PASS |
| Admin: nueva noticia | Noticias | Crear contenido | CRUD local | Playwright: admin | PASS |
| Admin: editar noticia | Noticias | Sobrescribir por ID | Override sin duplicación | Inspección JS | PASS |
| Admin: archivar noticia | Noticias | Ocultar de público | Estado `archived` | Inspección JS | PASS |
| Admin: eliminar noticia | Noticias | Eliminar/ocultar | Tombstone por ID | Inspección JS | PASS |
| Admin: programa | Programación | CRUD semanal | Override por ID | Playwright: admin | PASS |
| Admin: espacio/voz | Programas y voces | CRUD | Override por ID | Inspección JS | PASS |
| Admin: evento | Eventos | CRUD | Override por ID | Inspección JS | PASS |
| Admin: señal | Señales | Configurar URL | Principal + backup | Playwright: señales | PASS |
| Admin: probar señal | Señales | Verificar reproducción antes de EN VIVO | Audio probe + timeout | Playwright: señales | PASS |
| Admin: saludo aprobar | Comunidad | Moderar | Estado aprobado | Playwright: comunidad | PASS |
| Admin: saludo rechazar | Comunidad | Moderar | Estado rechazado | Inspección JS | PASS |
| Admin: saludo eliminar | Comunidad | Borrar | Persistencia | Inspección JS | PASS |
| Admin: encuesta | Comunidad | Editar pregunta/opciones/estado | Config persistente | Inspección JS | PASS |
| Admin: usuario | Usuarios | Crear/editar/eliminar | CRUD local | Playwright: usuario | PASS |
| Admin: rol | Usuarios | Asignar rol | 8 roles definidos | Auditoría de código | PASS |
| Créditos: fotos | Créditos | Ver autor/licencia/fuente | Datos de municipios | Auditoría de datos | PASS |
| Créditos: audio | Créditos | Ver pieza/licencia/fuente | Datos de audio | Auditoría de datos | PASS |
| Créditos: noticias | Créditos | Ver fuente editorial | Datos de noticias | Auditoría de datos | PASS |
