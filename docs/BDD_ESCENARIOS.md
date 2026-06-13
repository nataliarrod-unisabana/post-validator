# Escenarios BDD — Proyecto Integrador TYVS

Documento derivado del Plan de Pruebas (Activity 2).
Cada escenario está expresado en formato **Given–When–Then** y mapeado al servicio y test correspondiente.

---

## HU1 — Crear y publicar un post

**Como** administrador, **quiero** crear y publicar un post **para que** mis suscriptores puedan leerlo.

### Escenario 1.1 — Post válido
```
Given: un post con título "Mi primer post", contenido válido y authorId 1
When:  intento guardarlo
Then:  el resultado debe ser VALID
```
→ Servicio: `PostValidator` | Test: `should return VALID when post has all required fields`

### Escenario 1.2 — Título vacío
```
Given: un post con título vacío ""
When:  intento guardarlo
Then:  el resultado debe ser EMPTY_TITLE
       el post NO debe persistirse en el repositorio
```
→ Servicio: `PostValidator` | Test: `should return EMPTY_TITLE when title is empty string`

### Escenario 1.3 — Título solo espacios
```
Given: un post con título "   " (solo espacios en blanco)
When:  intento guardarlo
Then:  el resultado debe ser EMPTY_TITLE
```
→ Servicio: `PostValidator` | Test: `should return EMPTY_TITLE when title is only whitespace`

### Escenario 1.4 — Título en el límite válido
```
Given: un post con título de exactamente 255 caracteres
When:  intento guardarlo
Then:  el resultado debe ser VALID
```
→ Servicio: `PostValidator` | Test: `should return VALID when title has exactly 255 characters`

### Escenario 1.5 — Título fuera del límite
```
Given: un post con título de 256 caracteres
When:  intento guardarlo
Then:  el resultado debe ser TITLE_TOO_LONG
```
→ Servicio: `PostValidator` | Test: `should return TITLE_TOO_LONG when title exceeds 255 characters`

### Escenario 1.6 — Autor inválido
```
Given: un post con authorId = 0
When:  intento guardarlo
Then:  el resultado debe ser INVALID_AUTHOR
```
→ Servicio: `PostValidator` | Test: `should return INVALID_AUTHOR when authorId is zero`

### Escenario 1.7 — Autor negativo
```
Given: un post con authorId = -5
When:  intento guardarlo
Then:  el resultado debe ser INVALID_AUTHOR
```
→ Servicio: `PostValidator` | Test: `should return INVALID_AUTHOR when authorId is negative`

### Escenario 1.8 — Contenido vacío al publicar
```
Given: un post con status PUBLISHED y content vacío ""
When:  intento guardarlo
Then:  el resultado debe ser INVALID_CONTENT
```
→ Servicio: `PostValidator` | Test: `should return INVALID_CONTENT when content is empty and status is PUBLISHED`

---

## HU7 — Agregar componentes enriquecidos a un post

**Como** administrador, **quiero** agregar bloques de contenido enriquecido (imágenes, Markdown, HTML) **para** enriquecer el contenido publicado.

### Escenario 7.1 — HTML balanceado
```
Given: un bloque HTML con "<p>Hola <strong>mundo</strong></p>"
When:  valido el bloque
Then:  el resultado debe ser VALID
```
→ Servicio: `ContentSanitizer` | Test: `should return VALID when HTML block has balanced tags`

### Escenario 7.2 — HTML desbalanceado
```
Given: un bloque HTML con "<p>Hola <strong>mundo</p>"
When:  valido el bloque
Then:  el resultado debe ser MALFORMED_HTML
```
→ Servicio: `ContentSanitizer` | Test: `should return MALFORMED_HTML when HTML block has unclosed tag`

### Escenario 7.3 — HTML con script malicioso
```
Given: un bloque HTML que contiene "<script>alert('xss')</script>"
When:  valido el bloque
Then:  el resultado debe ser MALFORMED_HTML
```
→ Servicio: `ContentSanitizer` | Test: `should return MALFORMED_HTML when HTML contains script tag`

### Escenario 7.4 — HTML con self-closing
```
Given: un bloque HTML con "<p>Salto<br/>de línea</p>"
When:  valido el bloque
Then:  el resultado debe ser VALID
```
→ Servicio: `ContentSanitizer` | Test: `should return VALID when HTML block contains self-closing tag`

