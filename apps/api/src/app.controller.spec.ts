import { ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  const make = (query: () => Promise<unknown>) =>
    new AppController(new AppService(), { $queryRaw: query } as never);

  it('GET / trả "Hello World!"', () => {
    expect(make(async () => 1).getHello()).toBe('Hello World!');
  });

  it('GET /health trả ok khi DB kết nối được', async () => {
    vi.stubEnv('GIT_SHA', 'abc123');
    await expect(make(async () => 1).healthCheck()).resolves.toEqual({
      status: 'ok',
      db: 'up',
      version: 'abc123',
    });
    vi.unstubAllEnvs();
  });

  it('GET /health trả 503 khi DB lỗi', async () => {
    await expect(
      make(async () => {
        throw new Error('down');
      }).healthCheck(),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
