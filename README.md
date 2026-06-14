# Post Validator — Proyecto Integrador TYVS

**Curso**: Testing y Validación de Software
**Programa**: Maestría en Ingeniería de Software — Universidad de La Sabana
**Año**: 2026

## Integrantes

Ver [integrantes.txt](./integrantes.txt).

---

## Descripción

Post Validator es una API REST que implementa la lógica de negocio de una plataforma de publicación de contenido, inspirada en el dominio del CMS Ghost analizado en la Actividad 2 del curso.

El proyecto cubre las tres fases del proyecto integrador:

- **U3** — Pruebas Unitarias con TDD, patrón AAA y BDD
- **U4** — Pruebas de Integración y Sistema con pipeline CI/CD
- **U5** — Pruebas de Carga y Rendimiento con k6

---

## Arquitectura

El proyecto sigue los principios de Arquitectura Limpia, organizado en capas donde las dependencias siempre apuntan hacia adentro.

    src/
     ├── domain/              (Reglas de negocio puras, sin dependencias externas)
     │   ├── model/           (Entidades y tipos de datos)
     │   └── service/         (Servicios de validación)
     ├── application/         (Casos de uso y contratos)
     ├── infrastructure/      (Implementación del repositorio en memoria)
     └── delivery/rest/       (Endpoints HTTP con Express)

    tests/
     ├── unit/                (Pruebas unitarias - U3)
     ├── integration/         (Pruebas de integración - U4)
     └── system/              (Pruebas de sistema - U4)

    perf/
     ├── scripts/             (Scripts k6 - U5)
     └── results/             (Resultados de ejecuciones)

---

## Modelos de dominio

### Post

| Campo | Tipo | Descripción |
|---|---|---|
| id | number | Identificador único auto-generado |
| title | string | Título del post (obligatorio, máx 255 caracteres) |
| content | string | Contenido del post |
| authorId | number | ID del autor (debe ser mayor a 0) |
| status | PostStatus | Estado actual del post |
| accessLevel | AccessLevel | Nivel de acceso configurado |
| scheduledFor | Date o null | Fecha programada de publicación |
| contentBlocks | ContentBlock[] | Bloques de contenido enriquecido |

### PostStatus

| Valor | Descripción |
|---|---|
| DRAFT | Borrador |
| SCHEDULED | Programado para publicación futura |
| PUBLISHED | Publicado |

### AccessLevel

| Valor | Descripción |
|---|---|
| PUBLIC | Accesible para cualquier usuario |
| MEMBERS | Solo usuarios con membresía |
| PAID | Solo usuarios con membresía de pago |

### UserType

| Valor | Descripción |
|---|---|
| ANONYMOUS | Sin sesión |
| MEMBER | Membresía básica |
| PAID_MEMBER | Membresía de pago |
| ADMIN | Acceso total |

### ValidationResult

| Valor | Descripción |
|---|---|
| VALID | Operación válida |
| EMPTY_TITLE | Título vacío o solo espacios |
| TITLE_TOO_LONG | Título mayor a 255 caracteres |
| INVALID_AUTHOR | AuthorId inválido (0 o negativo) |
| INVALID_CONTENT | Contenido vacío al publicar |
| INVALID_SCHEDULE_DATE | Fecha de programación inválida |
| ACCESS_DENIED | Usuario sin acceso al post |
| MALFORMED_HTML | HTML con etiquetas desbalanceadas |

---

## Servicios de dominio

| Servicio | Responsabilidad | Historia de usuario |
|---|---|---|
| PostValidator | Valida campos obligatorios del post | HU1 |
| PostScheduler | Valida fechas de publicación programada | HU9 |
| AccessControlService | Controla acceso según nivel y tipo de usuario | HU10 |
| PostFilterService | Filtra, busca y ordena posts | HU8 |
| ContentSanitizer | Valida bloques de contenido enriquecido | HU7 |

---

## Endpoints de la API REST

El servidor corre en http://localhost:3000

| Método | Endpoint | Descripción | Respuesta exitosa |
|---|---|---|---|
| GET | /health | Estado del servidor | 200 { status: 'OK' } |
| POST | /api/posts | Crear un post | 201 con el post creado |
| GET | /api/posts | Listar todos los posts | 200 con array de posts |
| GET | /api/posts/:id | Obtener post por ID | 200 con el post |
| DELETE | /api/posts/:id | Eliminar post | 204 sin contenido |

### Códigos de error

| Código | Descripción |
|---|---|
| 400 EMPTY_TITLE | El título está vacío |
| 400 MALFORMED_JSON | El body no es JSON válido |
| 400 INVALID_ID | El ID en la URL no es un número |
| 404 NOT_FOUND | El post no existe o no tienes acceso |

---

## Requisitos

- Node.js 20 LTS o superior
- pnpm 9 o superior: npm install -g pnpm
- k6 solo para U5: https://k6.io/docs/get-started/installation/

---

## Instalación

    pnpm install

## Ejecutar el servicio

    pnpm start

Verificar que funciona abriendo http://localhost:3000/health en el navegador.

## Ejecutar pruebas

    pnpm test                 (todas las pruebas)
    pnpm test:unit            (solo unitarias)
    pnpm test:integration     (solo integración)
    pnpm test:system          (solo sistema)
    pnpm test:coverage        (con reporte de cobertura)

---

## Documentación

| Documento | Descripción |
|---|---|
| docs/BDD_ESCENARIOS.md | Escenarios BDD derivados del Activity 2 |
| docs/PERSONA_A_U3.md | Guía de pruebas unitarias |
| docs/PERSONA_B_U4.md | Guía de pruebas de integración y sistema |
| docs/PERSONA_C_U5.md | Guía de pruebas de carga y rendimiento |
| docs/PERSONA_ABC_U6.md | Guía de gestión de defectos |
| defectos_unitarias.md | Defectos encontrados en U3 |
| defectos_integracion.md | Defectos encontrados en U4 |
| perf/defectos_rendimiento.md | Defectos de rendimiento en U5 |
