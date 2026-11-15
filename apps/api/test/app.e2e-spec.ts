// Integration test với PostgreSQL thật cho luồng Đặt và thanh toán (UC-06 + UC-08).
// Cần DATABASE_URL trỏ tới DB đã migrate + seed. Chạy: npm run test:e2e
// Mỗi lần chạy dùng email mới nên chạy lặp lại được trên cùng DB.
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Đặt và thanh toán đơn (e2e, PostgreSQL)', () => {
  let app: INestApplication<App>;
  let token: string;
  let productId: string;
  const run = Date.now();

  beforeAll(async () => {
    process.env.PAYMENT_PROVIDER = 'mock';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `e2e-${run}@brewlite.vn`, password: 'password123', name: 'E2E' })
      .expect(201);
    token = reg.body.accessToken as string;

    const products = await request(app.getHttpServer()).get('/products').expect(200);
    productId = String((products.body as { id: number }[])[0].id);
  });
  afterAll(() => app.close());

  const server = () => app.getHttpServer();
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const cart = (unitPrice = 1) => ({ items: [{ productId, size: 'M', qty: 1, unitPrice }] });

  async function newOrder(): Promise<string> {
    const res = await request(server()).post('/orders').set(auth()).send(cart()).expect(201);
    expect(res.body.status).toBe('PENDING');
    return res.body.orderCode as string;
  }

  async function startPayment(code: string, key: string) {
    const res = await request(server())
      .post(`/api/payment/create/${encodeURIComponent(code)}`)
      .set(auth())
      .set('Idempotency-Key', key)
      .expect(201);
    const url = new URL(res.body.paymentUrl as string);
    return Number(url.searchParams.get('paymentId'));
  }

  it('GET /health → 200, DB up', async () => {
    const res = await request(server()).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'up' });
  });

  it('AC-06: không có JWT → POST /orders trả 401', async () => {
    await request(server()).post('/orders').send(cart()).expect(401);
  });

  it('FR-05: giỏ rỗng hoặc size sai → 400', async () => {
    await request(server()).post('/orders').set(auth()).send({ items: [] }).expect(400);
    await request(server())
      .post('/orders')
      .set(auth())
      .send({ items: [{ productId, size: 'XL', qty: 0, unitPrice: 1 }] })
      .expect(400);
  });

  it('AC-04: client gửi giá 1đ → tổng tiền vẫn tính theo CSDL', async () => {
    const res = await request(server()).post('/orders').set(auth()).send(cart(1)).expect(201);
    expect(res.body.total).toBeGreaterThan(1000);
  });

  it('AC-01: thanh toán ví → đơn PAID', async () => {
    const code = await newOrder();
    const paymentId = await startPayment(code, `wallet-${run}`);
    const res = await request(server())
      .post('/api/payment/mock/confirm')
      .set(auth())
      .send({ orderCode: code, paymentId, method: 'WALLET' })
      .expect(201);
    expect(res.body.paid).toBe(true);
    const order = await request(server()).get(`/orders/${encodeURIComponent(code)}`).set(auth()).expect(200);
    expect(order.body.status).toBe('PAID');
  });

  it('AC-02: thẻ đuôi 0002 → PAYMENT_FAILED, thanh toán lại bằng thẻ hợp lệ → PAID', async () => {
    const code = await newOrder();
    const first = await startPayment(code, `card-fail-${run}`);
    const fail = await request(server())
      .post('/api/payment/mock/confirm')
      .set(auth())
      .send({ orderCode: code, paymentId: first, method: 'CARD', cardNumber: '4000000000000002' })
      .expect(201);
    expect(fail.body.paid).toBe(false);
    let order = await request(server()).get(`/orders/${encodeURIComponent(code)}`).set(auth()).expect(200);
    expect(order.body.status).toBe('PAYMENT_FAILED');

    const retry = await startPayment(code, `card-ok-${run}`);
    await request(server())
      .post('/api/payment/mock/confirm')
      .set(auth())
      .send({ orderCode: code, paymentId: retry, method: 'CARD', cardNumber: '4242424242424242' })
      .expect(201);
    order = await request(server()).get(`/orders/${encodeURIComponent(code)}`).set(auth()).expect(200);
    expect(order.body.status).toBe('PAID');
  });

  it('AC-03: gửi 2 lần cùng Idempotency-Key → cùng một payment', async () => {
    const code = await newOrder();
    const key = `same-${run}`;
    const [a, b] = await Promise.all([startPayment(code, key), startPayment(code, key)]);
    expect(a).toBe(b);
  });
});
