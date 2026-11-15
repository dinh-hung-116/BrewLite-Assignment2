# ADR-008: Dịch vụ thanh toán mô phỏng sau một interface

- **Trạng thái:** Chấp nhận – 15/11/2026
- **Bối cảnh:** Đề yêu cầu thanh toán Ví/Thẻ **mô phỏng**; A1 dùng VNPay sandbox nên phụ thuộc mạng và khó test nhánh lỗi.
- **Quyết định:** Định nghĩa interface `PaymentGateway.charge(orderCode, amount, method) → SUCCEEDED | FAILED`. Bản dùng cho A2 là `MockPaymentGateway`: thẻ có số kết thúc `0002` hoặc ví có số dư mô phỏng không đủ thì FAILED, còn lại SUCCEEDED; có độ trễ cấu hình được. Chọn implementation bằng biến `PAYMENT_PROVIDER=mock`.
- **Hệ quả:** (+) Demo và E2E test được cả nhánh thành công/thất bại, không cần mạng ngoài. (+) Có thể thay bằng VNPay sau này mà không đổi service đơn hàng. (−) Không kiểm chứng được tích hợp cổng thật.
