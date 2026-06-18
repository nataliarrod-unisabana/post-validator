import http from 'k6/http';
import { sleep, check } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS, HEADERS, randomPostPayload } from './common.js';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: COMMON_THRESHOLDS
};

export default function () {
  const getRes = http.get(`${BASE_URL}/api/posts`);
  check(getRes, {
    'GET /api/posts → 200': (r) => r.status === 200
  });

  const postRes = http.post(
    `${BASE_URL}/api/posts`,
    randomPostPayload(),
    { headers: HEADERS }
  );
  check(postRes, {
    'POST /api/posts → 201': (r) => r.status === 201
  });

  sleep(1);
}