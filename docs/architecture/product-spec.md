# Especificación de producto

## Objetivo y alcance

Escuchar La Jefa con continuidad durante la navegación pública y descubrir contenido regional. Prioridad comercial: escucha, retorno y espacios de patrocinio administrables. No se prometen niveles de audiencia, ingresos ni cobertura FM.

MVP funcional objetivo: una estación confirmada cuando lleguen sus datos; catálogo editorial de 14 municipios; home, noticia, programación, perfiles, podcasts y eventos; player; administración con publicación y aislamiento; campañas básicas y moderación. En DEMO la señal permanece no configurada o utiliza un fixture local explícito; ninguna URL se inventa. El MVP incluye listados y edición sencilla, no workflows empresariales completos.

Salud de señales y métricas reales del proveedor se integran solo si existe acceso. Comunidad inicia con saludos moderados y encuestas sencillas; concursos y voz requieren reglas y políticas de datos antes de habilitarse. No hay ad server, facturación, app nativa ni automatización de cabina en este alcance. La web consume la señal; no sustituye el sistema que programa y emite la música.

## Catálogo territorial

Pereira, Apía, Balboa, Belén de Umbría, Dosquebradas, Guática, La Celia, La Virginia, Marsella, Mistrató, Pueblo Rico, Quinchía, Santa Rosa de Cabal y Santuario. Mostrar inicialmente Pereira, Dosquebradas, Santa Rosa de Cabal, La Virginia y La Celia; botón «Ver todo Risaralda» expande los otros nueve sin alterar audio.

Cada municipio tiene página editorial. Cobertura, vínculo de contenidos y señal son relaciones distintas. Una selección territorial no prueba cobertura FM ni autoriza cambiar de estación. Si faltan contenidos se muestra estado vacío, no noticias fabricadas.

## Comportamientos verificables

| Flujo | Criterio de aceptación |
|---|---|
| Entrar | No inicia audio sin gesto; CTA visible; DEMO reconocible |
| Escuchar | CONNECTING antes de reproducción; LIVE solo tras evento de reproducción; rechazo visible |
| Navegar | Conserva identidad del elemento audio y señal seleccionada entre rutas públicas |
| Cambiar municipio | Cambia filtro y URL; no asigna src ni llama load/play por el filtro |
| Otra señal | Ofrece CTA separado; al aceptarlo cambia una sola vez y refleja nuevo estado |
| Programación | Hora America/Bogota, cambio de día y franjas nocturnas resueltos; vacío explícito |
| Noticias | Solo PUBLISHED y fecha efectiva pasada se expone al público |
| Podcast | Sustituye audio solo por acción explícita; permite regresar a radio; nunca dos audios simultáneos |
| Comunidad | Envío queda PENDING; confirmación no implica publicación |
| Administración | Permiso + estación + propiedad del recurso validados en servidor |
| Caída | Estado honesto, reintentos acotados, respaldo de misma señal si está autorizado |

La etiqueta «Ahora al aire» deriva de programación, no prueba que la fuente esté transmitiendo ese programa. Si existe override editorial confirmado debe identificarse; la música requiere metadata real con timestamp y caducidad.

## Complejidad cualitativa

| Módulo | Complejidad | Principal dificultad |
|---|---|---|
| Tokens y componentes | Media | Contraste, reuso y móvil |
| Hero y mirador | Alta | Composición y continuidad visual, sin degradar carga |
| Player | Muy alta | Estados asíncronos, codecs, móviles y reconexión |
| Selector territorial | Media | Separar filtro y señal |
| Mapa SVG | Media | Geometría, teclado y pantalla pequeña |
| Programación | Alta | Solapes, medianoche y excepciones |
| CMS y SEO | Alta | Revisión, concurrencia, publicación y caché |
| Roles y aislamiento | Muy alta | Evitar lectura/escritura cruzada |
| Podcasts y eventos | Media | Media, derechos y fechas |
| Uploads y moderación | Alta | Abuso, privacidad y ciclo de revisión |
| Publicidad | Media | Fechas, segmentación y métricas no facturables |
| Monitoreo de streams | Alta | SSRF, streams infinitos y diagnósticos parciales |
| Analítica | Media | Separar eventos web y oyentes del proveedor |
| Despliegue y recuperación | Alta | Migraciones, backups y pruebas de restauración |

Estas categorías no son estimaciones de horas. Cronograma y presupuesto requieren conocer equipo, proveedor, contenidos y nivel de acabado visual.

## IA con valor real, fuera del camino crítico

Opcional posterior: proponer resumen/título/etiquetas de noticias usando solo material editorial autorizado; transcribir episodios propios; sugerir texto alternativo revisado por personas. Siempre borrador, trazabilidad de modelo y aprobación humana. Sin publicación automática ni biografías o actualidad inventadas. No construir RAG hasta disponer de un corpus autorizado y una necesidad comprobada. Presupuesto de inferencia, retención del proveedor, latencia y límites por usuario se definirán antes de contratar. El MVP funciona sin IA.
