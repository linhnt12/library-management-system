# Giải Thích Các Thống Kê Trong Dashboard

## 1. Tổng Quan

Dashboard hiển thị các thống kê và báo cáo quan trọng của hệ thống quản lý thư viện, giúp quản trị viên và thủ thư theo dõi hoạt động, phát hiện vấn đề và đưa ra quyết định.

Dashboard bao gồm các phần chính:

- **Overview Stats**: Các số liệu tổng quan quan trọng
- **Important Alerts**: Cảnh báo cần xử lý ngay
- **Charts**: Biểu đồ trực quan hóa dữ liệu
- **Top Lists**: Danh sách top items

---

## 2. Overview Stats (Thống Kê Tổng Quan)

Các thẻ thống kê hiển thị các số liệu quan trọng nhất của hệ thống:

### 2.1. Total Books (Tổng Số Sách)

- **Mô tả**: Tổng số sách (Books) trong hệ thống
- **Ý nghĩa**: Cho biết quy mô bộ sưu tập sách của thư viện
- **Trend**: So sánh với tháng trước để theo dõi tăng trưởng
- **Nguồn dữ liệu**: Đếm số lượng records trong bảng `Book` (isDeleted = false)

### 2.2. Total Book Copies (Tổng Số Bản Sao)

- **Mô tả**: Tổng số bản sao sách vật lý (BookItems) trong hệ thống
- **Ý nghĩa**: Cho biết tổng số bản sao có thể cho mượn
- **Trend**: So sánh với tháng trước
- **Nguồn dữ liệu**: Đếm số lượng records trong bảng `BookItem` (isDeleted = false)

### 2.3. Total Users (Tổng Số Người Dùng)

- **Mô tả**: Tổng số người dùng đã đăng ký trong hệ thống
- **Ý nghĩa**: Cho biết số lượng thành viên của thư viện
- **Trend**: So sánh với tháng trước để theo dõi tăng trưởng người dùng
- **Nguồn dữ liệu**: Đếm số lượng records trong bảng `User` (isDeleted = false)

### 2.4. Active Borrows (Lượt Mượn Đang Hoạt Động)

- **Mô tả**: Số lượng lượt mượn đang được mượn (status = BORROWED)
- **Ý nghĩa**: Cho biết số sách đang được người dùng mượn
- **Màu sắc**: Sử dụng màu status.Borrowed để nhấn mạnh
- **Nguồn dữ liệu**: Đếm số lượng `BorrowRecord` có status = 'BORROWED' và isDeleted = false

### 2.5. Overdue Borrows (Lượt Mượn Quá Hạn)

- **Mô tả**: Số lượng lượt mượn đã quá hạn trả (status = OVERDUE)
- **Ý nghĩa**: Cảnh báo các lượt mượn cần xử lý ngay
- **Màu sắc**: Sử dụng màu status.Damaged để cảnh báo
- **Nguồn dữ liệu**: Đếm số lượng `BorrowRecord` có status = 'OVERDUE' và isDeleted = false

### 2.6. Total Ebooks (Tổng Số Ebook)

- **Mô tả**: Tổng số ebook/audio book (BookEditions) trong hệ thống
- **Ý nghĩa**: Cho biết quy mô bộ sưu tập sách điện tử
- **Màu sắc**: Sử dụng màu status.Reserved
- **Nguồn dữ liệu**: Đếm số lượng records trong bảng `BookEdition` (isDeleted = false)

### 2.7. Pending Borrow Requests (Yêu Cầu Mượn Đang Chờ)

- **Mô tả**: Số lượng yêu cầu mượn sách đang chờ duyệt (status = PENDING)
- **Ý nghĩa**: Cho biết số yêu cầu cần được thủ thư xử lý
- **Màu sắc**: Sử dụng màu status.Borrowed để nhấn mạnh
- **Nguồn dữ liệu**: Đếm số lượng `BorrowRequest` có status = 'PENDING' và isDeleted = false

### 2.8. Total Revenue (This Month) (Tổng Doanh Thu Tháng Này)

- **Mô tả**: Tổng số tiền đã thu được từ các khoản thanh toán trong tháng hiện tại
- **Ý nghĩa**: Cho biết doanh thu từ các phí vi phạm/quá hạn đã được thanh toán
- **Trend**: So sánh với tháng trước để theo dõi xu hướng doanh thu
- **Màu sắc**: Sử dụng màu status.Available (màu xanh) để thể hiện tích cực
- **Nguồn dữ liệu**:
  - Tính tổng `amount` của các `Payment` có:
    - `isPaid = true` (đã thanh toán)
    - `paidAt` trong tháng hiện tại
    - `isDeleted = false`

---

## 3. Important Alerts (Cảnh Báo Quan Trọng)

Các thẻ cảnh báo hiển thị các vấn đề cần xử lý ngay:

### 3.1. Overdue Books (Sách Quá Hạn)

