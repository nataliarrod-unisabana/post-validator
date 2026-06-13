# Guía Persona C — U5: Pruebas de Carga y Rendimiento

**Tu zona de trabajo**: `perf/scripts/`, `perf/results/`, `perf/defectos_rendimiento.md`
**NO modificas**: `src/`, `tests/`
**Herramienta**: k6

---

## ¿Qué vas a hacer?

Vas a escribir 6 scripts de k6 que atacan el servidor Express con distintos patrones de carga, analizar los resultados y documentar los defectos de rendimiento encontrados.

Los 6 escenarios son:
1. **Baseline** — rendimiento sin carga (1 usuario)
2. **Load** — carga normal esperada (50 usuarios)
3. **Stress** — empujar al sistema hasta el límite (hasta 600 usuarios)
4. **Spike** — pico repentino de tráfico (0 → 500 → 0 en segundos)
5. **Soak** — resistencia bajo carga sostenida (30 usuarios por 15 min)
6. **Regression** — detección de degradación entre versiones (10 usuarios)

---

## Setup inicial

### Paso 1 — Instalar k6

**Windows** (con winget):
```bash
winget install k6 --source winget
```

**Windows** (descarga directa):
Ir a https://k6.io/docs/get-started/installation/ y descargar el instalador .msi

**Mac**:
```bash
brew install k6
```

**Linux**:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

Verificar instalación:
```bash
k6 version
# → k6 v0.50.0 (...)
```

### Paso 2 — Clonar el repo e instalar dependencias

```bash
git clone <url-del-repo>
cd post-validator
pnpm install
```

### Paso 3 — Levantar el servidor

En una terminal dedicada (la dejas corriendo siempre):
```bash
pnpm start
# → [post-validator] listening on http://localhost:3000
```

### Paso 4 — Verificar que el servidor responde

```bash
curl http://localhost:3000/health
# → {"status":"OK"}
```

### Paso 5 — Crear tu rama de trabajo

```bash
git checkout -b feature/u5-performance-tests
```

---

## Estructura de archivos que debes crear

```
perf/
 ├── scripts/
 │   ├── common.js         ← configuración compartida (SLOs, URL base, helpers)
 │   ├── baseline.js       ← escenario 1
 │   ├── load.js           ← escenario 2
 │   ├── stress.js         ← escenario 3
 │   ├── spike.js          ← escenario 4
 │   ├── soak.js           ← escenario 5
 │   └── regression.js     ← escenario 6
 ├── results/
 │   ├── baseline.json
 │   ├── load.json
 │   ├── stress.json
 │   ├── spike.json
 │   ├── soak.json
 │   └── regression.json
 └── defectos_rendimiento.md
```

---

## Paso 1 — Crear common.js (configuración compartida)

Este archivo centraliza la URL base, los SLOs y funciones helpers. **Créalo primero** porque los demás scripts lo importan.

```javascript
// perf/scripts/common.js

// URL del servidor bajo prueba
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// SLOs (Service Level Objectives) — los umbrales que el sistema debe cumplir
// Ajusta estos valores según los resultados del Baseline
export const SLO = {
  P95_LATENCY_MS: 200,   // el 95% de las peticiones debe responder en < 200ms
  P99_LATENCY_MS: 500,   // el 99% de las peticiones debe responder en < 500ms
  ERROR_RATE: 0.01       // menos del 1% de peticiones pueden fallar
};

// Thresholds reutilizables basados en los SLOs
export const COMMON_THRESHOLDS = {
  'http_req_duration{expected_response:true}': [
    `p(95)<${SLO.P95_LATENCY_MS}`,
    `p(99)<${SLO.P99_LATENCY_MS}`
  ],
  'http_req_failed': [`rate<${SLO.ERROR_RATE}`]
};

// Headers comunes
export const HEADERS = {
  'Content-Type': 'application/json'
};

// Genera un post aleatorio para no enviar siempre el mismo dato
export function randomPostPayload() {
  const n = Math.floor(Math.random() * 100000);
  return JSON.stringify({
    title: `Post de prueba ${n}`,
    content: 'Contenido generado para pruebas de rendimiento',
    authorId: 1,
    status: 'DRAFT',
    accessLevel: 'PUBLIC'
  });
}
```

---

## Paso 2 — Escenario 1: Baseline

