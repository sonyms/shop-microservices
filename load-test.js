import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    stages: [
        { duration: '30s', target: 100 }, // Ramp-up to 100 VUs
        { duration: '1m', target: 100 },  // Maintain 100 VUs for 1 minute
        { duration: '30s', target: 0 },   // Ramp-down to 0 VUs
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'], // http errors should be less than 5%
        http_req_duration: ['p(95)<1500'], // 95% of requests should be below 1.5s
    },
};

const API_BASE_URL = 'http://host.docker.internal:8080'; // Reaches the host's localhost (api-gateway)

export default function () {
    // 1. Pick a random user between 1 and 1000
    const userIdNum = randomIntBetween(1, 1000);
    const username = `testuser${userIdNum}`;
    const password = 'password';

    // 2. Authentication (Login)
    const loginPayload = JSON.stringify({
        username: username,
        password: password
    });

    const loginHeaders = { 'Content-Type': 'application/json' };
    
    let res = http.post(`${API_BASE_URL}/auth/login`, loginPayload, { headers: loginHeaders });
    
    check(res, {
        'login successful': (r) => r.status === 200,
    });

    if (res.status !== 200) {
        // If login fails, we can't do the rest. Sleep and exit iteration.
        sleep(1);
        return;
    }

    // Extract token
    const token = res.json('data.token');
    const actualUserId = res.json('data.id'); // Assuming the API returns the numeric/string ID of the user

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 3. Add to Cart
    // Determine product ID based on scenario
    const scenario = __ENV.TEST_SCENARIO || 'RANDOM';
    const productId = scenario === 'FIXED' ? 1 : randomIntBetween(1, 1000);

    const cartPayload = JSON.stringify({
        productId: productId,
        quantity: 1
    });

    res = http.post(`${API_BASE_URL}/cart/${actualUserId}/add`, cartPayload, { headers: authHeaders });

    check(res, {
        'add to cart successful': (r) => r.status === 200,
    });

    // Short sleep to simulate real user behavior (thinking time)
    sleep(0.5);

    // 4. Checkout
    res = http.post(`${API_BASE_URL}/orders/${actualUserId}/checkout`, null, { headers: authHeaders });

    check(res, {
        'checkout successful': (r) => r.status === 200,
    });

    sleep(1); // Wait before starting next iteration
}
