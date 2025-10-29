# LUỒNG CHI TIẾT

## 📋 Tổng quan

- ✅ Reader nhận sách **sau khi đã được "mượn"** trong hệ thống
- ✅ Tự động approve và tạo BorrowRecord ngay khi có sách
- ✅ Hold Queue theo FIFO để đảm bảo công bằng

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
// 1. Kiểm tra sách available
const availableCount = await prisma.bookItem.count({
  where: {
    bookId: bookId,
    status: 'AVAILABLE',
    isDeleted: false,
  },
});

// 2. Nếu availableCount >= quantity
if (availableCount >= 2) {
  // → Trường hợp có sách ngay
  // → Xử lý tiếp ở TRƯỜNG HỢP 2
}
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Instant Approval & Tạo Record  │
└──────────────────────────────────────────┘
```

**Actions:**

1. **Tạo `BorrowRequest`** với `status = PENDING` tạm thời
2. Kiểm tra lại và validate đủ sách
3. **Tạo `BorrowRecord`** ngay lập tức:
   ```typescript
   BorrowRecord {
     userId: readerId,
     borrowDate: "2025-01-01",
     returnDate: "2025-01-15",
     status: "BORROWED"
   }
   ```
4. **Chọn BookItem cụ thể:**
   ```typescript
   // Ưu tiên condition tốt nhất
   BookItem WHERE bookId = X
     AND status = 'AVAILABLE'
   ORDER BY condition DESC (NEW > GOOD > WORN)
   LIMIT 2
   ```
5. **Tạo `BorrowBook` records:**
   ```typescript
   BorrowBook {
     borrowId: borrowRecord.id,
     bookItemId: bookItem1.id
   }
   BorrowBook {
     borrowId: borrowRecord.id,
     bookItemId: bookItem2.id
   }
   ```
6. **Update `BookItem.status`:**
   ```typescript
   BookItem1.status = 'ON_BORROW';
   BookItem2.status = 'ON_BORROW';
   ```
7. **Update `BorrowRequest.status = 'APPROVED'`** hoặc `'FULFILLED'`

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Thông báo cho Reader             │
└──────────────────────────────────────────┘
```

**Notification:**

```typescript
Notification {
  userId: readerId,
  title: "Mượn sách thành công",
  message: "Bạn đã mượn thành công 'Harry Potter' - 2 quyển.
            Vui lòng đến thư viện để nhận sách.",
  type: "SYSTEM",
  status: "UNREAD"
}
```

**Trạng thái cuối:**

- ✅ `BorrowRequest.status = APPROVED`
- ✅ `BorrowRecord.status = BORROWED`
- ✅ `BookItem.status = ON_BORROW` (2 items)
- ✅ Reader: "Đã mượn thành công, đến thư viện nhận sách"

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
const availableCount = await prisma.bookItem.count({
  where: {
    bookId: 'Dune',
    status: 'AVAILABLE',
    isDeleted: false,
  },
});

// availableCount = 0 (không có sách available)
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
  const availableCount = await countAvailableBookItems(item.bookId);

  if (availableCount < item.quantity) {
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
- "Dune": cần 1, available: 2 ✅
- "Foundation": cần 2, available: 3 ✅
→ APPROVE ngay
```

**Case B: Chưa đủ (một phần)**

```
Request #120 có 2 items:
- "Dune": cần 1, available: 2 ✅
- "Foundation": cần 2, available: 1 ❌
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
│ BƯỚC 4: Tự động Approve Request         │
└──────────────────────────────────────────┘
```

**Transaction tự động approve:**

```typescript
await prisma.$transaction(async tx => {
  // 1. Tạo BorrowRecord
  const borrowRecord = await tx.borrowRecord.create({
    data: {
      userId: request.userId,
      borrowDate: request.startDate,
      returnDate: request.endDate,
      status: 'BORROWED', // Đã mượn
    },
  });

  // 2. Xử lý từng BorrowRequestItem
  for (const item of request.items) {
    // Chọn BookItem cụ thể
    const selectedItems = await tx.bookItem.findMany({
      where: {
        bookId: item.bookId,
        status: 'AVAILABLE',
        isDeleted: false,
      },
      orderBy: [
        { condition: 'desc' }, // NEW > GOOD > WORN
        { createdAt: 'asc' },
      ],
      take: item.quantity,
    });

    // Tạo BorrowBook links
    for (const bookItem of selectedItems) {
      await tx.borrowBook.create({
        data: {
          borrowId: borrowRecord.id,
          bookItemId: bookItem.id,
        },
      });

      // Update status ngay
      await tx.bookItem.update({
        where: { id: bookItem.id },
        data: { status: 'ON_BORROW' },
      });
    }
  }

  // 3. Update BorrowRequest status
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

BorrowRecord #456:
  userId: readerId
  borrowDate: "2025-01-01"
  returnDate: "2025-01-15"
  status: "BORROWED"

BorrowBook records:
  - borrowId: 456, bookItemId: 10 (Dune)
  - borrowId: 456, bookItemId: 20 (Foundation)
  - borrowId: 456, bookItemId: 21 (Foundation)

BookItem:
  - Item #10: status = ON_BORROW ✅
  - Item #20: status = ON_BORROW ✅
  - Item #21: status = ON_BORROW ✅
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
            Bạn đã mượn thành công:
            - Dune (1 quyển)
            - Foundation (2 quyển)
            Vui lòng đến thư viện để nhận sách.",
  type: "SYSTEM",
  status: "UNREAD"
}
```

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
→ Tạo BorrowRecord với 6 BookItem (2+1+3)
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
  → BookItem #50: ON_BORROW
  → Queue: #121 → #1, #122 → #2

Lần trả về 2 (BookItem #51):
  → Request #121 được approve (giờ đã là #1)
  → BookItem #51: ON_BORROW
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
        Tạo BorrowRecord
        Chọn BookItem (condition tốt nhất)
        Tạo BorrowBook links
        Update BookItem: ON_BORROW
        Update Request: APPROVED
                    │
                    ↓
        Thông báo Reader: "Đã mượn thành công"
        Reader đến thư viện nhận sách
```

---

## 📝 Ghi chú Implementation

### Các điểm cần lưu ý:

1. **Transaction Safety**: Luôn dùng Prisma transaction khi xử lý queue để tránh race condition
2. **FIFO Ordering**: Sắp xếp theo `createdAt ASC` để đảm bảo công bằng
3. **Validation**: Phải check đủ sách cho TẤT CẢ items trong request trước khi approve
4. **BookItem Selection**: Ưu tiên condition tốt nhất (NEW > GOOD > WORN > DAMAGED)
5. **Notification**: Thông báo cho reader ở mỗi bước quan trọng

### API Endpoints cần thiết:

1. `POST /api/borrow-requests` - Tạo yêu cầu mượn
2. `GET /api/borrow-requests/my-queue` - Xem vị trí trong queue của mình
3. `GET /api/borrow-requests/queue/[bookId]` - Xem queue của một cuốn sách (Librarian)
4. `POST /api/book-items/[id]/return` - Trả sách (trigger queue processing)
5. `GET /api/borrow-requests/[id]` - Chi tiết request