**Propósito**: Medir el rendimiento del sistema SIN carga. Este es tu punto de referencia para comparar todos los demás escenarios.

**Archivo**: `perf/scripts/baseline.js`

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS, HEADERS, randomPostPayload } from './common.js';

export const options = {
  vus: 1,          // 1 solo usuario virtual
  duration: '1m',  // durante 1 minuto
  thresholds: COMMON_THRESHOLDS
};

export default function () {
  // Petición GET
  const getRes = http.get(`${BASE_URL}/api/posts`);
  check(getRes, {
    'GET /api/posts → 200': (r) => r.status === 200
  });

  // Petición POST
  const postRes = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(postRes, {
    'POST /api/posts → 201': (r) => r.status === 201
  });

  sleep(1); // esperar 1 segundo entre iteraciones
}
```

**Cómo ejecutar**:
```bash
k6 run --out json=perf/results/baseline.json perf/scripts/baseline.js
```

**Qué registrar**: latencia promedio, p95, p99, requests/segundo, tasa de errores.

---

## Paso 3 — Escenario 2: Load Test

**Propósito**: Validar el comportamiento bajo la **carga normal** esperada en producción.

**Archivo**: `perf/scripts/load.js`

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS, HEADERS, randomPostPayload } from './common.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // ramp-up: subir a 50 usuarios en 30s
    { duration: '2m', target: 50 },   // steady: mantener 50 usuarios por 2 min
    { duration: '30s', target: 0 }    // ramp-down: bajar a 0 usuarios en 30s
  ],
  thresholds: COMMON_THRESHOLDS
};

export default function () {
  const getRes = http.get(`${BASE_URL}/api/posts`);
  check(getRes, { 'GET → 200': (r) => r.status === 200 });

  const postRes = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(postRes, { 'POST → 201': (r) => r.status === 201 });

  sleep(1);
}
```

**Cómo ejecutar**:
```bash
k6 run --out json=perf/results/load.json perf/scripts/load.js
```

---

## Paso 4 — Escenario 3: Stress Test

**Propósito**: Identificar el **punto de quiebre** — cuánta carga aguanta el sistema antes de fallar.

**Archivo**: `perf/scripts/stress.js`

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, HEADERS, randomPostPayload } from './common.js';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // calentamiento
    { duration: '1m', target: 200 },   // por encima del load normal
    { duration: '1m', target: 400 },   // estrés
    { duration: '1m', target: 600 },   // sobrecarga
    { duration: '30s', target: 0 }     // recuperación
  ],
  // Más permisivo: queremos ver cómo y cuándo falla
  thresholds: {
    'http_req_failed': ['rate<0.20'] // hasta 20% de errores en estrés
  }
};

export default function () {
  const postRes = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(postRes, { 'POST → 201': (r) => r.status === 201 });
  sleep(0.5);
}
```

**Cómo ejecutar**:
```bash
k6 run --out json=perf/results/stress.json perf/scripts/stress.js
```

**Qué observar**: ¿En qué número de VUs empieza a fallar? ¿Se recupera al bajar la carga?

---

## Paso 5 — Escenario 4: Spike Test

**Propósito**: Validar el comportamiento ante un **pico repentino** de tráfico (simula un evento viral).

**Archivo**: `perf/scripts/spike.js`

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, HEADERS, randomPostPayload } from './common.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // tráfico bajo normal
    { duration: '10s', target: 500 },  // PICO repentino
    { duration: '30s', target: 500 },  // mantener el pico
    { duration: '10s', target: 10 },   // bajar de golpe
    { duration: '30s', target: 10 }    // ¿se recupera el sistema?
  ],
  thresholds: {
    'http_req_failed': ['rate<0.30']
  }
};

export default function () {
  const res = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(res, { 'POST → 201': (r) => r.status === 201 });
  sleep(0.3);
}
```

**Cómo ejecutar**:
```bash
k6 run --out json=perf/results/spike.json perf/scripts/spike.js
```

---

## Paso 6 — Escenario 5: Soak Test

**Propósito**: Detectar **degradación progresiva** bajo carga sostenida (memory leaks, conexiones agotadas).

⚠️ **Nota académica**: En producción un Soak dura 4-8 horas. Para el curso hacemos 15 minutos. Justifícalo en la Wiki.

**Archivo**: `perf/scripts/soak.js`

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, HEADERS, randomPostPayload } from './common.js';