### Escenario 7.5 — Markdown válido
```
Given: un bloque MARKDOWN con "## Título\n\nContenido en **negrita**"
When:  valido el bloque
Then:  el resultado debe ser VALID
```
→ Servicio: `ContentSanitizer` | Test: `should return VALID when MARKDOWN block has any content`

### Escenario 7.6 — Bloque vacío
```
Given: un bloque de cualquier tipo con content = ""
When:  valido el bloque
Then:  el resultado debe ser INVALID_CONTENT
```
→ Servicio: `ContentSanitizer` | Test: `should return INVALID_CONTENT when block content is empty`

### Escenario 7.7 — Imagen con URL válida
```
Given: un bloque IMAGE con URL "https://ejemplo.com/foto.jpg"
When:  valido el bloque
Then:  el resultado debe ser VALID
```
→ Servicio: `ContentSanitizer` | Test: `should return VALID when IMAGE block has valid https URL`

### Escenario 7.8 — Imagen con URL inválida
```
Given: un bloque IMAGE con URL "foto.jpg" (sin protocolo http/https)
When:  valido el bloque
Then:  el resultado debe ser INVALID_CONTENT
```
→ Servicio: `ContentSanitizer` | Test: `should return INVALID_CONTENT when IMAGE block has invalid URL`

---

## HU8 — Filtrar, buscar y ordenar posts

**Como** administrador, **quiero** filtrar, buscar y ordenar posts desde el panel **para** gestionar eficientemente el contenido publicado.

### Escenario 8.1 — Filtrar por estado PUBLISHED
```
Given: una lista con 2 posts PUBLISHED y 2 posts DRAFT
When:  filtro por estado PUBLISHED
Then:  obtengo exactamente 2 posts
       todos los posts retornados tienen status PUBLISHED
```
→ Servicio: `PostFilterService` | Test: `should return only PUBLISHED posts when filtering by PUBLISHED status`

### Escenario 8.2 — Filtrar por estado sin resultados
```
Given: una lista con solo posts DRAFT y PUBLISHED
When:  filtro por estado SCHEDULED
Then:  obtengo un array vacío
```
→ Servicio: `PostFilterService` | Test: `should return empty array when no post matches the status`

### Escenario 8.3 — Filtrar por autor
```
Given: una lista con posts de authorId 100 y authorId 200
When:  filtro por authorId 100
Then:  obtengo solo los posts del autor 100
```
→ Servicio: `PostFilterService` | Test: `should return only posts of given author when filtering by authorId`

### Escenario 8.4 — Búsqueda case-insensitive
```
Given: un post con título "TypeScript Avanzado"
When:  busco por "typescript" (minúsculas)
Then:  el post debe aparecer en los resultados
```
→ Servicio: `PostFilterService` | Test: `should perform case-insensitive substring search on title`
⚠️ Bug conocido: la implementación actual NO es case-insensitive. El test fallará en RED.

### Escenario 8.5 — Búsqueda sin coincidencias
```
Given: una lista de posts con títulos en español
When:  busco por "xyz123" (sin coincidencias)
Then:  obtengo un array vacío
```
→ Servicio: `PostFilterService` | Test: `should return empty array when title query does not match any post`

### Escenario 8.6 — Query vacío devuelve lista original
```
Given: una lista de 4 posts
When:  busco con query vacío ""
Then:  obtengo los 4 posts sin modificar
```
→ Servicio: `PostFilterService` | Test: `should return original list unchanged when query is empty string`

### Escenario 8.7 — Ordenar ASC
```
Given: posts con títulos "B", "A", "C"
When:  ordeno por título ASC
Then:  el orden debe ser A, B, C
```
→ Servicio: `PostFilterService` | Test: `should sort posts ASC by title alphabetically`

### Escenario 8.8 — Ordenar DESC
```
Given: posts con títulos "B", "A", "C"
When:  ordeno por título DESC
Then:  el orden debe ser C, B, A
```
→ Servicio: `PostFilterService` | Test: `should sort posts DESC by title alphabetically`

---

## HU9 — Programar publicación de un post

**Como** administrador, **quiero** programar la publicación de un post para una fecha futura **para** automatizar la gestión del contenido.

### Escenario 9.1 — Fecha válida en el futuro
```
Given: una fecha 1 hora en el futuro
When:  intento programar la publicación
Then:  el resultado debe ser VALID
```
→ Servicio: `PostScheduler` | Test: `should return VALID when date is 1 hour in the future`

