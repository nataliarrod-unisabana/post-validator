# Guía Persona B — U4: Pruebas de Integración y Sistema

**Tu zona de trabajo**: `tests/integration/`, `tests/system/`, `.github/workflows/`
**NO modificas**: `src/` (el código ya está completo para lo que necesitas)
**Herramientas**: Jest + Supertest + GitHub Actions

---

## ¿Qué vas a hacer?

Vas a escribir tres tipos de pruebas y configurar el pipeline CI/CD:

1. **Pruebas de integración reales** — verifican que `PostService` y `InMemoryPostRepository` colaboran correctamente usando las clases reales (sin mocks)
2. **Pruebas de integración con mocks** — verifican que `PostService` llama correctamente al repositorio usando `jest.fn()` para simularlo
3. **Pruebas de sistema** — atacan el servidor Express completo con Supertest como si fueran peticiones HTTP reales
4. **Pipeline CI/CD** — configura GitHub Actions para que los tests corran automáticamente en cada push

---

## Setup inicial

```bash
# 1. Clonar el repo y entrar a la carpeta
git clone <url-del-repo>
cd post-validator

# 2. Instalar dependencias
pnpm install

# 3. Verificar que el servidor levanta
pnpm start
# → [post-validator] listening on http://localhost:3000

# 4. Crear tu rama de trabajo
git checkout -b feature/u4-integration-tests
```

---

## Parte 1 — Pruebas de Integración con repositorio real

**Carpeta**: `tests/integration/`
**Archivo**: `tests/integration/PostService.integration.test.ts`

Estas pruebas verifican que `PostService` y `InMemoryPostRepository` funcionan correctamente juntos. Usas las clases **reales** — no hay mocks.

### Imports necesarios
```typescript
import { PostService } from '../../src/application/PostService';
import { InMemoryPostRepository } from '../../src/infrastructure/InMemoryPostRepository';
import { Post } from '../../src/domain/model/Post';
import { PostStatus } from '../../src/domain/model/PostStatus';
import { AccessLevel } from '../../src/domain/model/AccessLevel';
import { UserType } from '../../src/domain/model/UserType';
import { ValidationResult } from '../../src/domain/model/ValidationResult';
```

### Estructura base
```typescript
describe('PostService + InMemoryPostRepository (Integración)', () => {
  let repository: InMemoryPostRepository;
  let service: PostService;

  beforeEach(() => {
    // Arrange común: repositorio limpio antes de cada test
    repository = new InMemoryPostRepository();
    service = new PostService(repository);
  });

  // Aquí van tus tests...
});
```

### Tests que debes implementar (mínimo 3)

**Test 1 — post válido se persiste**
```
Given: un repositorio vacío y un post válido
When:  llamo a service.createPost(post)
Then:  el repositorio debe tener 1 post
       el resultado debe tener success = true
       el post guardado debe tener un id asignado
```

**Test 2 — post inválido NO se persiste**
```
Given: un repositorio vacío y un post con título vacío
When:  llamo a service.createPost(post)
Then:  el repositorio debe seguir vacío
       el resultado debe tener success = false
       el error debe ser EMPTY_TITLE
```

**Test 3 — post se puede recuperar después de guardar**
```
Given: un post válido guardado exitosamente
When:  llamo a service.getPost(id, UserType.ADMIN)
Then:  el post recuperado debe tener el mismo título
       el post no debe ser null
```

**Test 4 — post MEMBERS no es accesible para ANONYMOUS**
```
Given: un post con accessLevel MEMBERS guardado
When:  llamo a service.getPost(id, UserType.ANONYMOUS)
Then:  el resultado debe ser null
```

**Test 5 — eliminar post**
```
Given: un post válido guardado
When:  llamo a service.deletePost(id)
Then:  el repositorio debe quedar vacío
       el resultado de deletePost debe ser true
```

---

## Parte 2 — Pruebas de Integración con Mocks

**Carpeta**: `tests/integration/`
**Archivo**: `tests/integration/PostServiceMock.integration.test.ts`

Estas pruebas verifican el **comportamiento** del `PostService` — que llama correctamente al repositorio bajo distintas condiciones. Usas `jest.fn()` para simular el repositorio.

### Imports necesarios
```typescript
import { PostService } from '../../src/application/PostService';
import { PostRepository } from '../../src/application/PostRepository';
import { Post } from '../../src/domain/model/Post';
import { ValidationResult } from '../../src/domain/model/ValidationResult';
```

### Cómo crear un mock con jest.fn()
```typescript
// Crear un mock del repositorio
const mockRepository: jest.Mocked<PostRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn()
};

const service = new PostService(mockRepository);
```

### Tests que debes implementar (mínimo 2)

**Test 1 — save() se llama cuando el post es válido**
```
Given: un mock de repositorio y un post válido
When:  llamo a service.createPost(post)
Then:  mockRepository.save debe haber sido llamado 1 vez
```

```typescript
// Así se verifica una llamada a un mock
expect(mockRepository.save).toHaveBeenCalledTimes(1);
expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
  title: 'Mi post'
}));
```

