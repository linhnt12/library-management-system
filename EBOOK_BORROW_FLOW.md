# LUỒNG MƯỢN SÁCH ĐIỆN TỬ (EBOOK)

## 📋 Tổng quan

- ✅ Reader mượn sách điện tử **tự động** (không cần thủ thư)
- ✅ Tự động approve và tạo BorrowRecord khi có license
- ✅ Tự động trả sách khi hết hạn (cron job)
- ✅ Hold Queue theo FIFO khi hết license
- ✅ Kiểm tra quyền truy cập mỗi lần xem PDF
- ✅ Hỗ trợ nhiều mô hình license: ONE_COPY_ONE_USER, SIMULTANEOUS, OWNED, METERED, SUBSCRIPTION

---

## 🔍 Khác biệt với sách vật lý

| Đặc điểm              | Sách vật lý              | Sách điện tử                                     |
| --------------------- | ------------------------ | ------------------------------------------------ |
| **Kiểm tra khả dụng** | Đếm `BookItem` AVAILABLE | Đếm license đang mượn theo `DigitalLicenseModel` |
| **Tự động giao**      | ❌ Cần thủ thư giao      | ✅ Tự động ngay khi approve                      |
| **Tạo BorrowRecord**  | Thủ thư tạo khi giao     | ✅ Tự động tạo khi approve                       |
| **Queue**             | Có (khi hết sách)        | Có (khi hết license)                             |
| **Trả sách**          | Thủ thư xác nhận         | ✅ Tự động khi hết hạn                           |

---

## 🎯 TRƯỜNG HỢP 1: Có license ngay (Instant Approval & Auto-Fulfillment)

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Reader tạo yêu cầu mượn        │
└──────────────────────────────────────────┘
```

**Input từ Reader:**

- Chọn sách: "Dune" (có ebook PDF)
- Thời gian mượn: 01/01/2025 → 15/01/2025
- Nhấn nút "Mượn sách điện tử"

**Logic kiểm tra:**

```typescript
// 1. Kiểm tra sách có ebook không
const book = await prisma.book.findFirst({
  where: { id: bookId, isDeleted: false },
  include: {
    digitalLicenses: {
      where: { isDeleted: false },
      include: {
        borrowEbooks: {
          where: {
            isDeleted: false,
            borrow: {
              status: 'BORROWED',
              returnDate: { gte: new Date() }, // Chưa hết hạn
            },
          },
        },
      },
    },
    bookEditions: {
      where: {
        fileFormat: 'PDF',
        isDeleted: false,
      },
    },
  },
});

if (!book.digitalLicenses.length || !book.bookEditions.length) {
  throw new Error('Sách này không có phiên bản điện tử');
}

// 2. Kiểm tra license theo mô hình
const license = book.digitalLicenses[0];

switch (license.licenseModel) {
  case 'ONE_COPY_ONE_USER':
    // Đếm số người đang mượn
    const borrowedCount = license.borrowEbooks.length;
    const available = (license.totalCopies || 0) - borrowedCount;
    break;

  case 'SIMULTANEOUS':
    // Nhiều người cùng mượn, kiểm tra totalCopies
    const currentBorrowers = license.borrowEbooks.length;
    const canBorrow = currentBorrowers < (license.totalCopies || Infinity);
    break;

  case 'OWNED':
    // Không giới hạn
    const canBorrow = true;
    break;

  case 'METERED':
    // Kiểm tra số lần mượn còn lại
    // (Cần thêm field để track)
    break;

  case 'SUBSCRIPTION':
    // Kiểm tra subscription của user
    break;
}
```

**Ví dụ:**

- License model: `ONE_COPY_ONE_USER`
- `totalCopies`: 5
- Đang mượn: 3 người
- Còn lại: 5 - 3 = 2 license → ✅ Có thể mượn

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Tự động approve và tạo         │
│         BorrowRecord                     │
└──────────────────────────────────────────┘
```

**Actions trong transaction:**

