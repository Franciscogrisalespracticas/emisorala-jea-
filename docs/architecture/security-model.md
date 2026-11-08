# Seguridad y permisos

Objetivo: OWASP ASVS 5 nivel 2 para requisitos aplicables. No se afirma cumplimiento antes de implementar y verificar controles. Referencias primarias en research.md.

## Autorización

Decisión = sesión válida + permiso específico + membresía activa + alcance de estación + reglas del recurso. Denegar por defecto. Roles son conjuntos iniciales de permisos; no jerarquía implícita. La API deriva las estaciones permitidas desde la sesión y verifica cada ID de recurso. Ocultar botones no autoriza. Cambios de membresía revocan permisos efectivos en la siguiente solicitud; no mantener grants obsoletos en JWT de larga duración.

| Rol | Permisos iniciales | Límite |
|---|---|---|
| SUPER_ADMIN | platform.manage, stations.manage, grants.manage_global | Acceso excepcional global auditado |
| STATION_ADMIN | station.settings, station.members.manage, contenido y agenda de su estación | No conceder roles globales ni otra estación |
| DIRECTOR | editorial.approve, editorial.publish, programming.approve | Sin usuarios, secretos ni infraestructura |
| EDITOR | articles.edit_all, articles.review, articles.publish | Solo estación asignada |
| JOURNALIST | articles.create, articles.edit_own, articles.submit | Borradores propios; no publicación |
| PRODUCER | programs.manage, schedules.manage, podcasts.manage | Publicar agenda requiere programming.approve salvo delegación explícita |
| HOST | profile.edit_own, episodes.submit | Sin editar perfiles ajenos ni publicar automáticamente |
| COMMERCIAL | sponsors.manage, campaigns.manage, campaigns.metrics.read | Sin artículos, datos de participantes ni permisos |
| MODERATOR | submissions.review, polls.manage | Sin roles ni cambios de señal |

Permisos adicionales explícitos: streams.read_health, streams.manage, media.upload, media.review, audit.read. STATION_ADMIN recibe streams.manage de su estación; el proveedor secreto nunca se muestra en GET. `members.manage` solo asigna roles de un conjunto delegable predefinido; no permite otorgar permisos que quien delega no tiene. Último SUPER_ADMIN activo no puede quitarse por error. Eliminación y elevación requieren reautenticación y auditoría; MFA propuesta obligatoria para SUPER_ADMIN, recomendada para STATION_ADMIN.

## Autenticación propuesta

Sesiones opacas persistidas, cookie HttpOnly/Secure/SameSite=Lax, preferiblemente prefijo __Host- con Path=/ sin Domain cuando despliegue lo permita. Token aleatorio de alta entropía; hash en DB. Rotar al login, recuperación, MFA y elevación. Expiración por inactividad y absoluta configurable; propuesta admin 30 min/12 h, por validar con operación. Revocar al logout, cambio de contraseña o bloqueo. Contraseñas con Argon2id mediante implementación mantenida seleccionada y probada en Fase 5; parámetros ajustados por benchmark de infraestructura, no criptografía propia.

Recuperación con token de un solo uso, hash, caducidad corta y respuesta que no confirme existencia de correo. Rate limits por cuenta normalizada y origen, con backoff; no bloqueo irreversible explotable. Integrar MFA mediante proveedor/biblioteca revisada, con recovery codes hasheados y reautenticación para cambios. La selección exacta del proveedor de identidad depende de presupuesto; las rutas de negocio dependen de un contrato SessionPrincipal, no de su SDK.

Mutaciones con validación Origin y token CSRF ligado a sesión; SameSite no es sustituto de CSRF. CORS deny-by-default/allowlist si hay otro origen. Sin tokens sensibles en localStorage. Webhooks requieren autenticidad, timestamp/replay protection e idempotencia; solo cuando un proveedor real los necesite.

## Riesgos y controles de aplicación

| Superficie | Control exigido | Evidencia futura |
|---|---|---|
| IDOR/tenant escape | scope obligatorio y FKs compuestas | Dos estaciones, todos los roles, IDs cruzados |
| XSS editorial | Editor estructurado y sanitización servidor con allowlist | Payloads en texto, enlaces, pie de foto y metadata |
| Inyección SQL | Queries parametrizadas; raw SQL revisado | Casos sobre búsqueda, filtros y orden |
| Mass assignment | Schemas de entrada separados por comando | Intento de cambiar stationId, author o status no permitido |
| CSP | Orígenes mínimos, nonce/hash según render, media/connect separados | Report-only en staging y enforcement tras validar |
| SSRF monitoreo | HTTPS, hosts/puertos autorizados, DNS/IP y egress restringidos | IP privada/loopback/link-local/metadata, IPv6 y redirects |
| Upload abuse | Cuarentena, límites, firma real, procesamiento aislado | Archivo disfrazado, bomba de imagen, SVG activo |
| Abuso público | Límites por ruta, tamaño y tiempo; moderación | Ráfagas, formularios repetidos, votos automatizados |
| Datos privados | Minimización, cifrado y permisos separados | DTOs/logs sin contactos ni secretos |

SSRF: autorización de stream solo para personal habilitado; validar resolución y dirección usada al conectar, para mitigar DNS rebinding. Bloquear redirects por defecto o revalidar cada salto; no aceptar credenciales embebidas. HLS incluye URLs hijas de segmentos y claves: misma validación. Worker en red de egress restringido sin acceso a metadatos cloud ni servicios internos. Límites de tiempo, bytes, concurrencia y tamaño de manifests. No exponer un endpoint público «probar cualquier URL».

Uploads: emitir URL firmada corta para clave asignada por servidor y tamaño máximo; guardar en cuarentena. Confirmación no publica. Worker verifica bytes/firma, decodifica imagen, elimina EXIF cuando proceda, reencodea y analiza archivos; media APPROVED antes de exposición. No confiar en MIME declarado. SVG solo confiable del repositorio o sanitizado/rasterizado. Audio normalizado con límites de duración; ffmpeg, si se usa, aislado con cuotas. No permitir path del cliente ni servir archivos ejecutables. URLs temporales para objetos privados; política de limpieza de huérfanos y retención por aprobar.

Propuesta inicial de límites, ajustable: imagen 10 MB/20 megapíxeles, voz 20 MB/120 s, texto saludo 500 caracteres. Podcast subido solo por equipo autorizado con cuotas separadas. No aplicar límites inventados como política institucional sin revisión.

## Operación

Secrets manager/env servidor, rotación, no secretos NEXT_PUBLIC. Logs con requestId y redacción. Auditoría transaccional de publicación, permisos, stream y agenda. Cuenta DB de aplicación sin DDL; migraciones con identidad separada. CI revisa secretos, dependencias y permisos; backups cifrados y restore ensayado. Retención y consentimiento de comunidad requieren aprobación del responsable institucional. No ofrecer asesoría legal ni afirmar licencias musicales cubiertas por el desarrollo web.

Tests de permisos obligatorios por ruta/acción, incluidos borradores, previews, exportaciones, uploads y métricas. Las pruebas positivas de administrador por sí solas no prueban aislamiento.
