# Investigación técnica

Consulta: 2026-11-08. Se distingue evidencia documental de decisiones propias. No se ejecutó instalación, benchmark, auditoría de dependencias ni prueba contra un stream de La Jefa. La documentación consultada no prueba compatibilidad integral del futuro proyecto.

## Matriz de decisiones

| Área | Evidencia consultada | Decisión propuesta y límite |
|---|---|---|
| Runtime | Node lista 24 y 26 como LTS [R1]; Prisma v7 incluye Node 24 en requisitos [R2] | Node 24 LTS, último parche de seguridad al iniciar; no elegir 26 solo por novedad |
| Frontend | Next documenta layouts persistentes y navegación entre raíces con recarga completa [R3] | Next App Router y React compatible con su release estable; raíz pública única |
| Versiones | Las páginas consultadas de Prisma redirigen a v7; algunos resultados mencionan v8 | v7 es referencia técnica consultada, no afirmación de última versión. Resolver release estable mantenida y peer dependencies antes de instalar |
| Datos | Prisma v7 documenta ESM y adaptador PostgreSQL [R4] | Prisma + adaptador pg; presupuesto explícito de conexiones; prueba PostgreSQL aislada |
| Backend | Fastify tiene política LTS; la página latest y resultados GitHub no exhiben idéntica matriz [R5] | Fastify modular como candidato; confirmar major soportada, plugins y Node 24 al fijar lockfile |
| CSS | Tailwind v4 exige Chrome 111, Safari 16.4 y Firefox 128 [R6] | Tailwind v4 si ese mínimo satisface audiencia; si exige equipos más antiguos, usar CSS compatible |
| Motion | GSAP proporciona integración React con limpieza de animaciones [R7] | CSS para nubes/fades; GSAP aislado y diferido para secuencias complejas |
| Audio | Navegadores restringen autoplay audible [R8] | Inicio por gesto; manejar rechazo de play; nunca asumir reproducción |
| Audio CORS | Web Audio exige silencio para fuente cross-origin no autorizada [R9] | No conectar analizador al stream hasta verificar CORS; decorativo por defecto |
| HLS | hls.js utiliza MSE y requiere CORS en recursos HLS [R10] | Adaptador bajo demanda; detección HLS nativa antes de cargar biblioteca |
| Media Session | MDN la clasifica de disponibilidad limitada [R11] | Mejora opcional; feature detection por API/acción; controles HTML siempre disponibles |
| Seguridad | OWASP publica ASVS 5.0.0 como release estable [R12] | Objetivo ASVS nivel 2 con requisitos aplicables trazados, no certificación |
| Accesibilidad | WCAG 2.2 es recomendación W3C [R13] | Objetivo AA; revisión automática y manual |
| PostgreSQL | Política oficial de cinco años por major [R14] | PostgreSQL 17 como línea candidata soportada; parche y proveedor por validar |

Las versiones exactas se fijarán en un único lockfile tras revisar releases y advisories oficiales. No utilizar `latest` sin revisión en CI. El futuro expediente registrará Node, Next, React, Prisma CLI/client/adaptador, pg, Fastify/plugins, Tailwind y GSAP con versiones exactas y fecha. No se considera verificada una combinación solo porque sus mínimos coincidan.

## Alternativas y madurez

- **Base estable:** HTMLAudioElement, CSS transforms, Next layouts, PostgreSQL y APIs HTTP. Su uso aún requiere pruebas del producto.
- **Opcionales con detección:** Media Session, Web Audio y reproducción HLS. La compatibilidad depende de navegador, codec y proveedor.
- **Excluidos del MVP:** WebGPU, WebGL, Three.js, scroll secuestrado, microservicios y personalización algorítmica. No resuelven la necesidad principal de escuchar.
- **No necesarios:** Redux, Lenis, Redis y un broker de colas en la primera versión. Si el despliegue introduce varias réplicas, rate limits deben compartir almacenamiento; no usar memoria local como protección distribuida.
- **No adoptar sin validación:** canary, RC, paquetes abandonados o nuevas majors que carezcan de compatibilidad confirmada. No se presenta ninguna dependencia como libre de vulnerabilidades sin auditar la versión instalada.

## Referencias de producto

La documentación oficial BBC Audio describe acceso a estaciones y contenido bajo demanda [R15]. Se toma como referencia funcional la separación entre señal, programación y episodios; no se afirma haber inspeccionado su interfaz ni se copia identidad visual. El acceso internacional a BBC Sounds cambió en 2025 [R16]: una referencia vieja no describe necesariamente el producto actual. Los intentos de consultar NPR y Radio France no devolvieron páginas accesibles; quedan excluidos de conclusiones verificadas.

CARDER describe los 14 municipios del departamento [R17]. Los nombres del catálogo se toman del encargo. El SVG deberá derivarse de geometría oficial con licencia identificada; aún no se descargó ni validó cartografía. La documentación de esta fase no incluye evaluación visual de las imágenes mencionadas en otros chats: el único adjunto inspeccionado fue el prompt. La dirección artística se basa en su descripción textual y requiere cotejo con la imagen antes de producir el hero.

## Higgsfield

Consulta de catálogo y detalle realizada sin generar: Kling 2.6 admite 5/10 s; Kling 3.0 permite 3–15 s, modos std/pro/4k, sonido opcional y referencias start_image/end_image. Se propone Kling 3.0 para el mirador por control de extremos, sin prometer consistencia perfecta ni transparencia. Cotización consultada: 8 s, pro, sound off, 16:9, una variante = **14 créditos**. No se enviaron imágenes ni se creó un job; la cotización no valida preparación de referencias. Véase plan de producción.

## Fuentes primarias

- [R1 — Node releases](https://nodejs.org/en/about/previous-releases)
- [R2 — Prisma v7 requisitos](https://docs.prisma.io/docs/orm/v7/reference/system-requirements)
- [R3 — Next layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
- [R3b — Next instalación](https://nextjs.org/docs/app/getting-started/installation)
- [R4 — Prisma v7](https://www.prisma.io/docs/orm/v7)
- [R5 — Fastify LTS](https://fastify.dev/docs/latest/Reference/LTS/)
- [R6 — Tailwind compatibilidad](https://tailwindcss.com/docs/compatibility)
- [R7 — GSAP React](https://gsap.com/resources/React/)
- [R8 — MDN autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [R9 — W3C Web Audio, §1.22.4](https://www.w3.org/TR/webaudio-1.1/)
- [R10 — hls.js oficial](https://github.com/video-dev/hls.js)
- [R11 — MDN Media Session](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
- [R12 — OWASP ASVS](https://asvs.owasp.org/)
- [R12b — OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [R13 — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [R14 — PostgreSQL versionado](https://www.postgresql.org/support/versioning/)
- [R15 — BBC Audio acceso](https://help.bbc.com/hc/en-us/articles/52290365445779-How-do-I-access-BBC-Audio-content)
- [R16 — BBC Sounds internacional](https://help.bbc.com/hc/en-us/articles/42652680528659-Update-on-access-to-BBC-Sounds-outside-the-UK)
- [R17 — CARDER municipios](https://www.carder.gov.co/informacion-pot-municipios/)

Las decisiones de tiempos de reconexión, presupuestos y permisos en los otros documentos son propuestas de este proyecto, no requisitos atribuidos a esas fuentes.
