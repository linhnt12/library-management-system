import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get default admin credentials from environment variables
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL;
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;
const DEFAULT_ADMIN_FULLNAME = process.env.DEFAULT_ADMIN_FULLNAME;

async function seedAdmin() {
  console.log('Seeding default admin...');

  // Check if there are any admin users
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN,
      isDeleted: false,
    },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping admin seed.');
    console.log(`Email: ${existingAdmin.email}`);
    return;
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD!, 12);

  const adminUser = await prisma.user.create({
    data: {
      fullName: DEFAULT_ADMIN_FULLNAME!,
      email: DEFAULT_ADMIN_EMAIL!,
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      phoneNumber: null,
      address: null,
    },
  });

  console.log('✅ Default Admin user created successfully!');
  console.log(`Email: ${adminUser.email}`);
  console.log(`Password: ${DEFAULT_ADMIN_PASSWORD}`);
}

async function seedAuthors() {
  console.log('Seeding authors...');

  const count = await prisma.author.count();
  if (count > 0) {
    console.log(`Authors already seeded (${count} records). Skipping author seed.`);
    return;
  }

  await prisma.author.createMany({
    data: [
      {
        fullName: 'Haruki Murakami',
        bio: 'Haruki Murakami là một tiểu thuyết gia người Nhật nổi tiếng với phong cách pha trộn giữa hiện thực và siêu thực, thường khai thác chủ đề cô đơn và ý nghĩa cuộc sống.',
        birthDate: new Date('1949-01-12'),
        nationality: 'Nhật Bản',
      },
      {
        fullName: 'J.K. Rowling',
        bio: 'J.K. Rowling là nhà văn người Anh, nổi tiếng toàn cầu với loạt tiểu thuyết Harry Potter, đã bán được hàng trăm triệu bản và được chuyển thể thành phim bom tấn.',
        birthDate: new Date('1965-07-31'),
        nationality: 'Anh',
      },
      {
        fullName: 'Gabriel García Márquez',
        bio: 'Gabriel García Márquez là nhà văn người Colombia, người tiên phong của thể loại hiện thực huyền ảo, từng đoạt giải Nobel Văn học năm 1982.',
        birthDate: new Date('1927-03-06'),
        nationality: 'Colombia',
      },
      {
        fullName: 'George Orwell',
        bio: 'George Orwell là nhà văn, nhà báo người Anh, nổi tiếng với các tác phẩm phản địa đàng và phê phán chính trị như 1984 và Animal Farm.',
        birthDate: new Date('1903-06-25'),
        nationality: 'Anh',
      },
      {
        fullName: 'Jane Austen',
        bio: 'Jane Austen là một trong những tiểu thuyết gia người Anh vĩ đại nhất, được biết đến qua các tác phẩm khắc họa xã hội Anh thế kỷ 19 một cách sắc sảo và tinh tế.',
        birthDate: new Date('1775-12-16'),
        nationality: 'Anh',
      },
      {
        fullName: 'Ernest Hemingway',
        bio: 'Ernest Hemingway là một nhà văn Mỹ, nổi tiếng với lối viết ngắn gọn, sắc sảo. Ông từng đoạt giải Nobel Văn học năm 1954.',
        birthDate: new Date('1899-07-21'),
        nationality: 'Mỹ',
      },
      {
        fullName: 'Victor Hugo',
        bio: 'Victor Hugo là một tiểu thuyết gia, nhà thơ và chính trị gia người Pháp, nổi tiếng với các tác phẩm kinh điển như Les Misérables và The Hunchback of Notre-Dame.',
        birthDate: new Date('1802-02-26'),
        nationality: 'Pháp',
      },
      {
        fullName: 'Nguyễn Nhật Ánh',
        bio: 'Nguyễn Nhật Ánh là một nhà văn Việt Nam được yêu thích, nổi tiếng với những tác phẩm viết về tuổi học trò và thanh xuân như Kính vạn hoa, Cho tôi xin một vé đi tuổi thơ.',
        birthDate: new Date('1955-05-07'),
        nationality: 'Việt Nam',
      },
      {
        fullName: 'Fyodor Dostoevsky',
        bio: 'Fyodor Dostoevsky là một tiểu thuyết gia người Nga, được xem là một trong những cây bút vĩ đại nhất lịch sử văn học, nổi tiếng với các tác phẩm sâu sắc về tâm lý con người.',
        birthDate: new Date('1821-11-11'),
        nationality: 'Nga',
      },
      {
        fullName: 'Franz Kafka',
        bio: 'Franz Kafka là nhà văn người Áo gốc Séc, nổi tiếng với các tác phẩm mang tính siêu thực, phản ánh sự xa lạ và phi lý của cuộc sống hiện đại.',
        birthDate: new Date('1883-07-03'),
        nationality: 'Áo - Séc',
      },
    ],
  });

  console.log('✅ Authors seeded successfully!');
}

