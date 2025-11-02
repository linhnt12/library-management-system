# LUỒNG CHI TIẾT

## 📋 Tổng quan

- ✅ Reader nhận sách **sau khi thủ thư tạo BorrowRecord** (không tự động)
- ✅ Tự động approve BorrowRequest khi có đủ sách để đặt trước (tính ở level Book - số lượng)
- ✅ **Không reserve BookItem** khi đặt trước, chỉ tính số lượng còn lại: `Total AVAILABLE - Đã đặt trước (APPROVED)`
- ✅ Thủ thư mới tạo BorrowRecord khi giao sách thực tế và chọn BookItem cụ thể
- ✅ Hold Queue theo FIFO để đảm bảo công bằng
- ✅ Nhiều readers có thể cùng có request APPROVED cho cùng một cuốn sách (nếu còn đủ số lượng)

---

## 🎯 TRƯỜNG HỢP 1: Có sách ngay (Instant Approval)

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Reader tạo yêu cầu mượn        │
└──────────────────────────────────────────┘
```

**Input từ Reader:**

- Chọn sách: "Harry Potter" - 2 quyển
- Thời gian mượn: 01/01/2025 → 15/01/2025
- Nhấn nút "Mượn sách"

**Logic hệ thống:**

```typescript
// 1. Đếm tổng BookItem AVAILABLE
const totalAvailable = await prisma.bookItem.count({
  where: {
    bookId: bookId,
    status: 'AVAILABLE',
    isDeleted: false,
  },
});

// 2. Đếm tổng quantity đã được đặt trước (BorrowRequest APPROVED chưa FULFILLED)
const reservedQuantity = await prisma.borrowRequestItem.aggregate({
  where: {
    bookId: bookId,
    borrowRequest: {
      status: 'APPROVED', // Chỉ tính các request đã được approve
      isDeleted: false,
    },
  },
  _sum: {
    quantity: true,
  },
});

// 3. Tính số lượng còn lại có thể đặt trước
const remainingAvailable = totalAvailable - (reservedQuantity._sum.quantity || 0);

// 4. Nếu remainingAvailable >= quantity cần
if (remainingAvailable >= 2) {
  // → Trường hợp có sách ngay
  // → Xử lý tiếp ở BƯỚC 2
}
```

**Ví dụ:**

- Tổng BookItem AVAILABLE: 3 quyển
- Đã có BorrowRequest APPROVED đặt trước: 2 quyển
- Còn lại: 3 - 2 = 1 quyển
- Request mới cần: 2 quyển → Không đủ → Vào queue
- Request mới cần: 1 quyển → Đủ → APPROVED

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Instant Approval                │
└──────────────────────────────────────────┘
```

**Actions:**

1. **Tính số lượng có thể đặt trước:**
   ```typescript
   remainingAvailable = Tổng BookItem AVAILABLE - Tổng quantity của BorrowRequest APPROVED
   ```
2. **Tạo `BorrowRequest`** với `status = APPROVED` (còn đủ sách để đặt trước)
3. ❌ **KHÔNG thay đổi BookItem status** (giữ nguyên AVAILABLE)
4. ❌ **KHÔNG chọn BookItem cụ thể** (chỉ check số lượng, thủ thư sẽ chọn khi giao sách)
5. ❌ **KHÔNG tạo `BorrowRecord`** (thủ thư tạo khi giao sách)
6. ❌ **KHÔNG tạo `BorrowBook` links** (chưa có BorrowRecord)

**Lưu ý:**

