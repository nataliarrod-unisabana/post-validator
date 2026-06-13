# Guía Persona A — U3: Pruebas Unitarias con TDD

**Tu zona de trabajo**: `tests/unit/`
**También modificas**: `src/domain/service/` (para completar las reglas con TDD)
**Herramientas**: Jest + TypeScript

---

## ¿Qué vas a hacer?

Vas a aplicar **TDD (Test-Driven Development)** para completar las reglas de negocio de los 5 servicios del dominio. Esto significa que para cada regla nueva, el proceso es siempre el mismo:

1. **RED** — Escribes el test primero. El test falla porque el código no tiene esa regla aún.
2. **GREEN** — Vas al servicio y agregas el código mínimo para que el test pase.
3. **REFACTOR** — Limpias el código sin romper los tests.

Cada ciclo es un **commit separado**. El historial de git es la evidencia de TDD que el profe va a revisar en la Wiki.

---

## Setup inicial

```bash
# 1. Clonar el repo y entrar a la carpeta
git clone <url-del-repo>
cd post-validator

# 2. Instalar dependencias
pnpm install

# 3. Verificar que el proyecto funciona
pnpm test
# No debería haber tests aún — eso está bien

# 4. Crear tu rama de trabajo
git checkout -b feature/u3-unit-tests
```

---

## Estructura de tus archivos

Crea un archivo por servicio dentro de `tests/unit/domain/service/`:

```
tests/unit/domain/service/
 ├── PostValidator.test.ts
 ├── PostScheduler.test.ts
 ├── AccessControlService.test.ts
 ├── PostFilterService.test.ts
 └── ContentSanitizer.test.ts
```

---

## El patrón AAA — cómo escribir cada test

Todos tus tests deben seguir este patrón:

```typescript
it('should return EMPTY_TITLE when title is empty string', () => {
  // Arrange — preparar los datos
  const validator = new PostValidator();
  const post = new Post(1, '', 'Contenido válido', 100);

  // Act — ejecutar la acción
  const result = validator.validate(post);

  // Assert — verificar el resultado
  expect(result).toBe(ValidationResult.EMPTY_TITLE);
});
```

**Nomenclatura obligatoria**: `should<Resultado>When<Condicion>()`

---

## Escenarios BDD — cómo documentar en la Wiki

Para cada test, debes documentar el escenario en formato Given-When-Then:

```
Given: un post con título vacío
When:  intento validarlo
Then:  el resultado debe ser EMPTY_TITLE
```

---

## Servicio 1 — PostValidator (HU1)

**Archivo**: `tests/unit/domain/service/PostValidator.test.ts`
**Servicio**: `src/domain/service/PostValidator.ts`

### Imports necesarios
```typescript
import { PostValidator } from '../../../../src/domain/service/PostValidator';
import { Post } from '../../../../src/domain/model/Post';
import { ValidationResult } from '../../../../src/domain/model/ValidationResult';
import { PostStatus } from '../../../../src/domain/model/PostStatus';
import { AccessLevel } from '../../../../src/domain/model/AccessLevel';
```

### Reglas que debes implementar con TDD

**Regla R1 — título vacío** (ya implementada, sirve como ejemplo)
```typescript
it('should return EMPTY_TITLE when title is empty string', () => {
  // Arrange
  const validator = new PostValidator();
  const post = new Post(1, '', 'Contenido', 100);
  // Act
  const result = validator.validate(post);
  // Assert
  expect(result).toBe(ValidationResult.EMPTY_TITLE);
});
```

**Regla R1b — título solo espacios** (pendiente TDD)
```
Given: un post cuyo título es '   ' (solo espacios)
When:  intento validarlo
Then:  el resultado debe ser EMPTY_TITLE
```

**Regla R2 — título demasiado largo** (pendiente TDD)
```
Given: un post cuyo título tiene 256 caracteres
When:  intento validarlo
Then:  el resultado debe ser TITLE_TOO_LONG

Given: un post cuyo título tiene exactamente 255 caracteres
When:  intento validarlo
Then:  el resultado debe ser VALID
```

**Regla R3 — autor inválido** (pendiente TDD)
```
Given: un post con authorId = 0
When:  intento validarlo
Then:  el resultado debe ser INVALID_AUTHOR

Given: un post con authorId = -5
When:  intento validarlo
Then:  el resultado debe ser INVALID_AUTHOR
```

**Regla R4 — contenido vacío al publicar** (pendiente TDD)
```
Given: un post con status PUBLISHED y content vacío
When:  intento validarlo
Then:  el resultado debe ser INVALID_CONTENT
```

### Clases de equivalencia para PostValidator

| Clase | Entrada representativa | Resultado esperado |
|---|---|---|
| Título válido | 'Mi post' | VALID |
| Título vacío | '' | EMPTY_TITLE |
| Título solo espacios | '   ' | EMPTY_TITLE |
| Título en límite válido | 255 caracteres | VALID |
| Título fuera de límite | 256 caracteres | TITLE_TOO_LONG |
| Author válido | authorId = 1 | VALID |
| Author inválido | authorId = 0 | INVALID_AUTHOR |
| Author negativo | authorId = -1 | INVALID_AUTHOR |

