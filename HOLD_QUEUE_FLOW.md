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
6. `POST /api/borrow-requests/[id]/fulfill` - Thủ thư giao sách, tạo BorrowRecord (cần implement)