- Đặt trước chỉ tính ở level **Book** (số lượng), không cần chọn BookItem cụ thể
- BookItem vẫn giữ nguyên `status = AVAILABLE` cho đến khi thủ thư giao sách thực tế
- Nhiều readers có thể cùng đặt trước cùng một cuốn sách (nếu còn đủ số lượng)

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Thông báo cho Reader             │
└──────────────────────────────────────────┘
```

**Notification:**

```typescript
Notification {
  userId: readerId,
  title: "Yêu cầu mượn sách đã được duyệt",
  message: "Yêu cầu mượn 'Harry Potter' của bạn đã được duyệt.
            Vui lòng đến thư viện để nhận sách.",
  type: "SYSTEM",
  status: "UNREAD"
}
```

**Trạng thái cuối:**

- ✅ `BorrowRequest.status = APPROVED`
- ❌ `BorrowRecord` = null (chưa tạo, thủ thư sẽ tạo khi giao sách)
- ✅ `BookItem.status = AVAILABLE` (không thay đổi, chờ thủ thư giao)
- ✅ Reader: "Yêu cầu đã được duyệt, đến thư viện để nhận sách"

**Bước tiếp theo (Thủ thư giao sách):**

```
┌──────────────────────────────────────────┐
│ BƯỚC 4: Thủ thư giao sách              │
└──────────────────────────────────────────┘
```

1. **Thủ thư tìm BorrowRequest** với `status = APPROVED`
2. **Chọn BookItem cụ thể:**
   ```typescript
   // Ưu tiên condition tốt nhất
   BookItem WHERE bookId = X
     AND status = 'AVAILABLE'
   ORDER BY condition DESC (NEW > GOOD > WORN)
   LIMIT 1
   ```
3. **Tạo `BorrowRecord`:**
   ```typescript
   BorrowRecord {
     userId: readerId,
     borrowDate: "2025-01-01",
     returnDate: "2025-01-15",
     status: "BORROWED"
   }
   ```
4. **Tạo `BorrowBook` links:**
   ```typescript
   BorrowBook {
     borrowId: borrowRecord.id,
     bookItemId: bookItem1.id
   }
   ```
5. **Update `BookItem.status`:**
   ```typescript
   BookItem1.status = 'ON_BORROW'; // AVAILABLE → ON_BORROW
   ```
6. **Update `BorrowRequest.status = 'FULFILLED'`**

---

## ⏳ TRƯỜNG HỢP 2: Không có sách → Vào Hold Queue

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Reader tạo yêu cầu mượn        │
└──────────────────────────────────────────┘
```

**Input từ Reader:**

- Chọn sách: "Dune" - 1 quyển
- Thời gian mượn: 01/01/2025 → 15/01/2025
- Nhấn nút "Mượn sách"

**Logic kiểm tra:**

```typescript
// 1. Đếm tổng BookItem AVAILABLE
const totalAvailable = await prisma.bookItem.count({
  where: {
    bookId: 'Dune',
    status: 'AVAILABLE',
    isDeleted: false,
  },
});

// 2. Đếm tổng quantity đã được đặt trước
const reservedQuantity = await prisma.borrowRequestItem.aggregate({
  where: {
    bookId: 'Dune',
    borrowRequest: {
      status: 'APPROVED',
      isDeleted: false,
    },
  },
  _sum: {
    quantity: true,
  },
});

// 3. Tính số lượng còn lại
const remainingAvailable = totalAvailable - (reservedQuantity._sum.quantity || 0);

// remainingAvailable = 0 hoặc < quantity cần → Vào queue
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Tạo Request và vào Hold Queue   │
└──────────────────────────────────────────┘
```

**Actions:**

1. **Tạo `BorrowRequest`:**

   ```typescript
   BorrowRequest {
     id: 123,
     userId: readerId,
     startDate: "2025-01-01",
     endDate: "2025-01-15",
     status: "PENDING",  // ← Quan trọng: Status PENDING
     createdAt: "2025-01-01 10:00:00"
   }
   ```

2. **Tạo `BorrowRequestItem`:**

   ```typescript
   BorrowRequestItem {
     borrowRequestId: 123,
     bookId: "Dune",
     quantity: 1,
     startDate: "2025-01-01",
     endDate: "2025-01-15"
   }
   ```

3. ❌ **Không tạo `BorrowRecord`** (chưa có sách)
4. `BookItem` không thay đổi (vẫn `ON_BORROW` hoặc không có)

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Hiển thị vị trí trong Queue     │
└──────────────────────────────────────────┘
```

**Tính toán position trong queue:**

```typescript
// Query tất cả request PENDING cho bookId này
const queue = await prisma.borrowRequestItem.findMany({
  where: {
    bookId: 'Dune',
    borrowRequest: {
      status: 'PENDING',
      isDeleted: false,
    },
  },
  orderBy: {
    createdAt: 'asc', // FIFO
  },
});