```typescript
const result = await prisma.$transaction(async tx => {
  // 1. Tạo BorrowRequest (để tracking)
  const borrowRequest = await tx.borrowRequest.create({
    data: {
      userId: userIdNum,
      startDate: borrowStartDate,
      endDate: borrowEndDate,
      status: 'APPROVED', // Tự động approve
      items: {
        create: {
          bookId: bookIdNum,
          quantity: 1,
          startDate: borrowStartDate,
          endDate: borrowEndDate,
        },
      },
    },
  });

  // 2. Tạo BorrowRecord ngay lập tức (khác với sách vật lý)
  const borrowRecord = await tx.borrowRecord.create({
    data: {
      userId: userIdNum,
      borrowDate: borrowStartDate,
      returnDate: borrowEndDate,
      status: 'BORROWED',
    },
  });

  // 3. Tạo BorrowEbook (link license với BorrowRecord)
  await tx.borrowEbook.create({
    data: {
      borrowId: borrowRecord.id,
      licenseId: license.id,
    },
  });

  // 4. Update BorrowRequest status
  await tx.borrowRequest.update({
    where: { id: borrowRequest.id },
    data: { status: 'FULFILLED' },
  });

  return { borrowRequest, borrowRecord };
});
```

**Trạng thái sau khi approve:**

- ✅ `BorrowRequest.status = FULFILLED` (ngay lập tức)
- ✅ `BorrowRecord.status = BORROWED` (đã tạo)
- ✅ `BorrowEbook` đã link license với BorrowRecord
- ✅ Reader có thể xem sách ngay

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Thông báo và cấp quyền truy cập │
└──────────────────────────────────────────┘
```

**Notification:**

```typescript
Notification {
  userId: readerId,
  title: "Mượn sách điện tử thành công",
  message: "Bạn đã mượn thành công 'Dune' (PDF).
            Bạn có thể đọc sách ngay bây giờ.
            Hạn trả: 15/01/2025",
  type: "SYSTEM",
  status: "UNREAD"
}
```

**Cấp quyền xem:**

- Reader có thể truy cập `/api/ebooks/[bookId]/view` ngay
- API kiểm tra `BorrowRecord` với `status = BORROWED` và `returnDate >= today`

---

## ⏳ TRƯỜNG HỢP 2: Hết license → Vào Hold Queue

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Reader tạo yêu cầu mượn        │
└──────────────────────────────────────────┘
```

**Input:**

- Chọn sách: "Foundation" (ebook PDF)
- Thời gian mượn: 01/01/2025 → 15/01/2025

**Logic kiểm tra:**

```typescript
// License model: ONE_COPY_ONE_USER
// totalCopies: 5
// Đang mượn: 5 người (đã hết)

const borrowedCount = await prisma.borrowEbook.count({
  where: {
    licenseId: license.id,
    isDeleted: false,
    borrow: {
      status: 'BORROWED',
      returnDate: { gte: new Date() },
    },
  },
});

const available = (license.totalCopies || 0) - borrowedCount;
// available = 5 - 5 = 0 → Hết license
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Tạo Request và vào Hold Queue  │
└──────────────────────────────────────────┘
```

**Actions:**

```typescript
// 1. Tạo BorrowRequest với status PENDING
const borrowRequest = await tx.borrowRequest.create({
  data: {
    userId: userIdNum,
    startDate: borrowStartDate,
    endDate: borrowEndDate,
    status: 'PENDING', // Vào queue
    items: {
      create: {
        bookId: bookIdNum,
        quantity: 1,
        startDate: borrowStartDate,
        endDate: borrowEndDate,
      },
    },
  },
});

// ❌ KHÔNG tạo BorrowRecord (chưa có license)
// ❌ KHÔNG tạo BorrowEbook
```

**Tính toán vị trí trong queue:**

```typescript
// Query tất cả request PENDING cho bookId này
const queue = await prisma.borrowRequestItem.findMany({
  where: {
    bookId: bookId,
    borrowRequest: {
      status: 'PENDING',
      isDeleted: false,
    },
  },
  orderBy: {
    borrowRequest: {
      createdAt: 'asc', // FIFO
    },
  },
});

const position = queue.findIndex(item => item.borrowRequestId === borrowRequest.id) + 1;
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Hiển thị vị trí trong Queue     │
└──────────────────────────────────────────┘
```

**Thông tin hiển thị:**

