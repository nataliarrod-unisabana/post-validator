# Guía Equipo — U6: Gestión de Defectos y Validación Final

**Quién lo hace**: Los tres integrantes en conjunto
**Formato de entrega**: Documento Word o PDF + soporte en Excel
**Cuándo**: Después de terminar U3, U4 y U5

---

## ¿Qué es U6?

U6 es la unidad de cierre del proyecto integrador. No pide código nuevo — pide que documenten formalmente todos los defectos encontrados durante U3, U4 y U5, los analicen, los prioricen y presenten un informe técnico final.

Es el momento de consolidar todo el trabajo en un documento profesional.

---

## Materiales de entrada (lo que traen de U3, U4 y U5)

| Fuente | Documento |
|---|---|
| U3 — Pruebas Unitarias | `defectos.md` |
| U4 — Integración y Sistema | `defectos_integracion.md` |
| U5 — Carga y Rendimiento | `perf/defectos_rendimiento.md` |

Consoliden todos los defectos en un listado maestro antes de empezar.

---

## Estructura del documento de U6

El documento debe incluir estas secciones:

### 1. Identificación de defectos

Para cada defecto encontrado en U3, U4 y U5, documenten:

| Campo | Descripción |
|---|---|
| ID | DEF-U3-001, DEF-U4-001, DEF-U5-001... |
| Título | Descripción corta del defecto |
| Unidad donde se encontró | U3 / U4 / U5 |
| Tipo de prueba | Unitaria / Integración / Sistema / Rendimiento |
| Descripción | Qué se esperaba vs qué ocurrió |
| Pasos para reproducir | Secuencia exacta |

### 2. Clasificación y priorización

Clasifiquen cada defecto según severidad e impacto:

| Severidad | Criterio |
|---|---|
| Fatal | El sistema no funciona — bloquea funcionalidad principal |
| Serio | Funcionalidad importante afectada pero hay workaround |
| Moderado | Comportamiento incorrecto en casos específicos |
| Leve | Error menor, cosmético o de rendimiento marginal |

**Matriz de priorización sugerida**:

| ID | Título | Severidad | Impacto | Prioridad | Estado |
|---|---|---|---|---|---|
| DEF-U3-001 | ... | Moderado | Medio | P2 | Resuelto |
| DEF-U4-001 | ... | Serio | Alto | P1 | Abierto |
| DEF-U5-001 | ... | Leve | Bajo | P3 | En análisis |

### 3. Seguimiento y validación

Para los defectos resueltos, documenten:
- ¿Qué se corrigió?
- ¿Qué commit arregló el problema?
- ¿Se verificó que el test ahora pasa?

Para los defectos abiertos, documenten:
- ¿Por qué quedó abierto?
- ¿Qué se necesitaría para resolverlo?

### 4. Dashboard de métricas de calidad

Creen una tabla o gráfica (en Excel) con estas métricas:

**Métricas de defectos**:
| Métrica | Valor |
|---|---|
| Total de defectos encontrados | |
| Defectos por unidad (U3/U4/U5) | |
| Defectos por severidad | |
| Defectos resueltos vs abiertos | |
| Tiempo promedio de resolución | |

**Métricas de cobertura** (tomar de los reportes de Jest):
| Métrica | Valor |
|---|---|
| Cobertura global | % |
| Cobertura de dominio | % |
| Tests unitarios totales | |
| Tests de integración totales | |
| Tests de sistema totales | |

**Métricas de rendimiento** (tomar de los resultados de k6):
| Escenario | p95 | SLO cumplido |
|---|---|---|
| Baseline | ms | Sí/No |
| Load | ms | Sí/No |
| Stress | ms | Sí/No |

### 5. Informe técnico final

El informe debe responder estas preguntas:

**Sobre el proceso de pruebas**:
- ¿Qué tan efectivo fue el proceso de TDD para encontrar defectos?
- ¿Qué tipo de defectos encontraron las pruebas unitarias vs las de integración vs las de sistema?
- ¿Las pruebas de carga revelaron limitaciones que no se veían en las otras pruebas?

**Sobre la calidad del sistema**:
- ¿Cuáles son los módulos más críticos del sistema?
- ¿Qué reglas de negocio tienen mayor riesgo de fallo?
- ¿El sistema cumple con los SLOs definidos bajo carga normal?

**Sobre oportunidades de mejora**:
- ¿Qué mejorarían en el diseño del sistema para facilitar las pruebas?
- ¿Qué pruebas adicionales recomendarían si hubiera más tiempo?
- ¿Cómo mejorarían el pipeline CI/CD?

### 6. Conclusiones y reflexión final

Una sección por cada integrante donde reflexionen sobre:
- ¿Qué aprendieron del proceso de testing?
- ¿Cómo cambió su forma de ver el desarrollo de software?
- ¿Qué aplicarían en proyectos reales?

---

## Formato sugerido del documento

- **Portada**: nombre del proyecto, integrantes, fecha, Universidad de La Sabana
- **Tabla de contenidos**
- **Sección 1**: Identificación de defectos (tabla)
- **Sección 2**: Clasificación y priorización (tabla + justificación)
- **Sección 3**: Seguimiento y validación
- **Sección 4**: Dashboard de métricas (pueden ser capturas de Excel o tablas en Word)
- **Sección 5**: Informe técnico (prosa, 2-3 páginas)
- **Sección 6**: Conclusiones por integrante
- **Anexos**: capturas de cobertura Jest, resultados k6, screenshots de GitHub Actions

---

## División del trabajo para U6

| Integrante | Sección |
|---|---|
| Persona A | Secciones 1 y 2 (consolidar todos los defectos + priorización) |
| Persona B | Sección 4 (dashboard de métricas) + Sección 3 (seguimiento) |
| Persona C | Sección 5 (informe técnico) |
| Todos | Sección 6 (conclusión individual de cada uno) |

---

## Checklist final de U6

- [ ] Todos los defectos de U3, U4 y U5 consolidados en un listado
- [ ] Cada defecto con severidad, prioridad y estado documentados
- [ ] Dashboard de métricas con datos reales (cobertura + rendimiento)
- [ ] Informe técnico de 2-3 páginas respondiendo las preguntas de reflexión
- [ ] Conclusión individual de cada integrante
- [ ] Documento en formato Word o PDF listo para entregar
- [ ] Repositorio organizado y con Wiki actualizada
