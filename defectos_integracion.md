# Defectos — U4 Pruebas de Integración y Sistema

## DEF-U4-001 — Posts con accessLevel MEMBERS son accesibles sin restricción HTTP

- **Severidad**: Serio
- **Tipo de prueba**: Sistema HTTP
- **Endpoint o capa afectada**: GET /api/posts/:id
- **Descripción**:
  - Qué se esperaba: Al solicitar un post con `accessLevel: MEMBERS` sin enviar
    el header `x-user-type`, el sistema debería devolver 404 NOT_FOUND.
  - Qué ocurrió en realidad: Si no se envía el header, el sistema asume
    ANONYMOUS por defecto y aplica correctamente el filtro, pero la API no
    documenta este comportamiento ni valida que el header sea un valor válido.
- **Código HTTP recibido vs esperado**: 404 (correcto) pero sin validación de input
- **Causa raíz**: En `PostController.ts` línea 38, se hace cast directo del header
  sin validar que sea un valor del enum `UserType`. Un valor inválido como
  `x-user-type: HACKER` no genera error.
- **Corrección aplicada**: Pendiente — validar que el header sea un valor
  válido del enum `UserType` y devolver 400 si no lo es.
- **Estado**: Abierto

---

## DEF-U4-002 — Endpoint POST /api/posts no retorna mensaje descriptivo de error

- **Severidad**: Moderado
- **Tipo de prueba**: Sistema HTTP
- **Endpoint o capa afectada**: POST /api/posts
- **Descripción**:
  - Qué se esperaba: Cuando el body tiene errores de validación, devolver
    un JSON con `error` y `message` descriptivo (ej: "Title cannot be empty").
  - Qué ocurrió en realidad: Solo se devuelve el código del enum
    `ValidationResult` (ej: `"EMPTY_TITLE"`), lo cual requiere que el cliente
    conozca los códigos internos del sistema.
- **Código HTTP recibido vs esperado**: 400 con `{"error":"EMPTY_TITLE"}` vs
  400 con `{"error":"EMPTY_TITLE","message":"Title cannot be empty"}`
- **Causa raíz**: En `PostController.ts` línea 22, solo se incluye
  `result.error` en la respuesta sin mensaje descriptivo.
- **Corrección aplicada**: Pendiente — agregar un mapper de `ValidationResult`
  a mensajes legibles para humanos.
- **Estado**: Abierto

---

## DEF-U4-003 — Body JSON malformado retorna error genérico BAD_REQUEST

- **Severidad**: Leve
- **Tipo de prueba**: Sistema HTTP
- **Endpoint o capa afectada**: POST /api/posts
- **Descripción**:
  - Qué se esperaba: Cuando el cliente envía un JSON inválido (sintaxis rota),
    devolver error específico `MALFORMED_JSON`.
  - Qué ocurrió en realidad: Express captura el error antes que el controller
    y devuelve un HTML de error genérico de Express con status 400.
- **Código HTTP recibido vs esperado**: 400 HTML vs 400 JSON con
  `{"error":"MALFORMED_JSON"}`
- **Causa raíz**: Falta un middleware de manejo de errores JSON en `app.ts`
  que capture errores de `express.json()` y los traduzca a respuestas JSON.
- **Corrección aplicada**: Pendiente — agregar middleware error handler
  global que detecte `SyntaxError` y responda con JSON.
- **Estado**: Abierto

---

## Convenciones de Estado

- **Abierto**: Defecto identificado sin corrección aplicada.
- **En progreso**: En proceso de corrección.
- **Resuelto**: Corregido y validado con pruebas.
