import { BASE_URL, SLOs, headers } from './common.js';
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: [`p(95) < ${SLOs.p95_latency}`],
    http_req_failed: [`rate < ${SLOs.error_rate}`],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/posts`, { headers });
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
