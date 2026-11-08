# Riesgos, pendientes y decisión

## Registro de riesgos

| Riesgo | Impacto | Mitigación / puerta |
|---|---|---|
| URL/proveedor desconocido | No hay radio real verificable | Fase 7 bloqueada hasta acceso autorizado |
| CORS o codec incompatible | Silencio/errores por navegador | Audio nativo primero, adaptador probado, visualizador decorativo |
| Audio remonta al navegar | Pérdida de escucha | Root público único y E2E con identidad y red |
| Suspensión móvil | Corte aunque el código sea correcto | Ensayo físico, reanudación honesta y límites comunicados |
| Cobertura inventada | Información falsa | Coverage sin relaciones hasta confirmación |
| Edición de otro tenant | Incidente de seguridad | Scope servidor, FKs compuestas y pruebas negativas |
| Probe de URLs arbitrarias | SSRF a red interna | Allowlist y egress aislado incluyendo HLS |
| Agenda solapada/nocturna | Ahora al aire incorrecto | Ocurrencias, excepciones y validación transaccional |
| CMS y caché divergen | Borrador o noticia vieja visible | DTO público estricto, outbox e invalidación |
| Hero pesado o clip mal integrado | Pérdida de rendimiento/credibilidad | Presupuesto de bytes, móvil separado, fallback estático |
| Dependencias cambian | Build/config incompatible | Verificar matriz exacta y lockfile antes de implementar |
| Demasiados procesos para el presupuesto | Operación cara | Reconsiderar Next único si presupuesto exige; no microservicios |
| Falta de permisos sobre media | Imposibilidad de publicación | Registro de derechos por asset y confirmación institucional |
| Votos/client analytics manipulados | Métricas comerciales engañosas | Agregados orientativos; proveedor para oyentes; no prometer antifraude completo |

## Decisiones propuestas para revisión

1. Monorepo, web pública Next, admin separado, API modular y worker PostgreSQL.
2. Node 24 LTS como candidato conservador; versiones exactas pendientes de matriz de instalación.
3. Player global con Context/reducer y motor separado de UI, sin Redux automático.
4. Municipio como filtro editorial; cobertura y señales solo por datos confirmados.
5. Sesiones opacas y permisos granulares de estación; MFA fuerte para superadministración.
6. CSS/capas 2D para hero, GSAP selectivo, sin 3D generalizado.
7. Kling 3.0 como candidato para el mirador; presupuesto de prueba cotizado, generación sin autorizar.
8. MVP editorial, audio y administración primero; IA editorial opcional después.

No se requiere elegir proveedor cloud para diseñar componentes DEMO. Sí debe elegirse antes de cerrar topología de despliegue, pools, sesiones y presupuesto operativo. La implementación exacta de autenticación debe seleccionarse antes de Fase 5; no construir criptografía propia.

## Información que debe entregar La Jefa

| Información | Por qué hace falta | Bloquea |
|---|---|---|
| Nombre legal/comercial, frecuencia confirmada, dominio y responsable | Identidad pública y acceso autorizado | Publicación institucional |
| Logo/manual e imagen hero aprobada | Dirección artística y fidelidad | Arte definitivo |
| URLs HTTPS principal/respaldo y codec/protocolo | Motor y pruebas reales | Fase 7 |
| Proveedor, límites, metadata y API de oyentes | Monitoreo, métricas y costes | Integración de proveedor |
| Mapa confirmado de estaciones/señales/cobertura | Relaciones territoriales | Señales por municipio |
| Horarios, zona, programas, locutores y excepciones | Ahora/siguiente y programación | Contenido real |
| Biografías, fotos, redes y contactos autorizados | Perfiles veraces | Publicación de perfiles |
| Noticias y política editorial, responsables de revisión | CMS operativo | Publicación editorial |
| Podcasts y derechos de publicación/retransmisión | Audio bajo demanda | Episodios reales |
| Eventos y patrocinadores confirmados | Fechas, anuncios y segmentación | Módulos comerciales reales |
| Usuarios/roles delegables y quién administra | Accesos y recuperación | Admin productivo |
| Privacidad, consentimiento, retención y concursos | Manejo de participación | Formularios públicos |
| Hosting, presupuesto y equipo de operación | Capacidad y mantenimiento | Despliegue productivo |
| RPO/RTO y disponibilidad esperada | Backup/restore y alertas | GO operativo |
| Navegadores/dispositivos predominantes | Compatibilidad y diseño | Matriz final de soporte |

No solicitar contraseñas por chat. Accesos se conceden por mecanismos seguros y secretos se cargan en el entorno correspondiente. Las URLs públicas de escucha no son credenciales administrativas.

## Estado de evidencia

Realizado: lectura íntegra del prompt, consultas de documentación oficial, inspección del catálogo y restricciones de modelos Higgsfield, cotización sin generación, diseño y revisión documental de esta propuesta, empaquetado y comprobación de integridad del entregable.

No realizado: inspección de código preexistente (no se entregó repositorio de La Jefa), inspección visual de imágenes anteriores, instalación, build, tests de aplicación, auditoría de seguridad, validación con PostgreSQL, pruebas de audio real, despliegue o creación de recursos productivos. La compatibilidad es documental y todavía necesita prueba de instalación. No confundir esta propuesta con software certificado o listo para producción.

# DECISIÓN DE ARQUITECTURA

**READY FOR IMPLEMENTATION**

La separación de dominios, persistencia de audio, modelo territorial, permisos y estrategia visual están suficientemente definidos para comenzar una implementación controlada con DEMO después de revisar esta arquitectura. La falta de stream y datos reales no impide construir y verificar componentes con fixtures.

Esta clasificación no aprueba producción: Fase 7 y salida pública están bloqueadas por datos/autorizaciones institucionales, proveedor, assets, pruebas y operación. Las decisiones de hosting e identidad deben cerrarse antes de sus fases dependientes. Si la exigencia fuera entregar una plataforma real operativa hoy, el estado sería BLOCKED.

**No se avanza a Fase 2 en esta entrega.** El siguiente paso es la revisión de esta arquitectura por el usuario antes de crear el proyecto definitivo.
