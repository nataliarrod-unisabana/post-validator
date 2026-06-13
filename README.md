# Post Validator — Proyecto Integrador TYVS

**Curso**: Testing y Validación de Software
**Programa**: Maestría en Ingeniería de Software — Universidad de La Sabana
**Año**: 2026

## Integrantes

Ver [`integrantes.txt`](./integrantes.txt).

---

## ¿Qué es este proyecto?

Post Validator es una **API REST** construida en TypeScript que simula la lógica de negocio de una plataforma de publicación de contenido (inspirada en Ghost CMS). Su propósito académico es servir como sistema base sobre el cual el equipo aplica las tres etapas del proyecto integrador del curso:

- **U3** — Pruebas Unitarias con TDD
- **U4** — Pruebas de Integración y Sistema con CI/CD
- **U5** — Pruebas de Carga y Rendimiento con k6

El sistema **no tiene base de datos real** — los posts se guardan en memoria (un `Map` de JavaScript). Esto es intencional: simplifica el entorno de pruebas sin perder la arquitectura en capas que el curso exige.

---

## Arquitectura del sistema

El proyecto sigue los principios de **Arquitectura Limpia (Clean Architecture)**, organizando el código en capas con una regla fundamental: **las dependencias siempre apuntan hacia adentro**. El dominio no conoce nada de HTTP ni de bases de datos.

```
src/
 ├── domain/              ← Corazón del sistema. Sin dependencias externas.
 │   ├── model/           ← Entidades y tipos de datos
 │   └── service/         ← Reglas de negocio puras
 ├── application/         ← Casos de uso. Orquesta dominio + repositorio.
 ├── infrastructure/      ← Implementación concreta del repositorio (en memoria)
 └── delivery/rest/       ← Capa HTTP. Recibe peticiones y devuelve respuestas.
```

### Diagrama de flujo de una petición

```
Cliente HTTP (Postman / Supertest / k6)
          ↓
  PostController          [delivery/rest]
  Recibe JSON, parsea campos
          ↓
  PostService             [application]
  Orquesta: valida primero, luego persiste
          ↓
  PostValidator           [domain/service]
  ¿El título es válido? ¿El autor existe?
          ↓ (si todo ok)
  PostScheduler           [domain/service]
  ¿La fecha programada es válida?
          ↓ (si todo ok)
  InMemoryPostRepository  [infrastructure]
  Guarda el post en el Map<id, Post>
          ↓
  201 Created + post guardado
```

### Regla clave de la arquitectura

```
delivery → application → domain
infrastructure → application → domain

NUNCA: domain → infrastructure
NUNCA: domain → delivery
```

---

## Modelos de dominio

### Post
La entidad principal del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador único auto-generado |
| `title` | string | Título del post (obligatorio, máx 255 caracteres) |
| `content` | string | Contenido del post |
| `authorId` | number | ID del autor (debe ser > 0) |
| `status` | PostStatus | Estado actual del post |
| `accessLevel` | AccessLevel | Nivel de acceso configurado |
| `scheduledFor` | Date \| null | Fecha programada de publicación |
| `contentBlocks` | ContentBlock[] | Bloques de contenido enriquecido |

### PostStatus (estados posibles)
```
DRAFT      → Borrador, no visible para suscriptores
SCHEDULED  → Programado para publicación futura
PUBLISHED  → Publicado y visible según accessLevel
```

### AccessLevel (niveles de acceso)
```
PUBLIC      → Cualquier persona puede leer (incluso sin sesión)
MEMBERS     → Solo usuarios con membresía activa
PAID        → Solo usuarios con membresía de pago
```

### UserType (tipos de usuario)
```
ANONYMOUS   → Sin sesión iniciada
MEMBER      → Miembro con membresía básica
PAID_MEMBER → Miembro con membresía de pago
ADMIN       → Administrador (acceso total)
```