### Escenario 9.2 — Fecha en el pasado
```
Given: una fecha 1 hora en el pasado
When:  intento programar la publicación
Then:  el resultado debe ser INVALID_SCHEDULE_DATE
```
→ Servicio: `PostScheduler` | Test: `should return INVALID_SCHEDULE_DATE when date is in the past`

### Escenario 9.3 — Fecha igual al momento actual
```
Given: una fecha exactamente igual al momento actual
When:  intento programar la publicación
Then:  el resultado debe ser INVALID_SCHEDULE_DATE
```
→ Servicio: `PostScheduler` | Test: `should return INVALID_SCHEDULE_DATE when date equals current moment`

### Escenario 9.4 — Menos de 5 minutos en el futuro
```
Given: una fecha 4 minutos en el futuro
When:  intento programar la publicación
Then:  el resultado debe ser INVALID_SCHEDULE_DATE
```
→ Servicio: `PostScheduler` | Test: `should return INVALID_SCHEDULE_DATE when date is less than 5 minutes in the future`

### Escenario 9.5 — Exactamente 5 minutos en el futuro
```
Given: una fecha exactamente 5 minutos en el futuro
When:  intento programar la publicación
Then:  el resultado debe ser VALID
```
→ Servicio: `PostScheduler` | Test: `should return VALID when date is exactly 5 minutes in the future`

### Escenario 9.6 — Más de 1 año en el futuro
```
Given: una fecha 1 año y 1 día en el futuro
When:  intento programar la publicación
Then:  el resultado debe ser INVALID_SCHEDULE_DATE
```
→ Servicio: `PostScheduler` | Test: `should return INVALID_SCHEDULE_DATE when date exceeds 1 year in the future`

### Escenario 9.7 — Exactamente 1 año en el futuro
```
Given: una fecha exactamente 1 año en el futuro
When:  intento programar la publicación
Then:  el resultado debe ser VALID
```
→ Servicio: `PostScheduler` | Test: `should return VALID when date is exactly 1 year in the future`

---

## HU10 — Configurar nivel de acceso de un post

**Como** administrador, **quiero** configurar el nivel de acceso de un post (público, solo miembros, pago) **para** controlar quién puede ver el contenido.

### Escenario 10.1 — Post PUBLIC accesible para ANONYMOUS
```
Given: un post con accessLevel PUBLIC
       un usuario ANONYMOUS (sin sesión)
When:  verifico si el usuario puede acceder
Then:  el resultado debe ser true
```
→ Servicio: `AccessControlService` | Test: `should allow access when post is PUBLIC and user is ANONYMOUS`

### Escenario 10.2 — Post MEMBERS denegado para ANONYMOUS
```
Given: un post con accessLevel MEMBERS
       un usuario ANONYMOUS (sin sesión)
When:  verifico si el usuario puede acceder
Then:  el resultado debe ser false
```
→ Servicio: `AccessControlService` | Test: `should deny access when post is MEMBERS and user is ANONYMOUS`

### Escenario 10.3 — Post MEMBERS accesible para MEMBER
```
Given: un post con accessLevel MEMBERS
       un usuario con tipo MEMBER
When:  verifico si el usuario puede acceder
Then:  el resultado debe ser true
```
→ Servicio: `AccessControlService` | Test: `should allow access when post is MEMBERS and user is MEMBER`

### Escenario 10.4 — Post PAID denegado para MEMBER
```
Given: un post con accessLevel PAID
       un usuario con tipo MEMBER (membresía básica)
When:  verifico si el usuario puede acceder
Then:  el resultado debe ser false
```
→ Servicio: `AccessControlService` | Test: `should deny access when post is PAID and user is MEMBER`

### Escenario 10.5 — Post PAID accesible para PAID_MEMBER
```
Given: un post con accessLevel PAID
       un usuario con tipo PAID_MEMBER
When:  verifico si el usuario puede acceder
Then:  el resultado debe ser true
```
→ Servicio: `AccessControlService` | Test: `should allow access when post is PAID and user is PAID_MEMBER`

### Escenario 10.6 — ADMIN siempre tiene acceso
```
Given: un post con accessLevel PAID (el más restrictivo)
       un usuario con tipo ADMIN
When:  verifico si el usuario puede acceder
Then:  el resultado debe ser true
```
→ Servicio: `AccessControlService` | Test: `should allow access for ADMIN regardless of access level`

---

## Tabla de trazabilidad completa

