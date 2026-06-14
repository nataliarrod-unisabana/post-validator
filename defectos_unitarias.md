# Defectos — U3 Pruebas Unitarias

Registra aquí los defectos encontrados durante el desarrollo con TDD.
# Defectos — Pruebas Unitarias (U3)

## DEF-U3-001 — La búsqueda por título no distingue mayúsculas de minúsculas

- **Severidad**: Moderado
- **Servicio afectado**: PostFilterService
- **Descubierto en**: Test `should perform case-insensitive substring search on title`
- **Descripción**:
  - Esperado: buscar "typescript" debería encontrar el post "TypeScript Avanzado"
  - Obtenido: el método `includes()` distingue mayúsculas, por lo que no encontraba el post
- **Pasos para reproducir**:
  1. Crear un post con título "TypeScript Avanzado"
  2. Llamar a `searchByTitle(posts, 'typescript')`
  3. El resultado es un array vacío en vez de retornar el post
- **Causa raíz**: `String.includes()` distingue mayúsculas y minúsculas por defecto
- **Corrección aplicada**: commit `feat: implement case-insensitive search and empty query fix (GREEN)`
- **Estado**: Resuelto