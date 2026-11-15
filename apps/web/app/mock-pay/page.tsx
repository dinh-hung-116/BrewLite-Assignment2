'use client';

// Trang cổng thanh toán mô phỏng (ADR-008). Backend chuyển khách tới đây thay cho cổng thật.
// Ví điện tử luôn thành công; thẻ có 4 số cuối 0002 bị từ chối để demo nhánh lỗi.
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { confirmMockPayment } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function MockPayPage() {
  return (
    <Suspense fallback={null}>
      <MockPay />
    </Suspense>
  );
}

function MockPay() {
  const params = useSearchParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const orderCode = params.get('orderCode') ?? '';
  const paymentId = Number(params.get('paymentId'));
  const [method, setMethod] = useState<'WALLET' | 'CARD'>('WALLET');
  const [card, setCard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) {
      router.push('/login');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await confirmMockPayment(
        { orderCode, paymentId, method, cardNumber: method === 'CARD' ? card : undefined },
        accessToken,
      );
      const code = encodeURIComponent(res.orderCode);
      router.replace(`/order-confirmation?orderCode=${code}${res.paid ? '' : '&status=failed'}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (!orderCode || !paymentId) {
    return <p className="p-6 text-red-700">Thiếu thông tin thanh toán. Hãy quay lại giỏ hàng.</p>;
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Thanh toán đơn #{orderCode}</h1>
      <p className="mt-1 text-sm text-gray-600">
        Cổng thanh toán mô phỏng, không trừ tiền thật.
      </p>
      <form onSubmit={pay} className="mt-4 space-y-3" aria-label="Thanh toán">
        <fieldset className="space-y-2">
          <legend className="font-medium">Phương thức</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              id="method-wallet"
              checked={method === 'WALLET'}
              onChange={() => setMethod('WALLET')}
            />
            Ví điện tử
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="method"
              id="method-card"
              checked={method === 'CARD'}
              onChange={() => setMethod('CARD')}
            />
            Thẻ ngân hàng
          </label>
        </fieldset>
        {method === 'CARD' && (
          <label className="block">
            <span className="text-sm">Số thẻ (16 số)</span>
            <input
              id="card-number"
              inputMode="numeric"
              autoComplete="off"
              className="mt-1 w-full rounded border px-3 py-2"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              placeholder="4242 4242 4242 4242"
            />
            <span className="text-xs text-gray-500">Thử thẻ đuôi 0002 để xem trường hợp thanh toán lỗi.</span>
          </label>
        )}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-amber-700 px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {busy ? 'Đang xử lý…' : 'Thanh toán'}
        </button>
      </form>
    </main>
  );
}
