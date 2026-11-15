# ADR-004: Thanh toán idempotent bằng Idempotency-Key

- **Trạng thái:** Chấp nhận – 15/11/2026
- **Bối cảnh:** Khách có thể bấm nhiều lần hoặc mất mạng rồi gửi lại; không được trừ tiền hai lần (FR-07).
- **Quyết định:** Web sinh UUID cho mỗi lần bấm "Xác nhận thanh toán" và gửi header `Idempotency-Key`. Bảng `payments` có `UNIQUE(idempotency_key)`. API tìm payment theo key trước: có thì trả lại kết quả cũ; chưa có thì INSERT (lỗi unique khi đồng thời → đọc lại và trả kết quả bản ghi đã có) rồi mới gọi cổng thanh toán.
- **Hệ quả:** (+) Đáp ứng tiêu chí (b) kể cả khi 2 request đồng thời. (−) Phải lưu payment PENDING trước khi gọi cổng; cần dọn payment PENDING treo khi đơn hết hạn.