```
📚 Sách: "Foundation" (PDF)
⏳ Trạng thái: Đang chờ trong hàng đợi
📍 Vị trí: #3 trong 5 người chờ
📅 Ngày đăng ký: 01/01/2025 10:00
📖 License model: ONE_COPY_ONE_USER (5 bản)
```

**Notification:**

```typescript
Notification {
  userId: readerId,
  title: "Yêu cầu mượn sách điện tử đã được đăng ký",
  message: "Yêu cầu mượn 'Foundation' của bạn đã được đăng ký.
            Bạn đang ở vị trí #3 trong hàng đợi.
            Chúng tôi sẽ thông báo khi có license sẵn sàng.",
  type: "SYSTEM",
  status: "UNREAD"
}
```

---

## 🔄 TRƯỜNG HỢP 3: Sách hết hạn → Tự động trả → Xử lý Queue

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Cron job kiểm tra sách hết hạn  │
└──────────────────────────────────────────┘
```

**Scheduled task (chạy mỗi giờ):**

```typescript
// scripts/cron.ts hoặc worker
async function processExpiredEbooks() {
  const now = new Date();

  // Tìm tất cả BorrowRecord đã hết hạn
  const expiredRecords = await prisma.borrowRecord.findMany({
    where: {
      status: 'BORROWED',
      returnDate: { lt: now },
      borrowEbooks: {
        some: {
          isDeleted: false,
        },
      },
    },
    include: {
      borrowEbooks: {
        where: { isDeleted: false },
        include: {
          license: {
            include: {
              book: true,
            },
          },
        },
      },
    },
  });

  // Tự động trả sách
  for (const record of expiredRecords) {
    await prisma.$transaction(async tx => {
      // 1. Update BorrowRecord
      await tx.borrowRecord.update({
        where: { id: record.id },
        data: {
          status: 'RETURNED',
          actualReturnDate: now,
        },
      });

      // 2. Soft delete BorrowEbook (trả license)
      await tx.borrowEbook.updateMany({
        where: {
          borrowId: record.id,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
        },
      });

      // 3. Process queue cho từng license
      for (const borrowEbook of record.borrowEbooks) {
        await processHoldQueueForLicense(borrowEbook.licenseId);
      }
    });
  }
}
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Xử lý Hold Queue (FIFO)         │
└──────────────────────────────────────────┘
```

**Logic xử lý:**

```typescript
async function processHoldQueueForLicense(licenseId: number) {
  // 1. Lấy license info
  const license = await prisma.digitalLicense.findUnique({
    where: { id: licenseId },
    include: {
      book: true,
      borrowEbooks: {
        where: {
          isDeleted: false,
          borrow: {
            status: 'BORROWED',
            returnDate: { gte: new Date() },
          },
        },
      },
    },
  });

  // 2. Tính số license còn lại
  const borrowedCount = license.borrowEbooks.length;
  const available = (license.totalCopies || 0) - borrowedCount;

  if (available <= 0) {
    return; // Vẫn hết license
  }

  // 3. Lấy request đầu tiên trong queue (FIFO)
  const firstRequest = await prisma.borrowRequestItem.findFirst({
    where: {
      bookId: license.bookId,
      borrowRequest: {
        status: 'PENDING',
        isDeleted: false,
      },
    },
    include: {
      borrowRequest: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      borrowRequest: {
        createdAt: 'asc',
      },
    },
  });

  if (!firstRequest) {
    return; // Không có request trong queue
  }

  // 4. Tự động approve và tạo BorrowRecord
  await prisma.$transaction(async tx => {
    // Tạo BorrowRecord
    const borrowRecord = await tx.borrowRecord.create({
      data: {
        userId: firstRequest.borrowRequest.userId,
        borrowDate: firstRequest.startDate,
        returnDate: firstRequest.endDate,
        status: 'BORROWED',
      },
    });

    // Tạo BorrowEbook
    await tx.borrowEbook.create({
      data: {
        borrowId: borrowRecord.id,
        licenseId: license.id,
      },
    });

    // Update BorrowRequest
    await tx.borrowRequest.update({
      where: { id: firstRequest.borrowRequestId },
      data: { status: 'FULFILLED' },
    });
  });

  // 5. Gửi notification
  await sendNotification({
    userId: firstRequest.borrowRequest.userId,
    title: 'Sách điện tử đã sẵn sàng',
    message: `Sách "${license.book.title}" đã sẵn sàng cho bạn.
              Bạn có thể đọc ngay bây giờ.`,
  });
}
```

---

## 📖 TRƯỜNG HỢP 4: Reader xem sách PDF

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Reader click "Đọc sách"        │
└──────────────────────────────────────────┘
```