---

## Servicio 2 — PostScheduler (HU9)

**Archivo**: `tests/unit/domain/service/PostScheduler.test.ts`
**Servicio**: `src/domain/service/PostScheduler.ts`

### Imports necesarios
```typescript
import { PostScheduler } from '../../../../src/domain/service/PostScheduler';
import { ValidationResult } from '../../../../src/domain/model/ValidationResult';
```

### Tip importante — controlar el tiempo en tests
El servicio acepta un segundo parámetro `now` para que puedas controlar la fecha actual:
```typescript
const FIXED_NOW = new Date('2026-01-15T10:00:00Z');
const scheduler = new PostScheduler();
scheduler.validateScheduledDate(fecha, FIXED_NOW); // usa FIXED_NOW como "ahora"
```

### Reglas que debes implementar con TDD

**Regla R1 — fecha en el pasado** (ya implementada, sirve como ejemplo)
```typescript
it('should return INVALID_SCHEDULE_DATE when date is in the past', () => {
  const FIXED_NOW = new Date('2026-01-15T10:00:00Z');
  const scheduler = new PostScheduler();
  const pastDate = new Date('2026-01-15T09:00:00Z');

  const result = scheduler.validateScheduledDate(pastDate, FIXED_NOW);

  expect(result).toBe(ValidationResult.INVALID_SCHEDULE_DATE);
});
```

**Regla R1b — fecha igual al momento actual** (pendiente TDD)
```
Given: una fecha exactamente igual a "ahora"
When:  intento validarla
Then:  el resultado debe ser INVALID_SCHEDULE_DATE
```

**Regla R2 — menos de 5 minutos en el futuro** (pendiente TDD)
```
Given: una fecha 4 minutos en el futuro
When:  intento validarla
Then:  el resultado debe ser INVALID_SCHEDULE_DATE

Given: una fecha exactamente 5 minutos en el futuro
When:  intento validarla
Then:  el resultado debe ser VALID
```

**Regla R3 — más de 1 año en el futuro** (pendiente TDD)
```
Given: una fecha 1 año y 1 día en el futuro
When:  intento validarla
Then:  el resultado debe ser INVALID_SCHEDULE_DATE

Given: una fecha exactamente 1 año en el futuro
When:  intento validarla
Then:  el resultado debe ser VALID
```

---

## Servicio 3 — AccessControlService (HU10)

**Archivo**: `tests/unit/domain/service/AccessControlService.test.ts`
**Servicio**: `src/domain/service/AccessControlService.ts`

### Imports necesarios
```typescript
import { AccessControlService } from '../../../../src/domain/service/AccessControlService';
import { Post } from '../../../../src/domain/model/Post';
import { PostStatus } from '../../../../src/domain/model/PostStatus';
import { AccessLevel } from '../../../../src/domain/model/AccessLevel';
import { UserType } from '../../../../src/domain/model/UserType';
```

### Helper sugerido
```typescript
const givenPost = (accessLevel: AccessLevel) =>
  new Post(1, 'Title', 'Content', 100, PostStatus.PUBLISHED, accessLevel);
```

### Reglas que debes implementar con TDD

**Regla R1 — post PUBLIC** (ya implementada)
```
Given: un post PUBLIC y un usuario ANONYMOUS
When:  verifico si puede acceder
Then:  el resultado debe ser true
```

**Regla R2 — post MEMBERS + MEMBER** (pendiente TDD)
```
Given: un post MEMBERS y un usuario MEMBER
When:  verifico si puede acceder
Then:  el resultado debe ser true

Given: un post MEMBERS y un usuario ANONYMOUS
When:  verifico si puede acceder
Then:  el resultado debe ser false
```

**Regla R3 — post PAID** (pendiente TDD)
```
Given: un post PAID y un usuario MEMBER
When:  verifico si puede acceder
Then:  el resultado debe ser false

Given: un post PAID y un usuario PAID_MEMBER
When:  verifico si puede acceder
Then:  el resultado debe ser true
```

**Regla R4 — ADMIN siempre tiene acceso** (ya implementada)
```
Given: un post PAID y un usuario ADMIN
When:  verifico si puede acceder
Then:  el resultado debe ser true
```

---

## Servicio 4 — PostFilterService (HU8)

**Archivo**: `tests/unit/domain/service/PostFilterService.test.ts`
**Servicio**: `src/domain/service/PostFilterService.ts`

### Imports necesarios
```typescript
import { PostFilterService } from '../../../../src/domain/service/PostFilterService';
import { Post } from '../../../../src/domain/model/Post';
import { PostStatus } from '../../../../src/domain/model/PostStatus';
import { AccessLevel } from '../../../../src/domain/model/AccessLevel';
```

