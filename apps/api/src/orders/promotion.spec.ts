import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { InventoryService } from '../inventory/inventory.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from './orders.service.js';

// Mã WELCOME10 như trong seed: giảm 10%, đơn tối thiểu 50.000đ, giảm tối đa 30.000đ.
const welcome10 = {
  id: 1,
  promo_code: 'WELCOME10',
  discount_type: 'PERCENTAGE',
  discount_value: 10,
  min_order_value: 50000,
  max_discount: 30000,
  usage_limit: 1000,
  usage_count: 0,
};

const serviceWith = (promotion: unknown) =>
  new OrdersService(
    {
      promotions: { findFirst: vi.fn(async () => promotion) },
    } as unknown as PrismaService,
    {} as InventoryService,
  );

describe('OrdersService.validatePromotion (FR-11)', () => {
  it('AC-07: WELCOME10 trên đơn 40.000đ → 400 chưa đủ giá trị tối thiểu', async () => {
    await expect(
      serviceWith(welcome10).validatePromotion('welcome10', 40000),
    ).rejects.toThrow(BadRequestException);
    await expect(
      serviceWith(welcome10).validatePromotion('WELCOME10', 40000),
    ).rejects.toThrow(/tối thiểu/);
  });

  it('đơn 60.000đ được giảm 10% = 6.000đ', async () => {
    const r = await serviceWith(welcome10).validatePromotion(
      'WELCOME10',
      60000,
    );
    expect(r.discountAmount).toBe(6000);
    expect(r.total).toBe(54000);
  });

  it('giảm không vượt quá max_discount', async () => {
    const r = await serviceWith(welcome10).validatePromotion(
      'WELCOME10',
      500000,
    );
    expect(r.discountAmount).toBe(30000);
  });

  it('mã không tồn tại hoặc hết hạn → 400', async () => {
    await expect(
      serviceWith(null).validatePromotion('NOPE', 60000),
    ).rejects.toThrow(BadRequestException);
  });
});
