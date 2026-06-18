# Defectos — U5 Pruebas de Carga y Rendimiento

Registro de defectos de rendimiento identificados durante las pruebas con k6.

---

## DEF-U5-001 — Crecimiento Indefinido del Repositorio (OOM Confirmado)

- **Escenario donde se detecta**: Stress Test / Soak Test
- **Métrica afectada**: Heap Memory Usage (OOM Kill del proceso Node.js)
- **Valor observado vs SLO**: El servidor fue terminado por el SO (`Killed`) durante la ejecución de Soak tras acumular ~270,000 posts de escenarios previos (Baseline + Load + Stress + Spike). El proceso Node.js agotó el heap disponible.
- **Evidencia**: Ejecución de Soak interrumpida por OOM. Errores `connection reset by peer` en k6 seguidos de `Killed` del proceso del servidor. La secuencia fue: Baseline (60 iteraciones) → Load (7,219 iteraciones) → Stress (134,153 iteraciones) → Spike (67,254 iteraciones) → Soak (falló a los ~24s con ~270K posts acumulados). Sin reinicio del servidor entre escenarios, el Map creció sin control hasta agotar la memoria.
- **Impacto**: Crítico (confirmado)
- **Hipótesis de causa raíz**: El `InMemoryPostRepository` utiliza un `Map` sin política de evicción ni límite de capacidad. Ante carga continua de escritura (POST), el proceso Node.js acumula objetos en el heap hasta que el SO lo termina por OOM.
- **Propuesta de mejora**: Implementar una capacidad máxima configurable con evicción FIFO o LRU, o migrar a una base de datos persistente.
- **Estado**: Abierto

---

## DEF-U5-002 — Degradación Progresiva del Rendimiento por Volumen de Datos (GC)

- **Escenario donde se detecta**: Soak Test / Regression Test
- **Métrica afectada**: p95 latencia
- **Valor observado vs SLO**: En la segunda batería con scripts corregidos, el Baseline (1 VU, servidor limpio, GET+POST, sleep 1s) tuvo p95 = 5.34 ms, mientras que el Regression (10 VUs, servidor limpio, GET+POST, sleep 0.5s) tuvo p95 = 23.04 ms. El factor de incremento (~4.3x) se debe principalmente a la mayor concurrencia (10 VUs vs 1 VU) y al sleep reducido (0.5s vs 1s). En el Soak (30 VUs, 15 min, servidor limpio, sleep 2s) el p95 fue 33.76 ms, mostrando latencia controlada con carga sostenida. Todos los escenarios cumplieron el SLO p95 < 200 ms.
- **Evidencia**: 
  - Baseline (servidor limpio, 1 VU, sleep 1s): p95 = 5.34 ms
  - Load (servidor limpio, 50 VUs, sleep 1s): p95 = 57.17 ms
  - Soak (servidor limpio, 30 VUs, sleep 2s, 15 min): p95 = 33.76 ms
  - Regression (servidor limpio, 10 VUs, sleep 0.5s): p95 = 23.04 ms
  - La latencia escala con la concurrencia y la tasa de peticiones (determinada por el sleep), no por degradación progresiva del GC en esta batería con servidor reiniciado.
- **Impacto**: Medio (potencial)
- **Hipótesis de causa raíz**: Aunque en esta batería no se observó degradación progresiva (el servidor se reinició entre escenarios), con volúmenes masivos de datos en el Map la recolección de basura de Node.js se vuelve ineficiente, incrementando los tiempos de respuesta. El riesgo persiste en ejecuciones prolongadas sin reinicio.
- **Propuesta de mejora**: Optimizar la estructura de datos, limpiar registros periódicamente, o implementar paginación en el endpoint `GET /api/posts`.
- **Estado**: Abierto

---

## DEF-U5-003 — Degradacion por Estado Acumulado entre Escenarios

