# Modelo de datos lógico

Propuesta para revisión, sin DDL ni migraciones. UUID como identificador interno, timestamps UTC, timezone IANA para calendario; slugs de presentación no sustituyen IDs. `stationId` obligatorio en recursos propios de estación. Los catálogos geográficos son globales y su edición queda reservada. Datos DEMO identificados con `isDemo` y nunca publicados como hechos institucionales.

## Identidad, territorio y señal

| Entidad | Campos y relaciones principales | Restricciones |
|---|---|---|
| User | id, emailNormalized, passwordHash, status | Email único; secretos no salen en DTO |
| Session | userId, tokenHash, expiresAt, revokedAt, authVersion | Token opaco; caducidad y revocación |
| Role / Permission | code, description | Códigos únicos |
| RolePermission | roleId, permissionId | Par único |
| StationMembership | userId, stationId, active | Par único |
| MembershipRole | membershipId, roleId | Par único; sin alcance global implícito |
| GlobalRoleAssignment | userId, roleId | Solo concesión explícita de SUPER_ADMIN |
| Municipality | id, officialCode?, name, slug, departmentCode?, geometryAssetId? | Slug único; código oficial pendiente de verificar |
| Station | id, slug, displayName, frequencyLabel?, timezone, status, isDemo | Frecuencia opcional textual; no deducir cobertura |
| Stream | id, stationId, protocol, url, priority, enabled, contentEquivalent, corsVerifiedAt? | Station 1:N Stream; URL validada y redacción de logs |
| Coverage | stationId, municipalityId, kind, verifiedAt, evidence | N:M; distinguir editorial/digital/FM; no sembrar vínculos no confirmados |

La API expone `primaryStreamUrl` y `backupStreamUrl` derivados de Stream por prioridad y autorización. Evitar duplicar URLs en Station: una única fuente de verdad. Varios endpoints pueden servir la misma señal; otra programación independiente requiere otra Station o una revisión explícita del modelo de señal. Credenciales se almacenan en secretos, no incrustadas en campos públicos de URL.

## Programación y personas

| Entidad | Campos principales | Reglas |
|---|---|---|
| Host | stationId, name, slug, bio, photoMediaId, socialLinks, active, isDemo | No confundir perfil público con User; vinculación opcional |
| HostMunicipality | hostId, municipalityId, stationId | Relación editorial |
| Program | stationId, name, slug, description, coverMediaId, active, isDemo | Slug único por estación |
| ProgramHost | programId, hostId, stationId | Ambos de misma estación |
| ProgramMunicipality | programId, municipalityId, stationId | No altera señal |
| ScheduleRule | stationId, programId, weekday, localStart, localEnd, endDayOffset, timezone, validFrom, validUntil, status | endDayOffset permite cruzar medianoche |
| ScheduleException | stationId, date, ruleId?, action, replacementProgramId?, startAt?, endAt? | Cancelación/reemplazo explícitos |
| ScheduleOccurrence | stationId, programId, startsAt, endsAt, sourceRuleId?, status | Ventanas [inicio, fin); endsAt > startsAt |
| OccurrenceHost | occurrenceId, hostId, stationId | Permite suplentes sin reescribir programa |

Reglas generan ocurrencias para un horizonte definido, propuesta 8 semanas, mediante job idempotente y versión de agenda. Excepciones prevalecen. Rechazar solapes de ocurrencias activas de la misma estación con restricción PostgreSQL por rango o bloqueo transaccional verificable. La extensión requerida por una exclusion constraint se revisará con el proveedor. No basta una comprobación previa fuera de transacción. Desempates no silenciosos. Sin franja: «Programación pendiente», no programa inventado. Now/next por instantes UTC; presentación America/Bogota. Prever cambio de zona si la plataforma se expande.

## Editorial y multimedia

