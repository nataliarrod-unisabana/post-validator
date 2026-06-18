import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS, HEADERS, randomPostPayload } from './common.js';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: {
    ...COMMON_THRESHOLDS,
    'http_req_duration': ['p(95)<180']
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

  sleep(0.5);
}