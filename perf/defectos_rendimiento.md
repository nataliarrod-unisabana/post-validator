# Defectos — U5 Pruebas de Carga y Rendimiento

Registro de defectos de rendimiento identificados durante las pruebas con k6.

---

## DEF-U5-001 — Crecimiento Indefinido del Repositorio (OOM Potencial)

- **Escenario donde se detecta**: Stress Test / Soak Test
- **Métrica afectada**: Heap Memory Usage
- **Valor observado vs SLO**: Sin fallo en las pruebas ejecutadas. El repositorio acumuló ~275,000 posts sin llegar a OOM, pero el crecimiento es ilimitado y el riesgo persiste en ejecuciones mas largas o con mayor volumen de datos.
- **Evidencia**: Ejecuciones de Stress (143,640 peticiones) y Soak (29,644 peticiones) sin error. El Map crecio sin restricciones durante toda la bateria de pruebas (~275,000 registros totales). Con una carga 2x o 3x superior, el heap de Node.js se agotaria.
- **Impacto**: Crítico (potencial)
- **Hipótesis de causa raíz**: El `InMemoryPostRepository` utiliza un `Map` sin política de evicción ni TTL. Ante carga continua (POST), el proceso Node.js acumula objetos hasta agotar el heap.
- **Propuesta de mejora**: Implementar una capacidad máxima configurable con evicción FIFO o LRU, o migrar a una base de datos persistente.
- **Estado**: Abierto

---

## DEF-U5-002 — Degradación Progresiva del Rendimiento (GC)

- **Escenario donde se detecta**: Soak Test
- **Métrica afectada**: p95 latencia
- **Valor observado vs SLO**: p95 = 4.97 ms (SLO: 200 ms). No se superó el umbral, pero se observó una correlación entre el volumen de datos acumulados y la latencia: Regression (275,000 posts acumulados, 10 VUs) tuvo p95 de 3.48 ms, mientras que Baseline (0 posts, 1 VU) tuvo 0.88 ms.
- **Evidencia**: Comparación Baseline (0.88 ms p95 con 0 posts) vs Regression (3.48 ms p95 con ~275,000 posts acumulados). La latencia se multiplicó por ~4 sin aumento de concurrencia, solo por acumulación de datos en el repositorio.
- **Impacto**: Medio (potencial)
- **Hipótesis de causa raíz**: La recolección de basura (Garbage Collector) de Node.js se vuelve ineficiente debido al gran volumen de objetos en memoria, incrementando los tiempos de respuesta ante cada nueva solicitud.
- **Propuesta de mejora**: Optimizar la estructura de datos, limpiar registros periódicamente, o implementar paginación en el endpoint `GET /api/posts`.
- **Estado**: Abierto

---

## DEF-U5-003 — Degradación por Estado Acumulado entre Escenarios

- **Escenario donde se detecta**: Regression Test (ejecutado al final de la secuencia)
- **Métrica afectada**: p95 latencia
- **Valor observado vs SLO**: p95 = 3.48 ms (SLO: 200 ms). No se superó el umbral, pero se identificó que Regression con 10 VUs tuvo peor latencia que Spike con 500 VUs (3.48 ms vs 3.34 ms), debido al estado acumulado del repositorio tras los escenarios previos.
- **Evidencia**: Regression (último en ejecutarse, ~275,000 posts acumulados) vs Spike (tercero en ejecutarse, ~100,000 posts acumulados). La latencia no depende solo de la concurrencia sino del volumen de datos históricos.
- **Impacto**: Medio (potencial)
- **Hipótesis de causa raíz**: El repositorio en memoria acumula datos entre escenarios sin limpieza. Esto puede enmascarar regresiones reales: si el baseline se ejecuta siempre al inicio (sin datos) y regression al final (con datos), la comparación no es válida.
- **Propuesta de mejora**: Ejecutar `clear()` entre escenarios o aislar cada prueba con un servidor limpio. Documentar el estado inicial del repositorio como parte de los resultados.
- **Estado**: Abierto

---

## Resumen

| ID | Título | Impacto | Estado |
|---|---|---|---|
| DEF-U5-001 | Crecimiento Indefinido del Repositorio (OOM Potencial) | Crítico (potencial) | Abierto |
| DEF-U5-002 | Degradación Progresiva del Rendimiento (GC) | Medio (potencial) | Abierto |
| DEF-U5-003 | Degradación por Estado Acumulado entre Escenarios | Medio (potencial) | Abierto |

> **Nota:** Ninguno de estos defectos causó fallos en las pruebas ejecutadas (todos los SLOs se cumplieron). Se documentan como riesgos potenciales identificados mediante análisis de código y observación de tendencias en las métricas.