**Request:**

```
GET /api/ebooks/[bookId]/view
Authorization: Bearer <token>
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: API kiểm tra quyền truy cập     │
└──────────────────────────────────────────┘
```

```typescript
// src/app/api/ebooks/[bookId]/view/route.ts
export const GET = requireReader(async (request: AuthenticatedRequest) => {
  const { id } = await params;
  const bookId = parseIntParam(id);

  // 1. Kiểm tra user có BorrowRecord đang mượn không
  const borrowRecord = await prisma.borrowRecord.findFirst({
    where: {
      userId: request.user.id,
      status: 'BORROWED',
      isDeleted: false,
      returnDate: { gte: new Date() }, // Chưa hết hạn
      borrowEbooks: {
        some: {
          license: {
            bookId: bookId,
            isDeleted: false,
          },
          isDeleted: false,
        },
      },
    },
    include: {
      borrowEbooks: {
        include: {
          license: {
            include: {
              book: {
                include: {
                  bookEditions: {
                    where: {
                      fileFormat: 'PDF',
                      isDeleted: false,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!borrowRecord) {
    return errorResponse('Bạn không có quyền truy cập sách này', 403);
  }

  // 2. Lấy BookEdition (PDF file)
  const edition = borrowRecord.borrowEbooks[0].license.book.bookEditions[0];

  if (!edition || !edition.storageUrl) {
    return errorResponse('Sách không có file PDF', 404);
  }

  // 3. Tạo signed URL (thời hạn ngắn)
  const signedUrl = await generateSignedUrl(edition.storageUrl, {
    expiresIn: 3600, // 1 giờ
    userId: request.user.id,
    bookId: bookId,
  });

  // 4. Log truy cập
  await logEbookAccess(request.user.id, bookId);

  return successResponse({
    viewUrl: signedUrl,
    expiresAt: new Date(Date.now() + 3600 * 1000),
  });
});
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 3: Frontend hiển thị PDF            │
└──────────────────────────────────────────┘
```

```typescript
// Component PdfViewer
import { Document, Page } from 'react-pdf';

function PdfViewer({ bookId }: { bookId: number }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Lấy signed URL
    EbookApi.getViewUrl(bookId).then(response => {
      setPdfUrl(response.viewUrl);
    });
  }, [bookId]);

  if (!pdfUrl) return <Loading />;

  return (
    <Document file={pdfUrl}>
      <Page pageNumber={1} />
    </Document>
  );
}
```

**Lưu ý bảo mật:**

- ✅ Signed URL có thời hạn ngắn (1 giờ)
- ✅ Kiểm tra quyền mỗi lần request
- ✅ Log mọi truy cập
- ⚠️ Không thể ngăn chặn hoàn toàn việc tải xuống (xem thêm phần bảo mật)

---

## 🔄 TRƯỜNG HỢP 5: Reader trả sách sớm (Manual Return)

### Luồng thực hiện:

```
┌──────────────────────────────────────────┐
│ BƯỚC 1: Reader click "Trả sách"        │
└──────────────────────────────────────────┘
```

**Request:**

```
POST /api/borrow-records/[id]/return-ebook
```

```
┌──────────────────────────────────────────┐
│ BƯỚC 2: Xử lý trả sách                  │
└──────────────────────────────────────────┘
```