- **Mô tả**: Số lượng lượt mượn đã quá hạn trả và cần xử lý
- **Severity**: `error` (màu đỏ) - mức độ nghiêm trọng cao
- **Ý nghĩa**: Cảnh báo các lượt mượn quá hạn cần liên hệ người dùng hoặc xử lý
- **Nguồn dữ liệu**: Đếm số lượng `BorrowRecord` có status = 'OVERDUE' và isDeleted = false

### 3.2. Pending Borrow Requests (Yêu Cầu Mượn Chờ Duyệt)

- **Mô tả**: Số lượng yêu cầu mượn sách đang chờ thủ thư duyệt
- **Severity**: `warning` (màu vàng) - cần xử lý sớm
- **Ý nghĩa**: Cảnh báo các yêu cầu cần được xem xét và duyệt
- **Nguồn dữ liệu**: Đếm số lượng `BorrowRequest` có status = 'PENDING' và isDeleted = false

### 3.3. Overdue Payments (Thanh Toán Quá Hạn)

- **Mô tả**: Số lượng khoản thanh toán đã quá hạn nhưng chưa được thanh toán
- **Severity**: `error` (màu đỏ) - mức độ nghiêm trọng cao
- **Ý nghĩa**: Cảnh báo các khoản phí vi phạm/quá hạn cần được thu hồi
- **Nguồn dữ liệu**:
  - Đếm số lượng `Payment` có:
    - `isPaid = false` (chưa thanh toán)
    - `dueDate` đã qua ngày hiện tại
    - `isDeleted = false`

### 3.4. Books Need Maintenance (Sách Cần Bảo Trì)

- **Mô tả**: Số lượng bản sao sách đang cần bảo trì
- **Severity**: `info` (màu xanh dương) - thông tin cần lưu ý
- **Ý nghĩa**: Cảnh báo các sách cần được kiểm tra và bảo trì
- **Nguồn dữ liệu**: Đếm số lượng `BookItem` có status = 'MAINTENANCE' và isDeleted = false

---

## 4. Charts (Biểu Đồ)

### 4.1. Borrowing Trend (Xu Hướng Mượn Sách)

- **Loại biểu đồ**: Line Chart (Biểu đồ đường)
- **Mô tả**: Hiển thị xu hướng số lượt mượn sách theo thời gian
- **Dữ liệu**:
  - Trục X: Các khoảng thời gian (T1, T2, T3, ...)
  - Trục Y: Số lượt mượn
- **Ý nghĩa**:
  - Theo dõi xu hướng mượn sách tăng/giảm theo thời gian
  - Xác định thời điểm cao điểm mượn sách
  - Dự đoán nhu cầu trong tương lai
- **Nguồn dữ liệu**:
  - Nhóm các `BorrowRecord` theo khoảng thời gian (tuần/tháng/năm) dựa trên `borrowDate`
  - Đếm số lượng records trong mỗi khoảng thời gian

### 4.2. User Distribution by Role (Phân Bố Người Dùng Theo Vai Trò)

- **Loại biểu đồ**: Pie Chart (Biểu đồ tròn)
- **Mô tả**: Hiển thị tỷ lệ phân bố người dùng theo các vai trò khác nhau
- **Dữ liệu**:
  - **READER**: Người đọc (màu primary.500 - cam)
  - **LIBRARIAN**: Thủ thư (màu secondary.500 - xanh đậm)
  - **ADMIN**: Quản trị viên (màu xám)
- **Ý nghĩa**:
  - Hiểu được cấu trúc người dùng trong hệ thống
  - Xác định tỷ lệ giữa các vai trò
- **Nguồn dữ liệu**:
  - Nhóm các `User` theo `role`
  - Đếm số lượng users trong mỗi role (isDeleted = false)

### 4.3. Book Copies Distribution by Status (Phân Bố Bản Sao Theo Trạng Thái)

- **Loại biểu đồ**: Bar Chart (Biểu đồ cột)
- **Mô tả**: Hiển thị số lượng bản sao sách theo từng trạng thái
- **Dữ liệu**:
  - **AVAILABLE**: Sẵn sàng cho mượn (màu status.Available - xanh lá)
  - **ON_BORROW**: Đang được mượn (màu status.Borrowed - cam)
  - **RESERVED**: Đã được đặt trước (màu status.Reserved - xanh dương)
  - **MAINTENANCE**: Đang bảo trì (màu status.Damaged - đỏ)
  - **LOST**: Bị mất (màu status.Lost - xám)
- **Ý nghĩa**:
  - Hiểu được tình trạng sử dụng của bộ sưu tập sách
  - Xác định số sách có sẵn để cho mượn
  - Phát hiện các vấn đề (sách bị mất, cần bảo trì)
- **Nguồn dữ liệu**:
  - Nhóm các `BookItem` theo `status`
  - Đếm số lượng items trong mỗi status (isDeleted = false)

### 4.4. Borrow Request Distribution by Status (Phân Bố Yêu Cầu Mượn Theo Trạng Thái)

