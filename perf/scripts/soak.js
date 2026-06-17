import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, HEADERS, randomPostPayload } from './common.js';

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '13m', target: 30 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<300'],
    'http_req_failed': ['rate<0.02']
  }
};

export default function () {
  const getRes = http.get(`${BASE_URL}/api/posts`);
  check(getRes, { 'GET → 200': (r) => r.status === 200 });

  const postRes = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(postRes, { 'POST → 201': (r) => r.status === 201 });

  sleep(2);
}