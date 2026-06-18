import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, HEADERS, randomPostPayload } from './common.js';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 400 },
    { duration: '1m', target: 600 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    'http_req_failed': ['rate<0.20']
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