// perf/scripts/common.js
export const BASE_URL = 'http://localhost:3000';

// SLOs definidos
export const SLOs = {
  p95_latency: 200, // ms
  error_rate: 0.01  // 1%
};

// Payload dinámico para evitar errores de validación en POST /api/posts
export function getPostPayload(index) {
  return JSON.stringify({
    title: `Post de carga ${index}`,
    content: "Contenido de prueba automatizada",
    authorId: 1,
    status: "DRAFT",
    accessLevel: "PUBLIC"
  });
}

// Configuración de cabeceras comunes
export const headers = {
  'Content-Type': 'application/json'
};