// Request của user ở vị trí nào?
// Position = số request có createdAt < request này + 1
const position = queue.findIndex(r => r.borrowRequestId === 123) + 1;
```

**Thông tin hiển thị cho Reader:**

```
📚 Sách: "Dune"
⏳ Trạng thái: Đang chờ trong hàng đợi
📍 Vị trí: #3 trong 5 người chờ
📅 Ngày đăng ký: 01/01/2025 10:00
```

**Notification ngay lập tức:**

```typescript
Notification {
  userId: readerId,
  title: "Yêu cầu mượn sách đã được đăng ký",
  message: "Yêu cầu mượn 'Dune' của bạn đã được đăng ký.
            Bạn đang ở vị trí #3 trong hàng đợi.
            Chúng tôi sẽ thông báo khi sách sẵn sàng.",
  type: "SYSTEM",
  status: "UNREAD"
}
```

---

## 🔄 TRƯỜNG HỢP 3: Sách trả về → Xử lý Hold Queue

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Sách được trả về                │
└──────────────────────────────────────────┘
```

**Action:**

```typescript
// Librarian hoặc Reader trả sách
// Update BookItem status
UPDATE BookItem
SET status = 'AVAILABLE'
WHERE id = bookItemId AND status = 'ON_BORROW'
```

**Kết quả:**