| Entidad | Campos principales | Relaciones / invariantes |
|---|---|---|
| Article | stationId, title, slug, summary, body, authorUserId, featuredMediaId, status, publishedAt?, scheduledAt?, seoTitle?, seoDescription?, version, isDemo | Slug único por estación; versión para edición concurrente |
| ArticleMunicipality | articleId, municipalityId, stationId | N:M, una noticia puede afectar varios municipios |
| Category / Tag | stationId, name, slug | Separados por estación |
| ArticleCategory / ArticleTag | articleId, categoryId/tagId, stationId | Mismo tenant |
| ArticleMedia | articleId, mediaId, sortOrder, caption | Galería ordenada |
| ContentRevision | stationId, entityType, entityId, authorId, snapshot, createdAt | Historial editorial; validar referencia en servicio |
| Podcast | stationId, title, slug, description, coverMediaId, programId?, status | Serie independiente |
| PodcastEpisode | stationId, podcastId, title, slug, description, audioMediaId, durationSeconds?, publishedAt, status | Duración verificada por procesamiento |
| EpisodeHost | episodeId, hostId, stationId | N:M |
| Event | stationId, name, slug, description, municipalityId, venue?, startsAt, endsAt?, featuredMediaId, status, isDemo | Fecha final no anterior a inicio |
| Media | stationId, objectKey, mimeDetected, bytes, width?, height?, duration?, checksum, status, rightsNote, altText? | Binario externo; nunca blob grande PostgreSQL |

Flujo Article: DRAFT → REVIEW → PUBLISHED o SCHEDULED → PUBLISHED → ARCHIVED. Devolver REVIEW a DRAFT con motivo. Publicar requiere permiso y validación completa; no un PATCH genérico de status. Job programado verifica versión, permiso de publicación registrado, status y fecha antes de publicar, idempotentemente. Cancelar programación evita publicación posterior. Consultas públicas filtran estado, fecha e isDemo según entorno; borradores privados aunque se adivine slug. Re-publicar requiere revisión y auditoría.

## Comunidad, negocio y operación

| Entidad | Campos / relación | Restricción |
|---|---|---|
| Sponsor | stationId, name, logoMediaId, website?, active, isDemo | Datos comerciales confirmados |
| Campaign | stationId, sponsorId, name, placement, startsAt, endsAt, creativeMediaId, targetUrl, status | URL permitida; sin HTML/JS arbitrario |
| CampaignMunicipality / CampaignProgram | campaignId, municipalityId/programId, stationId | Segmentación explícita |
| EventSponsor | eventId, sponsorId, stationId | N:M |
| CampaignDailyMetric | campaignId, day, impressions, clicks | Agregados orientativos; no equivalen a facturación auditada |
| Poll / PollOption | stationId, question, startsAt, endsAt, status / pollId, text, order | Opción pertenece a encuesta |
| PollVote | stationId, pollId, optionId, voterKeyHash, createdAt | Unicidad por poll/voterKey; anónimo no garantiza una persona/un voto |
| Submission | stationId, municipalityId?, type, text?, mediaId?, contactEncrypted?, consentVersion, status | PENDING/APPROVED/REJECTED; contacto nunca público |
| StreamHealthCheck | stationId, streamId, status, checkedAt, latencyMs, failureReason, probeType | Historial acotado; índices por stream/fecha |
| Job / OutboxEvent | type, payload, status, runAt, leaseUntil, attempts, idempotencyKey | Claim atómico y clave única |
| AuditLog | stationId?, userId?, action, entity, entityId, timestamp, metadata, requestId | Append-only; globalidad justificada, sin secretos |

Concursos: usar Submission con formVersion y respuestas validadas contra schema versionado; no aceptar JSON arbitrario sin límites. No construir creador universal de formularios en MVP. Telemetría web agregada fuera de tablas transaccionales de negocio cuando crezca.

## Integridad y consultas

Toda referencia entre entidades de estación verifica igualdad de stationId. Implementar claves compuestas `(stationId,id)` y FKs compuestas donde corresponda para evitar relaciones cruzadas incluso ante un bug de servicio. Índices por `(stationId,status,publishedAt,id)`, `(stationId,startsAt)`, municipio/entidad y stream/fecha. Cursor con orden estable y límite máximo propuesto 50. Integridad referencial restrictiva en usuarios, publicaciones y auditoría; archivar en vez de borrar en cascada contenido histórico. Borrado de PII y medios sigue política de retención aprobada, no soft-delete indefinido por defecto.

No existe tabla genérica Content que duplique todas las entidades: Content es un concepto/contrato público federado sobre Article, Event y PodcastEpisode. Evita relaciones polimórficas innecesarias en el núcleo; ContentRevision y AuditLog son excepciones conscientes con validación de servicio.
