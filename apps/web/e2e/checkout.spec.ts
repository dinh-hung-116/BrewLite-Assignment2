// Luồng Đặt và thanh toán (UC-06 + UC-08) trên giao diện, đúng kịch bản demo.
import { expect, test, type Page } from '@playwright/test';

async function registerAndFillCart(page: Page) {
  await page.goto('/register');
  await page.fill('#name', 'Khách E2E');
  await page.fill('#email', `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@brewlite.vn`);
  await page.fill('#password', 'password123');
  await page.click('button[type=submit]');
  await page.waitForURL((url) => !url.pathname.startsWith('/register'));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Menu đồ uống' })).toBeVisible();
  await page.locator('a[href^="/products/"]').first().click();
  await page.getByRole('button', { name: /Thêm vào giỏ/ }).click();

  await page.goto('/cart');
  await page.getByRole('button', { name: 'Thanh toán' }).click();
  await page.waitForURL(/\/mock-pay\?/);
}

test('AC-01: thanh toán bằng ví → đơn Đã thanh toán', async ({ page }) => {
  await registerAndFillCart(page);
  await page.getByLabel('Ví điện tử').check();
  await page.getByRole('button', { name: 'Thanh toán' }).click();
  await page.waitForURL(/\/order-confirmation/);
  await expect(page.getByText('Đã thanh toán')).toBeVisible();
});

test('AC-02: thẻ đuôi 0002 → Thanh toán thất bại', async ({ page }) => {
  await registerAndFillCart(page);
  await page.getByLabel('Thẻ ngân hàng').check();
  await page.fill('#card-number', '4000 0000 0000 0002');
  await page.getByRole('button', { name: 'Thanh toán' }).click();
  await page.waitForURL(/\/order-confirmation/);
  await expect(page.getByText('Thanh toán thất bại').first()).toBeVisible();
});

test('AC-06: chưa đăng nhập mở /orders → được yêu cầu đăng nhập', async ({ page }) => {
  await page.goto('/orders');
  await expect(page.getByText(/đăng nhập/i).first()).toBeVisible();
});
