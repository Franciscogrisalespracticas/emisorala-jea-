# Plan Higgsfield — sin generación autorizada

Estado: PLANNED. Consulta de catálogo, detalle y cotización el 2026-11-08. Ninguna generación, subida de referencias ni consumo de créditos realizado en esta fase.

## Modelo y coste

Kling 3.0 (`kling3_0`) permite 3–15 segundos enteros, std/pro/4k, sonido on/off, 16:9/9:16/1:1 y start_image/end_image según catálogo conectado. Kling 2.6 se consultó como alternativa de 5/10 s. Elegimos provisionalmente 3.0 para permitir ocho segundos y extremos de escena; esto no demuestra calidad ni asegura identidad o continuidad perfecta.

Preflight sin referencias: modelo kling3_0, duration=8, mode=pro, sound=off, aspect_ratio=16:9, count=1 → **14 créditos exactos**. Estimación puntual, no precio garantizado futuro. Dos variantes con idéntica configuración sumarían 28 créditos si la tarifa no cambia. No hay precio confirmado para otras configuraciones. No existe aprobación para gastar ni esos 14 ni esos 28 créditos.

El catálogo no declara dimensiones exactas para el modo pro: no equiparar automáticamente pro con 1080p. Objetivo de entrega web se define aparte; resolución nativa debe confirmarse antes de generar. No pedir 4K por defecto.

## Inventario

| Asset | Propósito | Modelo/técnica | Duración y ratio | Resolución objetivo web | Formato | Variantes propuestas | Créditos estimados | Estado |
|---|---|---|---|---|---|---|---|---|
| HERO CLOUD LOOP | Atmósfera | CSS + capas; IA solo si el arte lo exige | Ciclo 60–120 s por CSS | 1920 desktop/768 móvil, ajustables | AVIF/WebP/PNG alfa | 1 composición por breakpoint | 0 generación en opción CSS | PLANNED |
| MIRADOR CHARACTER | Detalle narrativo | Kling 3.0 pro, sound off | 8 s, 16:9 de producción | Recorte aproximado 640×360; máscara según arte | MP4 H.264 + WebM opcional, poster | 1 prueba inicial; 2.ª solo tras revisión | 14 por prueba cotizada | PENDIENTE_ASSETS_Y_APROBACION |
| RADIO STUDIO AMBIENCE | Monitor/ON AIR | CSS/canvas; sin video inicialmente | Ciclo local | Área del monitor | Código y assets estáticos | 1 | 0 generación en opción propuesta | PLANNED |
| MUNICIPALITY TRANSITIONS | Cambio editorial | Fade CSS; videos opcionales posteriores | 160–240 ms UI; clip futuro por cotizar | Dependiente de tarjeta | CSS; MP4/WebM si se aprueba | 0 clips inicialmente | 0 en MVP | DEFERRED |

No generar 14 videos por llenar el catálogo. Reservar presupuesto a la pieza que aporta identidad. Costes de artista, recorte, limpieza y codificación no están incluidos en créditos del modelo.

## Storyboard mirador, 8 segundos

| Tiempo | Acción | Control visual |
|---|---|---|
| 0–1 s | Balcón vacío | Coincidir con poster base |
| 1–3 s | Mujer adulta se asoma lentamente | Cuerpo ocluido por marco/baranda |
| 3–5 s | Mira paisaje; gesto corto | Sin mirar constantemente al espectador |
| 5–7 s | Se retira | Mantener anatomía y perspectiva |
| 7–8 s | Balcón vacío | Final compatible con base estática |

Plano fijo, sin zoom ni travelling. Luz igual a la del hero aprobado, dirección de sombras y temperatura constantes. El clip ocupa una región pequeña de la composición. Definir primero máscara del balcón, punto de apoyo, referencia adulta, vestuario y tamaño relativo. Debe aprobarse la imagen de inicio y final antes del job; sin estas referencias el plan no está listo para producir.

Prompt de trabajo MIRADOR: «Cámara completamente fija. Conserva arquitectura, perspectiva, iluminación y paisaje de las imágenes de referencia. Una mujer claramente adulta, con vestuario cotidiano profesional y sin logotipos, aparece lentamente desde detrás del marco del balcón, observa brevemente el paisaje, hace un pequeño gesto natural y vuelve a ocultarse. Inicio y final con balcón vacío. Movimiento discreto, anatomía coherente. Sin texto, sin cambio de cámara, sin transformación del edificio ni movimiento global del paisaje. Sin sonido». Prompt sujeto a revisión visual, no enviado.

Prompt alternativo CLOUD, solo si se aprueba video: «Plano fijo del cielo de referencia; nubes lentas y naturales, montañas y arquitectura inmóviles; mantener luz y composición; principio y final compatibles con un bucle; sin texto ni sonido». No cotizado.

Prompt alternativo STUDIO, solo si se aprueba video: «Estudio de referencia inmóvil, cámara fija, variación sutil de luces de equipo sin alterar logotipo, consola o arquitectura; sin personas ni audio». Se prefiere código porque el modelo puede deformar controles.

Prompt alternativo MUNICIPALITY: «Mantener fiel la fotografía autorizada del lugar, sin inventar monumentos ni transformar arquitectura; movimiento ambiental mínimo, cámara fija, sin texto ni personas nuevas». Cada localidad requiere referencia real y presupuesto propio; diferido.

## Integración y export

No asumir que el modelo entrega alfa. Primera opción: recorte opaco del balcón sobre clean plate compatible, con máscara que esconda bordes y baranda delantera superpuesta. Si hay cambios de fondo, recomponer/rotoscopiar fuera del modelo; si resulta frágil, usar poster y posponer clip. WebM alfa no es garantía universal: probar Safari/iOS, mantener fallback estático.

Entregar master y derivados separados. Derivados silenciosos sin pista de audio, MP4 faststart y WebM solo cuando beneficie tamaño/soporte; poster WebP/AVIF. Preload none, playsInline, muted; animación nunca comparte elemento con radio. Programar por visibilidad y preferencia de movimiento. Detener y liberar recursos fuera de viewport. No descargar master a cliente.

QA de la pieza: sin costuras, cambios de iluminación, manos deformadas, logos alterados, pops de inicio/final ni movimiento de cámara. Revisar a tamaño real en móvil antes de aumentar resolución. Comprobar frame inicial contra poster. Si excede presupuesto de bytes, simplificar escena y reducir área antes de comprometer escucha.

## Puerta de aprobación futura

Mostrar referencia aprobada + modelo + parámetros + resolución confirmada + duración + ratio + número de variantes + cotización vigente. Solo entonces solicitar aprobación explícita para generar. Esta fase termina antes de esa aprobación.