```typescript
export const POST = requireReader(async (request: AuthenticatedRequest) => {
  const { id } = await params;
  const borrowRecordId = parseIntParam(id);

  // 1. Kiểm tra quyền
  const borrowRecord = await prisma.borrowRecord.findFirst({
    where: {
      id: borrowRecordId,
      userId: request.user.id,
      status: 'BORROWED',
      isDeleted: false,
    },
    include: {
      borrowEbooks: {
        where: { isDeleted: false },
        include: {
          license: true,
        },
      },
    },
  });

  if (!borrowRecord) {
    return errorResponse('Không tìm thấy bản ghi mượn', 404);
  }

  // 2. Trả sách trong transaction
  await prisma.$transaction(async tx => {
    // Update BorrowRecord
    await tx.borrowRecord.update({
      where: { id: borrowRecordId },
      data: {
        status: 'RETURNED',
        actualReturnDate: new Date(),
      },
    });

    // Soft delete BorrowEbook (trả license)
    await tx.borrowEbook.updateMany({
      where: {
        borrowId: borrowRecordId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });
  });

  // 3. Process queue cho từng license
  for (const borrowEbook of borrowRecord.borrowEbooks) {
    await processHoldQueueForLicense(borrowEbook.licenseId);
  }

  return successResponse({ message: 'Trả sách thành công' });
});
```

---

## 📊 TỔNG KẾT LUỒNG

### Flowchart tổng hợp:

```
                    Reader tạo yêu cầu mượn ebook
                              │
                    ┌─────────┴─────────┐
                    │                   │
            [Có license available?]   [Hết license]
                    │                   │
                    │                   ↓
                    │          Tạo Request: PENDING
                    │                   │
                    │          Hiển thị Queue Position
                    │          "Bạn ở vị trí #X"
                    │                   │
                    │          ┌────────┴────────┐
                    │          │                 │
                    │      [License trả về]   [Chờ...]
                    │          │                 │
                    └──────────┴─────────────────┘
                               │
                    Process Hold Queue (FIFO)
                               │
                    ┌──────────┴──────────┐
                    │                     │
            [Đủ license?]              [Chưa đủ]
                    │                     │
                    │                     ↓
                    │              Giữ PENDING
                    │              Chờ thêm license
                    │
                    ↓
        ✅ Tự động tạo BorrowRecord
        ✅ Tạo BorrowEbook (link license)
        ✅ Update Request: PENDING → FULFILLED
                    │
                    ↓
        Thông báo Reader: "Sách đã sẵn sàng"
        Reader có thể xem ngay
                    │
                    ↓
        [Hết hạn hoặc trả sớm]
                    │
                    ↓
        Tự động trả license
        Process queue tiếp theo
```

---

## 🔑 Các điểm quan trọng

### 1. Tự động hóa

- ✅ Ebook tự động approve và tạo BorrowRecord (không cần thủ thư)
- ✅ Tự động trả sách khi hết hạn (cron job)
- ✅ Tự động xử lý queue khi có license trả về

### 2. Queue Management

- ✅ Queue theo FIFO (First In First Out)
- ✅ Xử lý tự động khi có license available
- ✅ Thông báo ngay khi sách sẵn sàng

### 3. License Models

Hệ thống hỗ trợ các mô hình license khác nhau:

#### ONE_COPY_ONE_USER

- Mỗi license chỉ 1 người mượn tại một thời điểm
- Logic: `available = totalCopies - số người đang mượn`

#### SIMULTANEOUS

- Nhiều người cùng mượn, giới hạn bởi `totalCopies`
- Logic: `số người đang mượn < totalCopies`

#### OWNED

- Không giới hạn số người mượn
- Logic: Luôn cho phép mượn

#### METERED

- Giới hạn số lần mượn (cần thêm field để track)
- Logic: Kiểm tra số lần mượn còn lại

#### SUBSCRIPTION

- Theo gói đăng ký của user
- Logic: Kiểm tra subscription status

### 4. Bảo mật truy cập

- ✅ Kiểm tra quyền mỗi lần xem PDF
- ✅ Signed URL với thời hạn ngắn (1 giờ)
- ✅ Log mọi truy cập
- ⚠️ Không thể ngăn chặn hoàn toàn việc tải xuống (xem thêm phần bảo mật)

### 5. Database Schema

**BorrowEbook:**

- Link `BorrowRecord` với `DigitalLicense`
- Soft delete khi trả sách (`isDeleted = true`)

**DigitalLicense:**