- **Escenario donde se detecta**: Regression Test (ejecutado sin reinicio del servidor)
- **Metrica afectada**: p95 latencia / validez de la comparacion Baseline vs Regression
- **Valor observado vs SLO**: En la primera bateria (scripts anteriores, sin reinicio), el Regression ejecutado al final con ~275,000 posts acumulados tuvo p95 = 3.48 ms, comparable al Spike con 500 VUs (3.34 ms). Esto distorsiona la comparacion: el Baseline arranca con repositorio vacio y el Regression con cientos de miles de registros. En la segunda bateria (scripts corregidos), este defecto se mitigo reiniciando el servidor antes de Baseline y antes de Regression, obteniendo resultados comparables: Baseline p95 = 5.34 ms vs Regression p95 = 23.04 ms (diferencia atribuible a 10 VUs vs 1 VU y sleep 0.5s vs 1s).
- **Evidencia**: 
  - Primera bateria sin reinicio: Baseline (0 posts, p95 = 0.88 ms) vs Regression (~275K posts, p95 = 3.48 ms) → comparacion invalida.
  - Segunda bateria con reinicio: Baseline (0 posts, p95 = 5.34 ms) vs Regression (solo posts del propio Regression, p95 = 23.04 ms) → comparacion valida.
  - El OOM del Soak en la segunda bateria (DEF-U5-004) es la manifestacion extrema de este mismo problema.
- **Impacto**: Medio (confirmado)
- **Hipotesis de causa raiz**: El repositorio en memoria acumula datos entre escenarios sin limpieza automatica. Esto enmascara regresiones reales y, en casos extremos, causa OOM (DEF-U5-001, DEF-U5-004). Si el baseline se ejecuta siempre al inicio (sin datos) y regression al final (con datos), la comparacion no es valida.
- **Propuesta de mejora**: 
  1. Reiniciar el servidor antes de cada escenario como procedimiento operativo estandar.
  2. Implementar un endpoint `POST /api/reset` que ejecute `clear()` en el repositorio para aislar escenarios sin reiniciar el proceso.
- **Estado**: Abierto

---

## DEF-U5-004 — OOM Kill Confirmado en Soak (Segunda Batería)

- **Escenario donde se detecta**: Soak Test (segunda batería con scripts corregidos)
- **Métrica afectada**: Disponibilidad del servicio (proceso terminado)
- **Valor observado vs SLO**: El proceso del servidor fue terminado por el sistema operativo (`Killed`) a los ~24 segundos de iniciado el Soak Test. k6 reportó `connection reset by peer`. Cero peticiones exitosas en Soak.
- **Evidencia**: 
  ```
  WARN[0024] Request Failed  error="read: connection reset by peer"
  Killed   k6 run --out json=perf/results/soak.json perf/scripts/soak.js
  ```
  Escenarios previos acumulados sin reinicio del servidor: Baseline (60 iter, ~120 posts) + Load (7,219 iter, ~7,219 posts) + Stress (134,153 iter) + Spike (67,254 iter) = ~208,746 posts en el Map al iniciar Soak. El heap de Node.js colapsó durante el ramp-up del Soak.
- **Impacto**: Crítico (confirmado)
- **Hipótesis de causa raíz**: Idem DEF-U5-001. La falta de reinicio del servidor entre escenarios permitió que el repositorio en memoria acumulara ~208K posts. Al iniciar Soak con 30 VUs adicionales, el heap se agotó y el SO mató el proceso.
- **Propuesta de mejora**: 
  1. Reiniciar el servidor entre escenarios como mitigación inmediata (procedimiento operativo).
  2. Implementar límite de capacidad con evicción en `InMemoryPostRepository` como solución definitiva.
- **Estado**: Abierto

---

## Resumen

| ID | Título | Impacto | Estado |
|---|---|---|---|
| DEF-U5-001 | Crecimiento Indefinido del Repositorio (OOM Confirmado) | Critico (confirmado) | Abierto |
| DEF-U5-002 | Degradacion Progresiva del Rendimiento por Volumen de Datos (GC) | Medio (potencial) | Abierto |
| DEF-U5-003 | Degradacion por Estado Acumulado entre Escenarios | Medio (confirmado) | Abierto |
| DEF-U5-004 | OOM Kill Confirmado en Soak (Segunda Bateria) | Critico (confirmado) | Abierto |

> **Nota:** DEF-U5-004 confirma lo que DEF-U5-001 advertia como riesgo. El OOM ocurrio durante la segunda bateria de pruebas al no reiniciar el servidor entre escenarios, acumulando ~208,746 posts en memoria antes de iniciar el Soak Test. DEF-U5-003 se mitigo con reinicio del servidor, pero la causa raiz (repositorio sin politica de eviccion) persiste.