**Test 2 — save() NO se llama cuando el post es inválido**
```
Given: un mock de repositorio y un post con título vacío
When:  llamo a service.createPost(post)
Then:  mockRepository.save NO debe haber sido llamado
```

```typescript
// Así se verifica que NO fue llamado
expect(mockRepository.save).not.toHaveBeenCalled();
```

**Test 3 (opcional) — simular error del repositorio**
```typescript
// Así simulas que el repositorio lanza un error
mockRepository.save.mockImplementation(() => {
  throw new Error('Error de base de datos');
});
```

### Limpiar mocks entre tests
```typescript
beforeEach(() => {
  jest.clearAllMocks(); // limpia contadores y llamadas
});
```

---

## Parte 3 — Pruebas de Sistema con Supertest

**Carpeta**: `tests/system/`
**Archivo**: `tests/system/PostController.system.test.ts`

Estas pruebas atacan el servidor Express **completo** como si fueran peticiones HTTP reales. No saben nada del código interno — solo verifican entradas y salidas HTTP.

### Imports necesarios
```typescript
import request from 'supertest';
import { buildApp } from '../../src/delivery/rest/app';
import { Application } from 'express';
```

### Estructura base
```typescript
describe('PostController — Pruebas de Sistema', () => {
  let app: Application;

  beforeEach(() => {
    app = buildApp(); // app nueva con repositorio vacío en cada test
  });

  // Aquí van tus tests...
});
```

### Cómo hacer una petición con Supertest
```typescript
// GET
const response = await request(app).get('/health');

// POST con body JSON
const response = await request(app)
  .post('/api/posts')
  .send({ title: 'Mi post', content: 'Contenido', authorId: 1 });

// GET con header
const response = await request(app)
  .get('/api/posts/1')
  .set('x-user-type', 'ANONYMOUS');

// DELETE
const response = await request(app).delete('/api/posts/1');
```

### Tests que debes implementar (mínimo 2)

**Test 1 — health check**
```
Given: el servidor está corriendo
When:  hago GET /health
Then:  el status debe ser 200
       el body debe ser { status: 'OK' }
```

**Test 2 — crear post válido**
```
Given: un body JSON con title, content y authorId válidos
When:  hago POST /api/posts
Then:  el status debe ser 201
       el body debe tener el post con id asignado
       el body.title debe ser igual al enviado
```

**Test 3 — crear post con título vacío**
```
Given: un body JSON con title vacío
When:  hago POST /api/posts
Then:  el status debe ser 400
       el body.error debe ser 'EMPTY_TITLE'
```

**Test 4 — JSON malformado**
```
Given: un body que no es JSON válido
When:  hago POST /api/posts con Content-Type: application/json
Then:  el status debe ser 400
       el body.error debe ser 'MALFORMED_JSON'
```

```typescript
// Así se envía JSON malformado
const response = await request(app)
  .post('/api/posts')
  .set('Content-Type', 'application/json')
  .send('{"title": "sin cerrar'); // JSON inválido
```

**Test 5 — obtener post inexistente**
```
Given: un repositorio vacío
When:  hago GET /api/posts/999
Then:  el status debe ser 404
```

**Test 6 — eliminar post existente**
```
Given: un post creado previamente
When:  hago DELETE /api/posts/{id}
Then:  el status debe ser 204
```

**Test 7 — ID no numérico en la URL**
```
Given: cualquier estado del repositorio
When:  hago GET /api/posts/abc
Then:  el status debe ser 400
       el body.error debe ser 'INVALID_ID'
```

---

## Parte 4 — Pipeline CI/CD con GitHub Actions

**Carpeta**: `.github/workflows/`
**Archivo**: `.github/workflows/ci.yml`

El pipeline debe ejecutar todos los tests automáticamente en cada push y en cada pull request.

### Estructura del archivo ci.yml

```yaml
name: CI

on:
  push:
    branches: [master, main, develop]
  pull_request:
    branches: [master, main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration

      - name: Run system tests
        run: pnpm test:system

      - name: Generate coverage report
        run: pnpm test:coverage

      - name: Upload coverage artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 14
```

### Cómo verificar que el pipeline funciona
1. Hacer push de la rama a GitHub
2. Ir a la pestaña **Actions** del repositorio
3. Verificar que el workflow corrió y pasó en verde

---

## Cómo correr los tests localmente

```bash
pnpm test:integration    # solo tests de integración
pnpm test:system         # solo tests de sistema
pnpm test:coverage       # todos + reporte de cobertura
```

---

## Entregables de U4

Al terminar debes tener:

- [ ] `tests/integration/PostService.integration.test.ts` con ≥3 tests
- [ ] `tests/integration/PostServiceMock.integration.test.ts` con ≥2 tests con mocks
- [ ] `tests/system/PostController.system.test.ts` con ≥2 tests
- [ ] `.github/workflows/ci.yml` corriendo en GitHub Actions
- [ ] `pnpm test:coverage` con ≥80% global y ≥70% en integración
- [ ] `defectos_integracion.md` con al menos 1 defecto real
- [ ] Wiki U4 con: diagrama de capas, ejemplos de pruebas, capturas de cobertura, reflexión
