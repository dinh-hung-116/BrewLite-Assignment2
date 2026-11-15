// FR-06/FR-07: cổng thanh toán mô phỏng (ADR-008).
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService, mockGatewayApproves } from './payments.service.js';

describe('mockGatewayApproves', () => {
  it('ví điện tử luôn thành công', () => {
    expect(mockGatewayApproves('WALLET')).toBe(true);
  });
  it('thẻ hợp lệ thành công, thẻ đuôi 0002 bị từ chối', () => {
    expect(mockGatewayApproves('CARD', '4242 4242 4242 4242')).toBe(true);
    expect(mockGatewayApproves('CARD', '4000000000000002')).toBe(false);
  });
  it('số thẻ sai định dạng trả 400', () => {
    expect(() => mockGatewayApproves('CARD', '1234')).toThrow(BadRequestException);
  });
});

describe('PaymentsService.confirmMockPayment', () => {
  const order = { id: 7, order_code: '#1007', user_id: 3, status: 'PAID', total_price: 50000 };
  const make = (payment: object | null) =>
    new PaymentsService({
      orders: { findUnique: vi.fn().mockResolvedValue(order) },
      payments: { findUnique: vi.fn().mockResolvedValue(payment) },
    } as never);

  it('payment đã có kết quả thì trả lại kết quả cũ, không xử lý lần hai (idempotent)', async () => {
    const svc = make({ id: 1, order_id: 7, status: 'SUCCESS' });
    await expect(svc.confirmMockPayment('1007', 1, 3, 'CARD', '4000000000000002')).resolves.toEqual({
      order,
      paid: true,
    });
  });
  it('đơn của người khác trả 404', async () => {
    const svc = make({ id: 1, order_id: 7, status: 'PENDING' });
    await expect(svc.confirmMockPayment('1007', 1, 99, 'WALLET')).rejects.toThrow(NotFoundException);
  });
  it('payment không thuộc đơn trả 404', async () => {
    const svc = make({ id: 1, order_id: 8, status: 'PENDING' });
    await expect(svc.confirmMockPayment('1007', 1, 3, 'WALLET')).rejects.toThrow(NotFoundException);
  });
});