async function seedBooks() {
  console.log('Seeding books...');

  const count = await prisma.book.count();
  if (count > 0) {
    console.log(`Books already seeded (${count} records). Skipping.`);
    return;
  }

  const books = [
    {
      authorId: 1,
      title: 'Kafka on the Shore',
      isbn: '9781400079278',
      publishYear: 2002,
      publisher: 'Vintage International',
      pageCount: 505,
      price: 18.99,
      edition: '1',
      description:
        'Một câu chuyện siêu thực pha trộn giữa hiện thực và tâm linh của Haruki Murakami.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81dQwQlm0rL.jpg',
    },
    {
      authorId: 1,
      title: 'Norwegian Wood',
      isbn: '9780375704024',
      publishYear: 1987,
      publisher: 'Vintage',
      pageCount: 296,
      price: 14.5,
      edition: '1',
      description: 'Một tiểu thuyết sâu sắc về tuổi trẻ, tình yêu và mất mát.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71VZ0jfoyFL.jpg',
    },
    {
      authorId: 2,
      title: "Harry Potter and the Sorcerer's Stone",
      isbn: '9780590353427',
      publishYear: 1997,
      publisher: 'Scholastic',
      pageCount: 309,
      price: 25.0,
      edition: '1',
      description: 'Cuốn đầu tiên trong series huyền thoại về cậu bé phù thủy Harry Potter.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg',
    },
    {
      authorId: 2,
      title: 'Harry Potter and the Deathly Hallows',
      isbn: '9780545139700',
      publishYear: 2007,
      publisher: 'Scholastic',
      pageCount: 759,
      price: 29.99,
      edition: '1',
      description: 'Cuộc chiến cuối cùng của Harry với Voldemort, kết thúc huyền thoại.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/91ocU8970hL.jpg',
    },
    {
      authorId: 3,
      title: 'One Hundred Years of Solitude',
      isbn: '9780060883287',
      publishYear: 1967,
      publisher: 'Harper Perennial',
      pageCount: 417,
      price: 17.0,
      edition: '1',
      description: 'Kiệt tác của Gabriel García Márquez về gia đình Buendía qua bảy thế hệ.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71X8K8cU-GL.jpg',
    },
    {
      authorId: 4,
      title: '1984',
      isbn: '9780451524935',
      publishYear: 1949,
      publisher: 'Signet Classic',
      pageCount: 328,
      price: 12.99,
      edition: '1',
      description: 'Một xã hội phản địa đàng, nơi mọi hành vi đều bị giám sát.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg',
    },
    {
      authorId: 4,
      title: 'Animal Farm',
      isbn: '9780451526342',
      publishYear: 1945,
      publisher: 'Signet Classic',
      pageCount: 112,
      price: 9.99,
      edition: '1',
      description: 'Câu chuyện ngụ ngôn về cách quyền lực làm tha hóa.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81vpsIs58WL.jpg',
    },
    {
      authorId: 5,
      title: 'Pride and Prejudice',
      isbn: '9781503290563',
      publishYear: 1813,
      publisher: 'CreateSpace',
      pageCount: 279,
      price: 11.5,
      edition: '2',
      description: 'Một câu chuyện lãng mạn kinh điển giữa Elizabeth Bennet và Mr. Darcy.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81MZ1F6BhsL.jpg',
    },
    {
      authorId: 6,
      title: 'The Old Man and the Sea',
      isbn: '9780684801223',
      publishYear: 1952,
      publisher: 'Scribner',
      pageCount: 132,
      price: 13.0,
      edition: '1',
      description: 'Câu chuyện biểu tượng về ý chí con người qua hình ảnh ông lão đánh cá.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81d8H-5uPPL.jpg',
    },
    {
      authorId: 6,
      title: 'For Whom the Bell Tolls',
      isbn: '9780684803357',
      publishYear: 1940,
      publisher: 'Scribner',
      pageCount: 480,
      price: 16.0,
      edition: '1',
      description: 'Câu chuyện tình và chiến tranh, sâu sắc và ám ảnh.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81j9y7N0GPL.jpg',
    },
    {
      authorId: 7,
      title: 'Les Misérables',
      isbn: '9780451419439',
      publishYear: 1862,
      publisher: 'Signet',
      pageCount: 1488,
      price: 24.99,
      edition: '1',
      description: 'Tác phẩm kinh điển về tình yêu, công lý và nhân đạo của Victor Hugo.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/91D4k0uTw8L.jpg',
    },
    {
      authorId: 7,
      title: 'The Hunchback of Notre-Dame',
      isbn: '9780451531513',
      publishYear: 1831,
      publisher: 'Signet',
      pageCount: 495,
      price: 15.5,
      edition: '1',
      description: 'Câu chuyện tình bi thương của Quasimodo và Esmeralda.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/91FvJdFjqSL.jpg',
    },
    {
      authorId: 8,
      title: 'Cho tôi xin một vé đi tuổi thơ',
      isbn: '9786045859901',
      publishYear: 2008,
      publisher: 'NXB Trẻ',
      pageCount: 180,
      price: 8.0,
      edition: '1',
      description: 'Tác phẩm nổi tiếng nhất của Nguyễn Nhật Ánh, về tuổi thơ đầy trong trẻo.',
      coverImageUrl:
        'https://cdn0.fahasa.com/media/catalog/product/c/h/cho-toi-xin-mot-ve-di-tuoi-tho.jpg',
    },
    {
      authorId: 8,
      title: 'Tôi thấy hoa vàng trên cỏ xanh',
      isbn: '9786042083156',
      publishYear: 2010,
      publisher: 'NXB Trẻ',
      pageCount: 250,
      price: 9.5,
      edition: '1',
      description: 'Một câu chuyện cảm động về tuổi thơ ở làng quê Việt Nam.',
      coverImageUrl:
        'https://cdn0.fahasa.com/media/catalog/product/t/o/toi-thay-hoa-vang-tren-co-xanh.jpg',
    },
    {
      authorId: 9,
      title: 'Crime and Punishment',
      isbn: '9780486415871',
      publishYear: 1866,
      publisher: 'Dover Publications',
      pageCount: 430,
      price: 14.99,
      edition: '1',
      description: 'Câu chuyện nổi tiếng về tội ác, sự chuộc lỗi và tâm lý con người.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/91zHYWlgUzL.jpg',
    },
    {
      authorId: 9,
      title: 'The Brothers Karamazov',
      isbn: '9780374528379',
      publishYear: 1880,
      publisher: 'Farrar, Straus and Giroux',
      pageCount: 824,
      price: 19.99,
      edition: '1',
      description: 'Tác phẩm triết học kinh điển về đạo đức, tôn giáo và nhân tính.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81BBi2R+acL.jpg',
    },
    {
      authorId: 10,
      title: 'The Metamorphosis',
      isbn: '9780553213690',
      publishYear: 1915,
      publisher: 'Bantam Classics',
      pageCount: 201,
      price: 10.99,
      edition: '1',
      description: 'Câu chuyện siêu thực nổi tiếng về Gregor Samsa biến thành một con bọ.',
      coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71pHzv3PdbL.jpg',
    },
  ];

  // Generate extra books to ensure we have 30 books
  const extraBooks = Array.from({ length: 12 }, (_, i) => ({
    authorId: (i % 10) + 1,
    title: `Sample Book ${i + 1}`,
    isbn: `97800000000${i + 1}`,
    publishYear: 2000 + (i % 24),
    publisher: 'Sample Publisher',
    pageCount: 150 + i * 10,
    price: 5 + i,
    edition: '1',
    description: 'Sách mẫu để test dữ liệu.',
    coverImageUrl: 'https://placehold.co/200x300',
  }));

  await prisma.book.createMany({
    data: [...books, ...extraBooks],
  });

  console.log('✅ Books seeded successfully!');
}

async function main() {
  console.log('Starting seed...');
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD || !DEFAULT_ADMIN_FULLNAME) {
    throw new Error('⚠️ Missing required admin environment variables in .env');
  }

  await seedAdmin();
  await seedAuthors();
  await seedBooks();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