- ✅ `BookItem.status` từ `ON_BORROW` → `AVAILABLE`

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Trigger Hold Queue Processing   │
└──────────────────────────────────────────┘
```

**Event được trigger:**

```typescript
// Sau khi update BookItem status
await handleBookReturn(bookItemId);
```

**Logic xử lý queue:**

```typescript
async function processHoldQueueForBook(bookId: number) {
  // 1. Lấy request đầu tiên trong queue (FIFO)
  const firstRequest = await prisma.borrowRequestItem.findFirst({
    where: {
      bookId: bookId,
      borrowRequest: {
        status: 'PENDING',
        isDeleted: false,
      },
    },
    include: {
      borrowRequest: {
        include: {
          items: true, // Tất cả items trong request
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc', // Người đăng ký sớm nhất
    },
  });

  // firstRequest = Request #120 (đăng ký sớm nhất)
}
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Kiểm tra đủ sách cho request     │
└──────────────────────────────────────────┘
```

**Validation logic:**

```typescript
// Request #120 có:
// - Item 1: "Dune" - quantity: 1
// - Item 2: "Foundation" - quantity: 2

// Kiểm tra từng item
for (const item of request.items) {
  // 1. Đếm tổng BookItem AVAILABLE
  const totalAvailable = await prisma.bookItem.count({
    where: {
      bookId: item.bookId,
      status: 'AVAILABLE',
      isDeleted: false,
    },
  });

  // 2. Đếm tổng quantity đã được đặt trước (APPROVED)
  const reservedQuantity = await prisma.borrowRequestItem.aggregate({
    where: {
      bookId: item.bookId,
      borrowRequest: {
        status: 'APPROVED',
        isDeleted: false,
      },
    },
    _sum: {
      quantity: true,
    },
  });

  // 3. Tính số lượng còn lại có thể đặt trước
  const remainingAvailable = totalAvailable - (reservedQuantity._sum.quantity || 0);

  if (remainingAvailable < item.quantity) {
    // ❌ Chưa đủ sách
    return null; // Không approve, giữ trong queue
  }
}

// ✅ Đủ sách cho TẤT CẢ items
// → Tiếp tục approve
```

**Các trường hợp:**

**Case A: Đủ sách cho tất cả items**

```
Request #120 có 2 items:
- "Dune": cần 1
  - Total AVAILABLE: 2
  - Đã đặt trước (APPROVED): 0
  - Còn lại: 2 - 0 = 2 ✅ (>= 1)
- "Foundation": cần 2
  - Total AVAILABLE: 3
  - Đã đặt trước (APPROVED): 0
  - Còn lại: 3 - 0 = 3 ✅ (>= 2)
→ APPROVE ngay
```

**Case B: Chưa đủ (một phần)**

```
Request #120 có 2 items:
- "Dune": cần 1
  - Total AVAILABLE: 2
  - Đã đặt trước (APPROVED): 1
  - Còn lại: 2 - 1 = 1 ✅ (>= 1)
- "Foundation": cần 2
  - Total AVAILABLE: 3
  - Đã đặt trước (APPROVED): 2
  - Còn lại: 3 - 2 = 1 ❌ (< 2)
→ KHÔNG approve, giữ PENDING
→ Chờ thêm sách "Foundation" trả về
```

**Case C: Nhiều request trong queue**

```
Queue cho "Dune":
1. Request #120 (createdAt: 01/01 10:00)
2. Request #121 (createdAt: 01/01 11:00)
3. Request #122 (createdAt: 01/01 12:00)

Sách trả về: 1 quyển "Dune"
→ Xử lý Request #120 trước (FIFO)
→ Request #121, #122 vẫn PENDING
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 4: Tự động Approve & Reserve       │
└──────────────────────────────────────────┘
```

**Transaction tự động approve:**

```typescript
await prisma.$transaction(async tx => {
  // Chỉ update BorrowRequest status
  // KHÔNG thay đổi BookItem status
  await tx.borrowRequest.update({
    where: { id: request.id },
    data: { status: 'APPROVED' },
  });
});
```

**Trạng thái sau khi approve:**

```
BorrowRequest #120:
  status: PENDING → APPROVED ✅

❌ BorrowRecord: CHƯA TẠO (thủ thư sẽ tạo khi giao sách)

BookItem:
  - Item #10: status = AVAILABLE (không thay đổi) ✅
  - Item #20: status = AVAILABLE (không thay đổi) ✅
  - Item #21: status = AVAILABLE (không thay đổi) ✅
```

**Bước tiếp theo (Thủ thư giao sách):**

```
┌──────────────────────────────────────────┐
│ BƯỚC 5: Thủ thư tạo BorrowRecord        │
└──────────────────────────────────────────┘
```

1. **Tạo BorrowRecord:**

   ```typescript
   BorrowRecord {
     userId: request.userId,
     borrowDate: request.startDate,
     returnDate: request.endDate,
     status: 'BORROWED'
   }
   ```

2. **Chọn BookItem và tạo BorrowBook links:**

   ```typescript
   // Chọn BookItem từ các items AVAILABLE (ưu tiên condition tốt nhất)
   for (const item of request.items) {
     const selectedItem = await tx.bookItem.findFirst({
       where: {
         bookId: item.bookId,
         status: 'AVAILABLE',
         isDeleted: false,
       },
       orderBy: [
         { condition: 'desc' }, // NEW > GOOD > WORN > DAMAGED
         { createdAt: 'asc' },
       ],
     });

     if (selectedItem) {
       await tx.borrowBook.create({
         data: {
           borrowId: borrowRecord.id,
           bookItemId: selectedItem.id,
         },
       });

       await tx.bookItem.update({
         where: { id: selectedItem.id },
         data: { status: 'ON_BORROW' }, // AVAILABLE → ON_BORROW
       });
     }
   }
   ```

3. **Update BorrowRequest:**
   ```typescript
   BorrowRequest.status = 'FULFILLED';
   ```

```
┌──────────────────────────────────────────┐
│ BƯỚC 5: Thông báo cho Reader            │
└──────────────────────────────────────────┘
```

**Notification:**

```typescript
Notification {
  userId: readerId (Request #120),
  title: "Yêu cầu mượn sách đã được duyệt",
  message: "Yêu cầu mượn sách của bạn đã được duyệt tự động!
            Bạn có thể mượn:
            - Dune (1 quyển)
            - Foundation (2 quyển)
            Vui lòng đến thư viện để nhận sách.",
  type: "SYSTEM",
  status: "UNREAD"
}
```

**Lưu ý:**

- Sách vẫn AVAILABLE, không bị reserve khi tạo request
- Nhiều readers có thể có request APPROVED cho cùng một cuốn sách
- Thủ thư sẽ chọn BookItem và tạo BorrowRecord khi reader đầu tiên đến nhận sách

**Cập nhật queue position:**

- ✅ Request #121: Position #2 → #1
- ✅ Request #122: Position #3 → #2

---

## 📚 TRƯỜNG HỢP 4: Request với nhiều sách (Multi-Item Request)

### Ví dụ:

```
Request #125 gồm:
- "Harry Potter" - 2 quyển
- "Lord of the Rings" - 1 quyển
- "1984" - 3 quyển
```

### Xử lý:

**Khi có sách trả về:**

**Scenario A: Chỉ có "Harry Potter" trả về**

```
    ↓
Process queue cho bookId "Harry Potter"
    ↓
Request #125 được check:
  - "Harry Potter": availableCount = 2, cần 2 ✅
  - "Lord of the Rings": availableCount = 0, cần 1 ❌
  - "1984": availableCount = 1, cần 3 ❌
    ↓
→ KHÔNG approve (thiếu 2 cuốn khác)
→ Giữ PENDING
```

**Scenario B: Tất cả sách đều có available**

```
    ↓
Process queue:
    ↓
Request #125 được check:
  - "Harry Potter": availableCount = 3, cần 2 ✅
  - "Lord of the Rings": availableCount = 1, cần 1 ✅
  - "1984": availableCount = 4, cần 3 ✅
    ↓
→ APPROVE ngay
→ Reserve 6 BookItems (2+1+3) với status = RESERVED
→ KHÔNG tạo BorrowRecord (thủ thư tạo khi giao sách)
```

---

## 🔀 TRƯỜNG HỢP 5: Nhiều request đồng thời (Race Condition)

### Tình huống:

```
Queue cho "Dune":
1. Request #120 (createdAt: 10:00:00)
2. Request #121 (createdAt: 10:00:05)
3. Request #122 (createdAt: 10:00:10)

2 quyển "Dune" trả về cùng lúc:
- BookItem #50 trả về lúc 11:00:00
- BookItem #51 trả về lúc 11:00:01
```

### Xử lý an toàn:

**Dùng Database Transaction:**

```typescript
await prisma.$transaction(async tx => {
  // Lock request để tránh race condition
  const firstRequest = await tx.borrowRequest.findUnique({
    where: { id: requestId },
    // ... với locking
  });

  // Double-check available count trong transaction
  const availableCount = await tx.bookItem.count({
    where: {
      bookId: bookId,
      status: 'AVAILABLE',
    },
  });

  if (availableCount < quantity) {
    throw new Error('Không đủ sách');
  }

  // Proceed với approve
});
```

**Kết quả:**

```
Lần trả về 1 (BookItem #50):
  → Request #120 được approve
  → BookItem #50: giữ nguyên AVAILABLE (không thay đổi)
  → KHÔNG tạo BorrowRecord (thủ thư tạo khi giao sách)
  → Queue: #121 → #1, #122 → #2

Lần trả về 2 (BookItem #51):
  → Request #121 được approve (giờ đã là #1)
  → BookItem #51: giữ nguyên AVAILABLE (không thay đổi)
  → KHÔNG tạo BorrowRecord (thủ thư tạo khi giao sách)
  → Queue: #122 → #1
```

---

## 📊 TỔNG KẾT LUỒNG

### Flowchart tổng hợp:

```
                    Reader tạo BorrowRequest
                              │
                    ┌─────────┴─────────┐
                    │                   │
            [Có sách available?]    [Không có sách]
                    │                   │
                    │                   ↓
                    │          Tạo Request: PENDING
                    │                   │
                    │          Hiển thị Queue Position
                    │          "Bạn ở vị trí #X"
                    │                   │
                    │          ┌────────┴────────┐
                    │          │                 │
                    │      [Sách trả về]    [Chờ...]
                    │          │                 │
                    └──────────┴─────────────────┘
                               │
                    Process Hold Queue (FIFO)
                               │
                    ┌──────────┴──────────┐
                    │                     │
            [Đủ sách cho request?]    [Chưa đủ]
                    │                     │
                    │                     ↓
                    │              Giữ PENDING
                    │              Chờ thêm sách
                    │
                    ↓
        Update Request: PENDING → APPROVED
        ❌ KHÔNG thay đổi BookItem status (giữ AVAILABLE)
        ❌ KHÔNG tạo BorrowRecord
                    │
                    ↓
        Thông báo Reader: "Đã được duyệt, đến thư viện nhận sách"
        Reader đến thư viện
                    │
                    ↓
        Thủ thư chọn BookItem (condition tốt nhất)
        Thủ thư tạo BorrowRecord
        Tạo BorrowBook links
        Update BookItem: AVAILABLE → ON_BORROW
        Update Request: APPROVED → FULFILLED
```

---

## 🔄 TRƯỜNG HỢP 6: Gia hạn mượn sách (Renewal)

### 📋 Tổng quan

- ✅ Reader có thể gia hạn BorrowRecord đang mượn
- ✅ Số lần gia hạn tối đa: **3 lần**
- ❌ **KHÔNG cho gia hạn khi đã quá hạn (OVERDUE)** → Tính phí phạt ở chức năng riêng
- ✅ Kiểm tra conflict với Hold Queue (nếu có người đặt trước → không cho gia hạn)
- ✅ Tăng `returnDate` và `renewalCount++`

---

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Reader yêu cầu gia hạn          │
└──────────────────────────────────────────┘
```

**Input từ Reader:**

- Reader đang mượn sách, `BorrowRecord.status = 'BORROWED'`
- `returnDate = "2025-01-15"` (ngày trả dự kiến)
- `renewalCount = 0` (chưa gia hạn lần nào)
- Reader nhấn nút "Gia hạn mượn sách"

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Validation điều kiện             │
└──────────────────────────────────────────┘
```

**Kiểm tra các điều kiện:**

```typescript
// 1. Kiểm tra trạng thái BorrowRecord
const borrowRecord = await prisma.borrowRecord.findUnique({
  where: { id: borrowRecordId },
  include: {
    borrowBooks: {
      include: {
        bookItem: {
          include: { book: true },
        },
      },
    },
    user: true,
  },
});

// Rule 1: Phải là BORROWED và chưa trả
if (borrowRecord.status !== 'BORROWED' || borrowRecord.actualReturnDate) {
  throw new Error('Không thể gia hạn: Đã trả sách');
}

// Rule 2: KHÔNG được quá hạn
const today = new Date();
if (borrowRecord.returnDate && today > borrowRecord.returnDate) {
  throw new Error('Không thể gia hạn khi đã quá hạn. Vui lòng trả sách hoặc thanh toán phí phạt.');
}

// Rule 3: Không vượt quá 3 lần gia hạn
if (borrowRecord.renewalCount >= 3) {
  throw new Error('Đã đạt số lần gia hạn tối đa (3 lần)');
}
```

**Ví dụ các trường hợp:**

| renewalCount | returnDate | today      | Kết quả                                     |
| ------------ | ---------- | ---------- | ------------------------------------------- |
| 0            | 15/01/2025 | 10/01/2025 | ✅ Cho phép (lần 1)                         |
| 1            | 20/01/2025 | 18/01/2025 | ✅ Cho phép (lần 2)                         |
| 2            | 25/01/2025 | 22/01/2025 | ✅ Cho phép (lần 3)                         |
| 3            | 30/01/2025 | 27/01/2025 | ❌ Đã đạt tối đa                            |
| 1            | 15/01/2025 | 20/01/2025 | ❌ Quá hạn → Tính phí phạt (chức năng khác) |

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Kiểm tra conflict với Hold Queue │
└──────────────────────────────────────────┘
```

**Logic kiểm tra:**

```typescript
// Với mỗi BookItem trong BorrowRecord, check có người đặt trước không
for (const borrowBook of borrowRecord.borrowBooks) {
  const bookId = borrowBook.bookItem.bookId;

  // Đếm số lượng request đang chờ sách này
  const pendingRequests = await prisma.borrowRequestItem.aggregate({
    where: {
      bookId: bookId,
      borrowRequest: {
        status: { in: ['PENDING', 'APPROVED'] },
        isDeleted: false,
      },
    },
    _sum: { quantity: true },
  });

  // Nếu có người chờ → không cho gia hạn (ưu tiên người đang chờ)
  if (pendingRequests._sum.quantity > 0) {
    throw new Error(
      `Sách "${borrowBook.bookItem.book.title}" đang có người đặt trước, không thể gia hạn`
    );
  }
}
```

**Ví dụ conflict:**

```
BorrowRecord #50 đang mượn "Dune" (bookItemId: 100)
Hold Queue cho "Dune":
- Request #120 (PENDING): cần 1 quyển
- Request #121 (APPROVED): cần 1 quyển

→ Tổng: 2 người đang chờ "Dune"
→ Reader của BorrowRecord #50 KHÔNG thể gia hạn
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 4: Tính ngày trả mới               │
└──────────────────────────────────────────┘
```

**Tính toán:**

```typescript
// Thời gian gia hạn (ví dụ: 7-14 ngày)
const EXTENSION_DAYS = 14; // Hoặc lấy từ config/Policy

// Tính ngày trả mới
const oldReturnDate = borrowRecord.returnDate;
const newReturnDate = new Date(oldReturnDate);
newReturnDate.setDate(newReturnDate.getDate() + EXTENSION_DAYS);

// Kiểm tra giới hạn tổng thời gian mượn (ví dụ: không quá 60 ngày từ borrowDate)
const MAX_BORROW_DAYS = 60;
const totalBorrowDays = Math.ceil(
  (newReturnDate.getTime() - borrowRecord.borrowDate.getTime()) / (1000 * 60 * 60 * 24)
);

if (totalBorrowDays > MAX_BORROW_DAYS) {
  // Điều chỉnh newReturnDate về giới hạn tối đa
  newReturnDate = new Date(borrowRecord.borrowDate);
  newReturnDate.setDate(newReturnDate.getDate() + MAX_BORROW_DAYS);
}
```

**Ví dụ:**

```
BorrowRecord:
- borrowDate: 01/01/2025
- returnDate: 15/01/2025 (mượn 14 ngày)
- renewalCount: 0

Gia hạn lần 1:
- newReturnDate: 15/01/2025 + 14 ngày = 29/01/2025
- renewalCount: 1
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 5: Update BorrowRecord              │
└──────────────────────────────────────────┘
```

**Transaction update:**

```typescript
await prisma.$transaction(async tx => {
  // Update BorrowRecord
  const updatedRecord = await tx.borrowRecord.update({
    where: { id: borrowRecordId },
    data: {
      returnDate: newReturnDate,
      renewalCount: { increment: 1 }, // Tăng từ 0 → 1 → 2 → 3 (tối đa)
      status: 'BORROWED', // Đảm bảo vẫn BORROWED (không phải OVERDUE)
      updatedAt: new Date(),
    },
  });

  // ❌ KHÔNG thay đổi BookItem status (vẫn ON_BORROW)
  // ❌ KHÔNG thay đổi BorrowBook links
});
```

**Trạng thái sau khi gia hạn:**

```
BorrowRecord #50:
  returnDate: 15/01/2025 → 29/01/2025 ✅
  renewalCount: 0 → 1 ✅
  status: BORROWED (không đổi) ✅

BookItem #100:
  status: ON_BORROW (không đổi) ✅
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 6: Thông báo cho Reader             │
└──────────────────────────────────────────┘
```

**Notification:**

```typescript
Notification {
  userId: readerId,
  title: "Gia hạn mượn sách thành công",
  message: `Yêu cầu gia hạn của bạn đã được xử lý.
            Ngày trả mới: ${formatDate(newReturnDate)}
            Số lần gia hạn: ${renewalCount}/3`,
  type: "SYSTEM",
  status: "UNREAD"
}
```

---

### 🔄 Flowchart tổng hợp:

```
              Reader yêu cầu gia hạn
                        │
              ┌─────────┴─────────┐
              │                   │
      [status = BORROWED?]    [Không]
              │                   │
              │                   ↓
              │          ❌ Reject: "Đã trả sách"
              │
              ↓
      [returnDate >= today?]
              │                   │
              │                   ↓
              │          ❌ Reject: "Đã quá hạn"
              │                  (Tính phí phạt ở chức năng khác)
              │
              ↓
      [renewalCount < 3?]
              │                   │
              │                   ↓
              │          ❌ Reject: "Đã đạt tối đa 3 lần"
              │
              ↓
      [Kiểm tra Hold Queue]
              │                   │
              │                   ↓
      [Có người đặt trước?]   [Có]
              │                   │
              │                   ↓
              │          ❌ Reject: "Sách đang có người đặt trước"
              │
              ↓
      Tính newReturnDate
              │
              ↓
      Update BorrowRecord:
        - returnDate = newReturnDate
        - renewalCount++
              │
              ↓
      Tạo Notification
              │
              ↓
      ✅ Success: "Gia hạn thành công"
```

---

### ⚠️ Các trường hợp đặc biệt

#### Trường hợp 1: Gia hạn BorrowRecord có nhiều sách

```
BorrowRecord #60 mượn 3 sách:
- "Dune" (bookItemId: 100)
- "Foundation" (bookItemId: 200)
- "1984" (bookItemId: 300)

Kiểm tra conflict:
- "Dune": Có 1 người chờ → ❌ Không cho gia hạn
- "Foundation": Không có người chờ → ✅
- "1984": Không có người chờ → ✅

→ Kết quả: ❌ KHÔNG cho gia hạn (chỉ cần 1 sách có conflict)
→ Reader phải trả tất cả hoặc chờ người đặt trước hủy
```

#### Trường hợp 2: Đồng thời gia hạn (Race Condition)

```typescript
// Sử dụng transaction để tránh race condition
await prisma.$transaction(async tx => {
  // Lock BorrowRecord
  const record = await tx.borrowRecord.findUnique({
    where: { id: borrowRecordId },
    // ... với locking nếu cần
  });

  // Double-check điều kiện trong transaction
  if (record.renewalCount >= 3) {
    throw new Error('Đã đạt tối đa');
  }

  // Update
  await tx.borrowRecord.update({ ... });
});
```

---

### 📝 Tổng kết quy tắc gia hạn

1. **Số lần tối đa**: 3 lần (`renewalCount < 3`)
2. **Không quá hạn**: `returnDate >= today` và `status != 'OVERDUE'`
3. **Conflict với Hold Queue**: Nếu có `BorrowRequest` PENDING/APPROVED cho cùng `bookId` → không cho gia hạn
4. **Update**: Chỉ update `returnDate` và `renewalCount`, không thay đổi `BookItem.status`
5. **Overdue**: Khi quá hạn → không cho gia hạn, tính phí phạt ở chức năng riêng

---

### 🔗 API Endpoint

**`POST /api/borrow-records/[id]/renew`**

**Request Body (optional):**

```typescript
{
  extensionDays?: number // Mặc định: 14 ngày
}
```

**Response Success:**

```typescript
{
  success: true,
  borrowRecord: {
    id: number,
    returnDate: Date,
    renewalCount: number,
    status: 'BORROWED'
  },
  message: "Gia hạn thành công đến {newReturnDate}"
}
```

**Response Errors:**

```typescript
// Case 1: Đã đạt tối đa
{
  success: false,
  error: "Đã đạt số lần gia hạn tối đa (3 lần)"
}

// Case 2: Đã quá hạn
{
  success: false,
  error: "Không thể gia hạn khi đã quá hạn. Vui lòng trả sách hoặc thanh toán phí phạt."
}

// Case 3: Có người đặt trước
{
  success: false,
  error: "Sách đang có người đặt trước, không thể gia hạn"
}

// Case 4: Đã trả sách
{
  success: false,
  error: "Không thể gia hạn: Đã trả sách"
}
```

---

## 📝 Ghi chú Implementation

### Các điểm cần lưu ý:

1. **Transaction Safety**: Luôn dùng Prisma transaction khi xử lý queue để tránh race condition
2. **FIFO Ordering**: Sắp xếp theo `createdAt ASC` để đảm bảo công bằng
3. **Availability Calculation**:

   ```typescript
   remainingAvailable = Tổng BookItem AVAILABLE - Tổng quantity của BorrowRequest APPROVED
   ```

   - Chỉ tính ở level **Book** (số lượng), không cần chọn BookItem cụ thể khi đặt trước
   - Phải check đủ sách cho TẤT CẢ items trong request trước khi approve

4. **BookItem Selection**:
   - Khi đặt trước: Không chọn BookItem cụ thể (chỉ check số lượng)
   - Khi thủ thư giao sách: Ưu tiên condition tốt nhất (NEW > GOOD > WORN > DAMAGED)
5. **BookItem Status Flow**:
   - Khi tạo BorrowRequest → BookItem status không thay đổi (giữ AVAILABLE)
   - Khi APPROVED → BookItem status vẫn AVAILABLE (không reserve)
   - Thủ thư giao sách → Chọn BookItem + Tạo BorrowRecord + BookItem: AVAILABLE → ON_BORROW
6. **Multiple Approvals**: Nhiều readers có thể cùng có request APPROVED cho cùng một cuốn sách (nếu còn đủ số lượng để đặt trước)
7. **Notification**: Thông báo cho reader ở mỗi bước quan trọng

### API Endpoints cần thiết:

1. `POST /api/borrow-requests` - Tạo yêu cầu mượn (✅ Đã implement)
2. `GET /api/borrow-requests/my-queue` - Xem vị trí trong queue của mình
3. `GET /api/borrow-requests/queue/[bookId]` - Xem queue của một cuốn sách (Librarian)
4. `POST /api/book-items/[id]/return` - Trả sách (trigger queue processing)
5. `GET /api/borrow-requests/[id]` - Chi tiết request
6. `POST /api/borrow-records/[id]/renew` - Gia hạn mượn sách (cần implement)
