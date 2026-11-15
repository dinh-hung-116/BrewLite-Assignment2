# ADR-005: Giữ chỗ nguyên liệu bằng transaction và optimistic locking

- **Trạng thái:** Chấp nhận – 15/11/2026
- **Bối cảnh:** Nhiều khách đặt cùng lúc khi nguyên liệu sắp hết (FR-13, tiêu chí (c)).
- **Quyết định:** Bảng `ingredients` có cột `reserved` và `version`. Khi tạo đơn, trong một transaction: `UPDATE ... SET reserved = reserved + q, version = version + 1 WHERE id = ? AND version = ? AND quantity - reserved >= q`; 0 dòng → đọc lại và thử lại tối đa 3 lần, vẫn lỗi hoặc thiếu hàng → rollback, trả 409. Trừ hẳn khi COMPLETED, trả lại khi CANCELLED (BR-04).
- **Phương án đã cân nhắc:** `SELECT ... FOR UPDATE` (pessimistic) – đơn giản nhưng giữ khóa lâu khi nhiều món; hàng đợi đơn – quá phức tạp cho quy mô môn học.
- **Hệ quả:** (+) Không bán quá kho, không khóa dài. (−) Có thể báo "thử lại" khi tranh chấp rất cao.
