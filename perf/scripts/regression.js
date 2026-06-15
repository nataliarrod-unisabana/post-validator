import { BASE_URL, SLOs, headers, getPostPayload } from './common.js';
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95) < ${SLOs.p95_latency}`],
    http_req_failed: [`rate < ${SLOs.error_rate}`],
  },
};

export default function () {
  const payload = getPostPayload(__VU * 1000 + Date.now());
  const res = http.post(`${BASE_URL}/api/posts`, payload, { headers });
  check(res, {
    'status is 201': (r) => r.status === 201,
  });
  sleep(1);
}