### ValidationResult (resultados de validación)
```
VALID                → La operación es válida
EMPTY_TITLE          → El título está vacío o es solo espacios
TITLE_TOO_LONG       → El título supera los 255 caracteres
INVALID_AUTHOR       → El authorId es 0 o negativo
INVALID_CONTENT      → El contenido está vacío al publicar
INVALID_SCHEDULE_DATE → La fecha programada es inválida
ACCESS_DENIED        → El usuario no tiene acceso al post
MALFORMED_HTML       → El HTML tiene etiquetas desbalanceadas
```

---

## Los 5 servicios de dominio

Estos son los servicios que viven en `src/domain/service/`. Son clases puras — no conocen Express, ni el repositorio, ni nada externo.

### PostValidator
**Historia de usuario**: HU1 — Crear y publicar un post

Valida que un post tenga todos los campos obligatorios antes de guardarlo.

Reglas implementadas (parcialmente):
- R1 ✅ Título vacío → `EMPTY_TITLE`
- R2 ❌ Título > 255 caracteres → `TITLE_TOO_LONG` (pendiente TDD)
- R3 ❌ AuthorId <= 0 → `INVALID_AUTHOR` (pendiente TDD)
- R4 ❌ Contenido vacío al publicar → `INVALID_CONTENT` (pendiente TDD)

### PostScheduler
**Historia de usuario**: HU9 — Programar publicación

Valida que la fecha programada sea válida.

Reglas implementadas (parcialmente):
- R1 ✅ Fecha en el pasado → `INVALID_SCHEDULE_DATE`
- R2 ❌ Fecha < 5 min en el futuro → `INVALID_SCHEDULE_DATE` (pendiente TDD)
- R3 ❌ Fecha > 1 año en el futuro → `INVALID_SCHEDULE_DATE` (pendiente TDD)

### AccessControlService
**Historia de usuario**: HU10 — Control de acceso por nivel

Determina si un usuario puede acceder a un post dado su nivel de acceso.

Reglas implementadas (parcialmente):
- R1 ✅ Post PUBLIC → cualquiera puede acceder
- R2 ✅ ADMIN → siempre puede acceder
- R3 ❌ Post MEMBERS + MEMBER → puede acceder (pendiente TDD)
- R4 ❌ Post PAID + PAID_MEMBER → puede acceder (pendiente TDD)
- R5 ❌ Post MEMBERS + ANONYMOUS → no puede acceder (pendiente TDD)

### PostFilterService
**Historia de usuario**: HU8 — Filtrar y buscar posts

Filtra, busca y ordena listas de posts.

Reglas implementadas (parcialmente):
- R1 ✅ Filtrar por status
- R2 ✅ Filtrar por authorId
- R3 ❌ Búsqueda case-insensitive (pendiente TDD — bug conocido)
- R4 ✅ Búsqueda por substring
- R5 ✅ Ordenar ASC/DESC
- R6 ❌ Query vacío devuelve lista original (pendiente TDD)

### ContentSanitizer
**Historia de usuario**: HU7 — Contenido enriquecido

Valida bloques de contenido (HTML, Markdown, imágenes).

Reglas implementadas (parcialmente):
- R1 ✅ HTML balanceado → `VALID`
- R2 ✅ HTML desbalanceado → `MALFORMED_HTML`
- R3 ❌ HTML con `<script>` → `MALFORMED_HTML` (pendiente TDD)
- R4 ❌ IMAGE con URL inválida → `INVALID_CONTENT` (pendiente TDD)
- R5 ❌ Bloque vacío → `INVALID_CONTENT` (pendiente TDD)

---

## Endpoints de la API REST

El servidor corre en `http://localhost:3000`.

| Método | Endpoint | Descripción | Respuesta exitosa |
|---|---|---|---|
| GET | `/health` | Estado del servidor | `200 { status: 'OK' }` |
| POST | `/api/posts` | Crear un post | `201 { post }` |
| GET | `/api/posts` | Listar todos los posts | `200 [ ]` |
| GET | `/api/posts/:id` | Obtener post por ID | `200 { post }` |
| DELETE | `/api/posts/:id` | Eliminar post | `204` |

### Ejemplo: crear un post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primer post",
    "content": "Contenido del post",
    "authorId": 1,
    "status": "DRAFT",
    "accessLevel": "PUBLIC"
  }'