export const options = {
  stages: [
    { duration: '1m', target: 30 },   // ramp-up
    { duration: '13m', target: 30 },  // carga sostenida moderada
    { duration: '1m', target: 0 }     // ramp-down
  ],
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<300'],
    'http_req_failed': ['rate<0.02']
  }
};

export default function () {
  const getRes = http.get(`${BASE_URL}/api/posts`);
  check(getRes, { 'GET → 200': (r) => r.status === 200 });

  const postRes = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(postRes, { 'POST → 201': (r) => r.status === 201 });

  sleep(2);
}
```

**Cómo ejecutar**:
```bash
k6 run --out json=perf/results/soak.json perf/scripts/soak.js
```

**Qué observar**: ¿La latencia aumenta progresivamente? ¿El servidor consume más memoria con el tiempo?

---

## Paso 7 — Escenario 6: Regression Test

**Propósito**: Detectar si un cambio en el código **degradó el rendimiento**. Este escenario es corto y reproducible — ideal para CI/CD.

**Archivo**: `perf/scripts/regression.js`

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS, HEADERS, randomPostPayload } from './common.js';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: {
    ...COMMON_THRESHOLDS,
    // Más estricto que el baseline: detecta degradación del 10%
    'http_req_duration': ['p(95)<180']
  }
};

export default function () {
  const getRes = http.get(`${BASE_URL}/api/posts`);
  check(getRes, { 'GET → 200': (r) => r.status === 200 });

  const postRes = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(postRes, { 'POST → 201': (r) => r.status === 201 });

  sleep(0.5);
}
```

**Cómo ejecutar**:
```bash
k6 run --out json=perf/results/regression.json perf/scripts/regression.js
```

---

## Cómo ejecutar todos los escenarios en orden

```bash
# 1. Levantar el servidor (terminal separada)
pnpm start

# 2. Ejecutar en orden (en otra terminal)
k6 run --out json=perf/results/baseline.json perf/scripts/baseline.js
k6 run --out json=perf/results/load.json perf/scripts/load.js
k6 run --out json=perf/results/stress.json perf/scripts/stress.js
k6 run --out json=perf/results/spike.json perf/scripts/spike.js
k6 run --out json=perf/results/soak.json perf/scripts/soak.js
k6 run --out json=perf/results/regression.json perf/scripts/regression.js
```

---

## Métricas que debes registrar por escenario

| Métrica | Descripción |
|---|---|
| `http_req_duration` avg | Latencia promedio |
| `http_req_duration` p(95) | Percentil 95 — el 95% de peticiones tardó menos que este valor |
| `http_req_duration` p(99) | Percentil 99 |
| `http_reqs` rate | Requests por segundo (throughput) |
| `http_req_failed` rate | Tasa de errores |

k6 muestra estas métricas al final de cada ejecución en la terminal.

---

## Tabla comparativa — llénala en la Wiki

| Escenario | VUs máx | p95 (ms) | p99 (ms) | RPS | Error rate | ¿SLO cumplido? |
|---|---|---|---|---|---|---|
| Baseline | 1 | | | | | |
| Load | 50 | | | | | |
| Stress | 600 | | | | | |
| Spike | 500 | | | | | |
| Soak | 30 | | | | | |
| Regression | 10 | | | | | |

---

## Defectos de rendimiento que probablemente vas a encontrar

El sistema tiene una limitación conocida: el repositorio guarda todos los posts en memoria (un `Map`) y **nunca los borra** automáticamente. Esto significa que:

1. En el **Stress Test** — con miles de peticiones, el Map crece indefinidamente y la latencia sube
2. En el **Soak Test** — después de varios minutos, el consumo de memoria aumenta progresivamente
3. En el **Spike Test** — el sistema puede no recuperarse inmediatamente después del pico

Documenta cada uno como defecto en `perf/defectos_rendimiento.md`.

---

## Entregables de U5

Al terminar debes tener:

- [ ] `perf/scripts/common.js` con SLOs definidos
- [ ] 6 scripts k6 en `perf/scripts/`
- [ ] 6 archivos de resultados en `perf/results/`
- [ ] Capturas de pantalla de cada ejecución
- [ ] `perf/defectos_rendimiento.md` con mínimo 3 defectos documentados
- [ ] Wiki U5 con: tabla comparativa, análisis de SLOs, propuestas de mejora
