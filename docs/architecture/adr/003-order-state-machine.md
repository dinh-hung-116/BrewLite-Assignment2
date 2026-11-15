# ADR-003: State machine tập trung cho trạng thái đơn

- **Trạng thái:** Chấp nhận – 15/11/2026
- **Bối cảnh:** Nhiều chỗ đổi trạng thái đơn (thanh toán, hủy, quầy pha chế, job hết hạn). Đổi rải rác dễ nhảy cóc; hai nhân viên có thể bấm cùng lúc.
- **Quyết định:** Bảng chuyển trạng thái duy nhất `ORDER_TRANSITIONS` và hàm `assertTransition(from, to)` (ném 409). Ghi trạng thái bằng UPDATE có điều kiện `WHERE id = ? AND status = <trạng thái đã đọc>`; 0 dòng bị ảnh hưởng → 409.
- **Hệ quả:** (+) Đáp ứng FR-10, NFR-05, tiêu chí (a); test được toàn bộ cặp trạng thái. (−) Thêm trạng thái mới phải sửa bảng và sơ đồ Class-01/Activity-01.