```

### Header especial para control de acceso
Para probar acceso restringido en GET /api/posts/:id:
```bash
curl http://localhost:3000/api/posts/1 \
  -H "x-user-type: ANONYMOUS"
# Devuelve 404 si el post es MEMBERS o PAID
```

### Códigos de error posibles
| Código | Cuándo ocurre |
|---|---|
| `400 EMPTY_TITLE` | El título está vacío |
| `400 MALFORMED_JSON` | El body no es JSON válido |
| `400 INVALID_ID` | El ID en la URL no es un número |
| `404 NOT_FOUND` | El post no existe o no tienes acceso |

---

## Cómo correr el proyecto

### Requisitos
- Node.js 20 LTS o superior
- pnpm 9+

### Instalación
```bash
pnpm install
```

### Levantar el servidor
```bash
pnpm start
# → [post-validator] listening on http://localhost:3000
```

### Verificar que funciona
Abrir en el navegador: `http://localhost:3000/health`
Respuesta esperada: `{"status":"OK"}`

### Correr los tests (cuando existan)
```bash
pnpm test                  # todos los tests
pnpm test:unit             # solo unitarios (U3)
pnpm test:integration      # solo integración (U4)
pnpm test:system           # solo sistema (U4)
pnpm test:coverage         # con reporte de cobertura
```

---

## Estructura de carpetas completa

```
post-validator/
 ├── src/                          ← Código fuente (NO modificar sin coordinación)
 │   ├── domain/
 │   │   ├── model/                ← Post, PostStatus, AccessLevel, UserType,
 │   │   │                            ValidationResult, ContentBlock
 │   │   └── service/              ← PostValidator, PostScheduler,
 │   │                                AccessControlService, PostFilterService,
 │   │                                ContentSanitizer
 │   ├── application/
 │   │   ├── PostRepository.ts     ← Interfaz del repositorio (contrato)
 │   │   └── PostService.ts        ← Orquestador de casos de uso
 │   ├── infrastructure/
 │   │   └── InMemoryPostRepository.ts ← Implementación en memoria
 │   └── delivery/rest/
 │       ├── PostController.ts     ← Endpoints HTTP
 │       ├── app.ts                ← Factory de Express
 │       └── server.ts             ← Punto de entrada del servidor
 │
 ├── tests/                        ← Zona de trabajo del equipo
 │   ├── unit/                     ← Persona A (U3)
 │   ├── integration/              ← Persona B (U4)
 │   └── system/                   ← Persona B (U4)
 │
 ├── perf/                         ← Zona de Persona C (U5)
 │   ├── scripts/                  ← Scripts k6 que Persona C crea
 │   ├── results/                  ← Outputs de ejecuciones k6
 │   └── defectos_rendimiento.md   ← Defectos de rendimiento
 │
 ├── docs/                         ← Guías por persona
 │   ├── PERSONA_A_U3.md
 │   ├── PERSONA_B_U4.md
 │   ├── PERSONA_C_U5.md
 │   └── PERSONA_ABC_U6.md
 │
 ├── .github/workflows/            ← Persona B configura el CI/CD aquí
 ├── defectos.md                   ← Defectos de U3
 ├── defectos_integracion.md       ← Defectos de U4
 ├── integrantes.txt
 ├── package.json
 ├── tsconfig.json
 ├── jest.config.js
 └── README.md
```

---

## Documentación por persona

| Persona | Unidad | Guía |
|---|---|---|
| A | U3 — Pruebas Unitarias | [docs/PERSONA_A_U3.md](./docs/PERSONA_A_U3.md) |
| B | U4 — Integración y Sistema | [docs/PERSONA_B_U4.md](./docs/PERSONA_B_U4.md) |
| C | U5 — Carga y Rendimiento | [docs/PERSONA_C_U5.md](./docs/PERSONA_C_U5.md) |
| A+B+C | U6 — Gestión de Defectos | [docs/PERSONA_ABC_U6.md](./docs/PERSONA_ABC_U6.md) |