- **Loại biểu đồ**: Bar Chart (Biểu đồ cột)
- **Mô tả**: Hiển thị số lượng yêu cầu mượn sách theo từng trạng thái
- **Dữ liệu**:
  - **APPROVED**: Đã được duyệt (màu status.Available - xanh lá)
  - **PENDING**: Đang chờ duyệt (màu status.Reserved - xanh dương)
  - **REJECTED**: Đã bị từ chối (màu status.Damaged - đỏ)
  - **FULFILLED**: Đã hoàn thành (màu primary.500 - cam)
- **Ý nghĩa**:
  - Theo dõi quy trình xử lý yêu cầu mượn
  - Xác định tỷ lệ duyệt/từ chối
  - Phát hiện các yêu cầu cần xử lý
- **Nguồn dữ liệu**:
  - Nhóm các `BorrowRequest` theo `status`
  - Đếm số lượng requests trong mỗi status (isDeleted = false)

---

## 5. Top Lists (Danh Sách Top)

### 5.1. Top 10 Most Borrowed Books (Top 10 Sách Được Mượn Nhiều Nhất)

- **Mô tả**: Danh sách 10 cuốn sách được mượn nhiều nhất
- **Thông tin hiển thị**:
  - **Rank**: Thứ hạng (1-10)
  - **Title**: Tên sách
  - **Subtitle**: Tên tác giả
  - **Value**: Số lượt mượn
- **Ý nghĩa**:
  - Xác định sách phổ biến nhất
  - Quyết định mua thêm bản sao cho sách được mượn nhiều
  - Hiểu được sở thích của người đọc
- **Nguồn dữ liệu**:
  - Đếm số lượng `BorrowRecord` liên quan đến mỗi `Book` (thông qua `BorrowBook`)
  - Sắp xếp theo số lượt mượn giảm dần
  - Lấy top 10

### 5.2. Top 5 Most Active Users (Top 5 Người Dùng Hoạt Động Nhất)

- **Mô tả**: Danh sách 5 người dùng mượn sách nhiều nhất
- **Thông tin hiển thị**:
  - **Rank**: Thứ hạng (1-5)
  - **Title**: Tên người dùng
  - **Subtitle**: Email
  - **Value**: Số lượt mượn
- **Ý nghĩa**:
  - Xác định người dùng tích cực nhất
  - Có thể áp dụng chương trình khuyến khích cho người dùng hoạt động
  - Hiểu được hành vi sử dụng thư viện
- **Nguồn dữ liệu**:
  - Đếm số lượng `BorrowRecord` của mỗi `User`
  - Sắp xếp theo số lượt mượn giảm dần
  - Lấy top 5

---

## 6. Time Range Selector (Bộ Chọn Khoảng Thời Gian)

- **Mô tả**: Cho phép người dùng chọn khoảng thời gian để lọc dữ liệu
- **Các tùy chọn**: 7 ngày, 30 ngày, 90 ngày, 1 năm
- **Ý nghĩa**:
  - Xem thống kê theo các khoảng thời gian khác nhau
  - So sánh dữ liệu giữa các kỳ
  - Phân tích xu hướng ngắn hạn và dài hạn

---

## 7. Lưu Ý Khi Triển Khai

### 7.1. Performance (Hiệu Suất)

- Sử dụng aggregation queries hiệu quả để tính toán thống kê
- Cache các thống kê không thay đổi thường xuyên
- Cân nhắc background jobs để tính toán thống kê định kỳ

### 7.2. Real-time Updates (Cập Nhật Thời Gian Thực)

- Có thể sử dụng WebSocket để cập nhật real-time cho các số liệu quan trọng
- Hoặc polling định kỳ (ví dụ: mỗi 30 giây) cho các số liệu thay đổi nhanh

### 7.3. Permissions (Phân Quyền)

- Chỉ ADMIN và LIBRARIAN mới xem được dashboard
- Một số thống kê tài chính có thể giới hạn chỉ ADMIN

### 7.4. Responsive Design (Thiết Kế Đáp Ứng)

- Dashboard cần responsive cho mobile
- Sắp xếp lại layout trên màn hình nhỏ (grid columns thay đổi)

### 7.5. Data Filtering (Lọc Dữ Liệu)

- Time Range Selector cho phép filter theo khoảng thời gian
- Có thể mở rộng thêm filter theo category, author, etc.

---

## 8. Kết Luận

Dashboard cung cấp cái nhìn tổng quan về hoạt động của thư viện, bao gồm:

- **Tổng quan nhanh**: Các số liệu quan trọng nhất
- **Cảnh báo**: Những việc cần xử lý ngay
- **Xu hướng**: Biểu đồ để hiểu xu hướng hoạt động
- **Chi tiết**: Top lists để xem các items nổi bật

Tất cả các thống kê hiện đang sử dụng mock data. Cần tích hợp với API để lấy dữ liệu thực từ database.
