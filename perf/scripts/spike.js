import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, HEADERS, randomPostPayload } from './common.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '10s', target: 500 },
    { duration: '30s', target: 500 },
    { duration: '10s', target: 10 },
    { duration: '30s', target: 10 }
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