| HU | Escenario | Servicio | Persona | Nivel de prueba |
|---|---|---|---|---|
| HU1 | 1.1 — Post válido | PostValidator | A | Unitaria |
| HU1 | 1.2 — Título vacío | PostValidator | A | Unitaria |
| HU1 | 1.3 — Título solo espacios | PostValidator | A | Unitaria |
| HU1 | 1.4 — Título límite 255 | PostValidator | A | Unitaria |
| HU1 | 1.5 — Título 256 caracteres | PostValidator | A | Unitaria |
| HU1 | 1.6 — Author inválido (0) | PostValidator | A | Unitaria |
| HU1 | 1.7 — Author negativo | PostValidator | A | Unitaria |
| HU1 | 1.8 — Contenido vacío al publicar | PostValidator | A | Unitaria |
| HU7 | 7.1 — HTML balanceado | ContentSanitizer | A | Unitaria |
| HU7 | 7.2 — HTML desbalanceado | ContentSanitizer | A | Unitaria |
| HU7 | 7.3 — HTML con script | ContentSanitizer | A | Unitaria |
| HU7 | 7.4 — HTML self-closing | ContentSanitizer | A | Unitaria |
| HU7 | 7.5 — Markdown válido | ContentSanitizer | A | Unitaria |
| HU7 | 7.6 — Bloque vacío | ContentSanitizer | A | Unitaria |
| HU7 | 7.7 — IMAGE URL válida | ContentSanitizer | A | Unitaria |
| HU7 | 7.8 — IMAGE URL inválida | ContentSanitizer | A | Unitaria |
| HU8 | 8.1 — Filtrar por PUBLISHED | PostFilterService | A | Unitaria |
| HU8 | 8.2 — Filtrar sin resultados | PostFilterService | A | Unitaria |
| HU8 | 8.3 — Filtrar por autor | PostFilterService | A | Unitaria |
| HU8 | 8.4 — Búsqueda case-insensitive | PostFilterService | A | Unitaria |
| HU8 | 8.5 — Búsqueda sin coincidencias | PostFilterService | A | Unitaria |
| HU8 | 8.6 — Query vacío | PostFilterService | A | Unitaria |
| HU8 | 8.7 — Ordenar ASC | PostFilterService | A | Unitaria |
| HU8 | 8.8 — Ordenar DESC | PostFilterService | A | Unitaria |
| HU9 | 9.1 — Fecha válida | PostScheduler | A | Unitaria |
| HU9 | 9.2 — Fecha en el pasado | PostScheduler | A | Unitaria |
| HU9 | 9.3 — Fecha igual al ahora | PostScheduler | A | Unitaria |
| HU9 | 9.4 — Menos de 5 min | PostScheduler | A | Unitaria |
| HU9 | 9.5 — Exactamente 5 min | PostScheduler | A | Unitaria |
| HU9 | 9.6 — Más de 1 año | PostScheduler | A | Unitaria |
| HU9 | 9.7 — Exactamente 1 año | PostScheduler | A | Unitaria |
| HU10 | 10.1 — PUBLIC + ANONYMOUS | AccessControlService | A | Unitaria |
| HU10 | 10.2 — MEMBERS + ANONYMOUS | AccessControlService | A | Unitaria |
| HU10 | 10.3 — MEMBERS + MEMBER | AccessControlService | A | Unitaria |
| HU10 | 10.4 — PAID + MEMBER | AccessControlService | A | Unitaria |
| HU10 | 10.5 — PAID + PAID_MEMBER | AccessControlService | A | Unitaria |
| HU10 | 10.6 — PAID + ADMIN | AccessControlService | A | Unitaria |
| HU1+HU10 | Post válido persiste | PostService + Repo | B | Integración |
| HU1 | Post inválido no persiste | PostService + Repo | B | Integración |
| HU10 | MEMBERS bloqueado para ANONYMOUS | PostService + Repo | B | Integración |
| HU1 | save() llamado en post válido | PostService (mock) | B | Integración mock |
| HU1 | save() NO llamado en post inválido | PostService (mock) | B | Integración mock |
| HU1 | POST /api/posts válido → 201 | PostController | B | Sistema |
| HU1 | POST /api/posts sin título → 400 | PostController | B | Sistema |
| HU1+HU7 | JSON malformado → 400 | PostController | B | Sistema |
| Todos | Carga normal (50 VUs) | API REST | C | Rendimiento |
| Todos | Punto de quiebre | API REST | C | Rendimiento |
| Todos | Pico repentino | API REST | C | Rendimiento |
| Todos | Resistencia sostenida | API REST | C | Rendimiento |