- `licenseModel`: Mô hình license
- `totalCopies`: Tổng số license (null = không giới hạn)
- `bookId`: Link với Book

**BookEdition:**

- `storageUrl`: Đường dẫn file PDF
- `fileFormat`: PDF, EPUB, MOBI, etc.
- `drmType`: Loại DRM (NONE, WATERMARK, ADOBE_DRM, etc.)

---

## 📝 Ghi chú Implementation

### Các điểm cần lưu ý:

1. **Transaction Safety**: Luôn dùng Prisma transaction khi xử lý queue để tránh race condition

2. **FIFO Ordering**: Sắp xếp theo `createdAt ASC` để đảm bảo công bằng

3. **License Calculation**:

   ```typescript
   // ONE_COPY_ONE_USER
   available = totalCopies - số người đang mượn (BorrowEbook chưa deleted)

   // SIMULTANEOUS
   canBorrow = số người đang mượn < totalCopies

   // OWNED
   canBorrow = true (luôn cho phép)
   ```

4. **Auto Return**: Cron job chạy định kỳ để tự động trả sách hết hạn

5. **Queue Processing**: Tự động xử lý queue khi:
   - Sách hết hạn (cron job)
   - Reader trả sách sớm
   - License mới được thêm vào

6. **Access Control**: Mỗi lần xem PDF đều kiểm tra:
   - `BorrowRecord.status = 'BORROWED'`
   - `returnDate >= today`
   - `BorrowEbook.isDeleted = false`

### API Endpoints cần thiết:

1. `POST /api/ebook-borrow-requests` - Tạo yêu cầu mượn ebook (cần implement)
2. `GET /api/ebook-borrow-requests` - Xem danh sách yêu cầu mượn của user
3. `GET /api/ebooks/[bookId]/view` - Lấy signed URL để xem PDF (cần implement)
4. `GET /api/ebooks/[bookId]/stream` - Stream PDF với watermark (cần implement)
5. `POST /api/borrow-records/[id]/return-ebook` - Trả sách sớm (cần implement)
6. `GET /api/my-ebooks` - Xem danh sách ebook đang mượn (cần implement)

### Cron Jobs cần thiết:

1. **Process Expired Ebooks**: Chạy mỗi giờ để tự động trả sách hết hạn
   ```typescript
   // scripts/cron.ts
   async function processExpiredEbooks() {
     // Tìm và trả sách hết hạn
     // Process queue cho license được trả
   }
   ```

---

## 🔒 Bảo mật PDF (Lưu ý quan trọng)

### ⚠️ Không thể ngăn chặn hoàn toàn việc tải xuống

Nếu gửi link trực tiếp đến file PDF, người dùng vẫn có thể tải được dù dùng `<embed>`, `<iframe>`, hay viewer gì đi nữa.

### Các biện pháp bảo vệ thực tế:

1. **Signed URLs với thời hạn ngắn**
   - URL tự động hết hạn sau 1-2 giờ
   - Mỗi lần xem cần request lại

2. **Streaming thay vì direct download**
   - Stream file với kiểm tra quyền mỗi request
   - Không cache trong browser

3. **Watermarking động**
   - Thêm watermark với thông tin user khi render
   - Sử dụng thư viện như `pdf-lib`

4. **PDF.js viewer**
   - Render từng trang riêng lẻ
   - Vẫn có thể tải được qua DevTools

5. **Chunked streaming với authentication**
   - Chia file thành chunks nhỏ
   - Mỗi chunk yêu cầu xác thực

6. **Logging và monitoring**
   - Ghi log mọi truy cập
   - Phát hiện hành vi bất thường

### Kết luận:

- ✅ Có thể tăng rào cản và giảm rủi ro
- ❌ Không thể ngăn chặn hoàn toàn việc tải xuống
- ✅ Mục tiêu: Làm cho việc tải xuống khó khăn hơn, không phải không thể

---

## 📚 Tham khảo

- File `HOLD_QUEUE_FLOW.md` - Luồng mượn sách vật lý
- Schema: `prisma/schema.prisma` - Cấu trúc database
- API: `src/app/api/borrow-requests/route.ts` - API mượn sách vật lý