### Helper sugerido — define posts de prueba una sola vez
```typescript
const givenPosts = (): Post[] => [
  new Post(1, 'TypeScript avanzado', 'C', 100, PostStatus.PUBLISHED, AccessLevel.PUBLIC),
  new Post(2, 'jest para principiantes', 'C', 100, PostStatus.DRAFT, AccessLevel.PUBLIC),
  new Post(3, 'TDD en práctica', 'C', 200, PostStatus.PUBLISHED, AccessLevel.MEMBERS),
  new Post(4, 'Borrador pendiente', 'C', 200, PostStatus.DRAFT, AccessLevel.PUBLIC)
];
```

### Reglas que debes implementar con TDD

**Filtrar por status** (parcialmente implementada)
```
Given: una lista con 2 PUBLISHED y 2 DRAFT
When:  filtro por PUBLISHED
Then:  obtengo exactamente 2 posts

Given: una lista sin posts SCHEDULED
When:  filtro por SCHEDULED
Then:  obtengo un array vacío
```

**Búsqueda case-insensitive** (bug conocido — pendiente TDD)
```
Given: un post con título 'TypeScript avanzado'
When:  busco por 'typescript' (minúsculas)
Then:  el post debe aparecer en los resultados

⚠️ IMPORTANTE: el código actual falla este caso.
Cuando escribas el test en RED, va a fallar.
Luego corriges el código en GREEN.
```

**Query vacío** (pendiente TDD)
```
Given: una lista de 4 posts
When:  busco con query vacío ''
Then:  obtengo los 4 posts sin modificar
```

**Ordenamiento** (parcialmente implementada)
```
Given: posts con títulos 'B', 'A', 'C'
When:  ordeno ASC
Then:  el orden debe ser A, B, C

Given: posts con títulos 'B', 'A', 'C'
When:  ordeno DESC
Then:  el orden debe ser C, B, A
```

---

## Servicio 5 — ContentSanitizer (HU7)

**Archivo**: `tests/unit/domain/service/ContentSanitizer.test.ts`
**Servicio**: `src/domain/service/ContentSanitizer.ts`

### Imports necesarios
```typescript
import { ContentSanitizer } from '../../../../src/domain/service/ContentSanitizer';
import { ContentBlock, ContentBlockType } from '../../../../src/domain/model/ContentBlock';
import { ValidationResult } from '../../../../src/domain/model/ValidationResult';
```

### Reglas que debes implementar con TDD

**HTML balanceado** (ya implementada)
```
Given: un bloque HTML con '<p>Hola <strong>mundo</strong></p>'
When:  valido el bloque
Then:  el resultado debe ser VALID
```

**HTML desbalanceado** (ya implementada)
```
Given: un bloque HTML con '<p>Hola <strong>mundo</p>'
When:  valido el bloque
Then:  el resultado debe ser MALFORMED_HTML
```

**HTML con script** (pendiente TDD)
```
Given: un bloque HTML que contiene '<script>alert("xss")</script>'
When:  valido el bloque
Then:  el resultado debe ser MALFORMED_HTML
```

**HTML con self-closing** (pendiente TDD)
```
Given: un bloque HTML con '<p>Salto<br/>de línea</p>'
When:  valido el bloque
Then:  el resultado debe ser VALID
```

**Bloque vacío** (pendiente TDD)
```
Given: un bloque de cualquier tipo con content = ''
When:  valido el bloque
Then:  el resultado debe ser INVALID_CONTENT
```

**IMAGE con URL válida** (pendiente TDD)
```
Given: un bloque IMAGE con 'https://ejemplo.com/foto.jpg'
When:  valido el bloque
Then:  el resultado debe ser VALID

Given: un bloque IMAGE con 'foto.jpg' (sin protocolo)
When:  valido el bloque
Then:  el resultado debe ser INVALID_CONTENT
```

---

## Cómo hacer los commits

El historial de git es la evidencia de TDD. Sigue esta convención:

```bash
# Ciclo RED
git add tests/unit/domain/service/PostValidator.test.ts
git commit -m "test: add TITLE_TOO_LONG rule (RED)"

# Ciclo GREEN
git add src/domain/service/PostValidator.ts
git commit -m "feat: implement TITLE_TOO_LONG validation (GREEN)"

# Ciclo REFACTOR
git add src/domain/service/PostValidator.ts
git commit -m "refactor: extract MAX_TITLE_LENGTH constant"
```

---

## Cómo verificar la cobertura

```bash
pnpm test:coverage
```

Se genera en `coverage/lcov-report/index.html`. Ábrelo en el navegador.
El umbral mínimo configurado es **80%**. Si no llega, Jest falla con error.

---

## Entregables de U3

Al terminar debes tener:

- [ ] 5 archivos de test en `tests/unit/domain/service/`
- [ ] Mínimo 5 clases de equivalencia por servicio documentadas
- [ ] Commits separados RED / GREEN / REFACTOR por cada regla
- [ ] `pnpm test:coverage` pasando con ≥80%
- [ ] `defectos.md` con al menos 1 defecto real encontrado
- [ ] Wiki U3 con: historia TDD, tabla clases de equivalencia, escenarios BDD, captura de cobertura
