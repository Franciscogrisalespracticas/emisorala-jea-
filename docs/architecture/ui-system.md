# Sistema visual propuesto

Dirección basada en el texto adjunto. Falta cotejo visual con la imagen original antes de aprobar assets finales. No se ha producido un mockup ni medido contraste/renderizado de una interfaz implementada.

## Identidad

Radio regional con fotografía protagonista, tipografía editorial y controles inequívocos. Fondo negro/grafito, lima para escuchar, turquesa para información secundaria, blanco para lectura. Tokens provisionales: background #0B0D0C, surface #181D1B, text #F5F7F6, muted #A9B5AF, primary #C7F53B, secondary #45D8CE. Texto oscuro sobre CTA lima; no asumir que lima sobre blanco tiene contraste adecuado. Paleta final se verifica con WCAG AA.

Tipografía sans legible autoalojada con licencia revisada, máximo dos familias y pocos pesos; candidato Inter para UI y una familia display para titular tras revisión de marca. Cuerpo base 16 px, interlineado 1.5; titulares fluidos mediante clamp, sin texto decorativo ilegible. Espaciado en escala 4/8 px, bordes discretos, radios contenidos. No glassmorphism generalizado ni grandes degradados.

## Home y navegación

Orden: header, hero, selector regional, ahora al aire, noticias, programación, locutores, mapa, podcasts, eventos, comunidad, patrocinadores y footer. Mantener todas las secciones sin exigir que todas tengan datos: vacíos honestos en DEMO y ocultar módulos opcionales vacíos en producción según criterio editorial.

Hero: «EL EJE SUENA AQUÍ», subtítulo «La radio de nuestra región», ambos copy de campaña pendiente. CTA escuchar destacado y acceso secundario a programación. Composición de paisaje + estudio; texto fuera de imagen para accesibilidad y responsive. No incluir logos ficticios ni nombres de locutores dentro de una imagen generada.

Header desktop: logo, Inicio, Emisoras, Noticias, Programación, Podcasts, Eventos, buscar y escuchar. Reducir altura al scroll con CSS/clase discreta, sin salto de layout. Menú adicional accesible. Mobile: Inicio, Radio, Noticias, Programación y Más; mini-player encima con safe-area y espacio reservado en contenido. Drawer del reproductor con foco controlado, Escape y retorno al activador. No tapar enlaces finales ni mensajes con barras fijas.

Selector municipal como botones/chips y enlaces a URLs canónicas; `aria-expanded` en Ver todo. Cambiar contenido con fade 160–240 ms propuesto, preservar foco y anunciar actualización concisa; no desplazar automáticamente toda la página. Cancelar peticiones obsoletas y conservar filtro en URL. Si se selecciona municipio sin señal, mostrar contexto editorial, no error de audio.

## Hero por capas

Cielo y montañas estáticos; nubes separadas con transform lento; paisaje/vegetación en capas solo donde aporte profundidad; estudio delantero recortado con monitor y mirador integrados. Usar coordenadas normalizadas sobre un marco de composición, máscaras y oclusión del balcón. Reencuadrar móvil con su propio arte, no comprimir toda la escena desktop.

Nubes: ciclo CSS largo propuesto 60–120 s, sin reflow; pausa fuera de viewport/documento oculto y botón «Pausar animaciones». Monitor decorativo local, sin rerender React por barra. GSAP solo si la secuencia requiere coordinación; limpieza al desmontar y reduced motion. No mantener `will-change` en docenas de elementos. Visualización animada y clip narrativo no deben encenderse por defecto bajo ahorro de datos conocido.

Mirador: aparición ocasional y silenciosa de una mujer adulta ficticia o autorizada, sin presentarla como empleada real. Primera aparición tras 20–40 s de hero visible, propuesta; máximo 2 por sesión, separación mínima 90 s. Solo cuando hero visible; no reiniciar repetidamente al hacer scroll. Reduced motion: poster sin clip. No disparar generación en cliente.

## Accesibilidad

WCAG 2.2 AA como meta: landmarks, orden semántico, labels visibles, contraste texto normal 4.5:1 y controles relevantes 3:1, foco visible y no oculto por barras, nombres accesibles y mensajes de error asociados. Objetivo de producto para áreas táctiles 44×44 CSS px. Respeto de zoom/reflow, teclado y lectores de pantalla. Evitar anuncios de estado cada segundo; progreso sin spam de aria-live. Animación persistente con control de pausa y reduced motion.

SVG de mapa con geometría oficial validada. Selección por teclado/tap además de hover; lista equivalente de 14 municipios junto al mapa, para lector de pantalla y pantallas pequeñas. No depender solo del color. Tooltip no es único acceso a datos. Si la geometría aún no existe, mostrar lista y etiqueta PLACEHOLDER; no dibujar límites ficticios.

## Presupuestos propuestos, no mediciones

| Recurso/métrica | Objetivo inicial | Verificación |
|---|---|---|
| LCP | ≤2.5 s p75 | RUM tras lanzamiento; laboratorio antes |
| INP | ≤200 ms p75 | RUM con volumen suficiente |
| CLS | ≤0.1 p75 | Dimensiones reservadas, carga de fuentes/media |
| Hero móvil | ≤250 KB imagen | Export y calidad visual |
| Hero desktop | ≤500 KB imagen base | Export AVIF/WebP con fallback |
| JS inicial ruta pública | ≤200 KB gzip como presupuesto a validar | Reporte build; revisar si framework consume margen |
| Clip mirador web | ≤1.5 MB por variante final | Si pierde calidad usar poster o recorte menor |
| Video decorativo inicial | 0 bytes hasta activación/carga diferida | Inspección red |

Priorizar imagen hero LCP; lazy load resto; fuentes limitadas. No descargar todos los municipios ni todos los clips al entrar. Opciones de movimiento se cargan cuando hacen falta. Presupuestos no son garantías, se revisan con arte real. Pruebas a 320, 375, 390, 430, 768, 1024, 1440 y 1920 px, más zoom y orientación. Funcionamiento sin motion es obligatorio.
