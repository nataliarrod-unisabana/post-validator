// perf/scripts/common.js

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const SLO = {
  P95_LATENCY_MS: 200,
  P99_LATENCY_MS: 500,
  ERROR_RATE: 0.01
};

export const COMMON_THRESHOLDS = {
  'http_req_duration{expected_response:true}': [
    `p(95)<${SLO.P95_LATENCY_MS}`,
    `p(99)<${SLO.P99_LATENCY_MS}`
  ],
  'http_req_failed': [`rate<${SLO.ERROR_RATE}`]
};

export const HEADERS = {
  'Content-Type': 'application/json'
};

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