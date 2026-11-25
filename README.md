
# LeafAI — Frontend Demo

link deploy: https://leaf-ai-jade.vercel.app/

LeafAI là giao diện React + TypeScript chạy độc lập trên trình duyệt, không cần backend.

## Yêu cầu
- Windows 11
- Node.js LTS (khuyến nghị Node.js 20 trở lên)
- VS Code

## Cài đặt và chạy
Mở PowerShell tại thư mục `LeafAI`, chạy:

```powershell
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (mặc định `http://localhost:5173`).

## Build kiểm tra
```powershell
npm run build
```

## Chức năng hiện có
- Dashboard và biểu đồ hoạt động.
- Tải ảnh JPG/PNG/WEBP, xem trước, kéo thả, giới hạn 12 MB.
- Quy trình phân tích minh họa với trạng thái đang xử lý.
- Lịch sử lưu trên trình duyệt (localStorage), tìm kiếm, lọc, xóa.
- Xuất lịch sử CSV.
- Thư viện dấu hiệu bệnh cây và gợi ý chăm sóc tham khảo.
- Hồ sơ demo, cài đặt giao diện sáng/tối.
- Responsive cho desktop, tablet và điện thoại.

## Tài khoản / dữ liệu
Không cần đăng nhập. Tên hồ sơ và lịch sử được lưu cục bộ trên trình duyệt.

## Lưu ý quan trọng
Đây là **bản frontend demo**. Chức năng phân tích tạo kết quả minh họa theo tên tệp, không chạy mô hình AI, không chẩn đoán bệnh thật và không nên dùng để quyết định xử lý cây trồng. Dữ liệu được lưu trong localStorage của trình duyệt hiện tại.
