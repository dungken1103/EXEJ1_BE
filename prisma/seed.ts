import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Waste To Worth...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('123456', 10);

  // Users
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: hashedPassword,
      name: 'Nguyễn Văn A',
      role: 'USER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin Waste To Worth',
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      passwordHash: hashedPassword,
      name: 'Trần Thị B',
      role: 'USER',
    },
  });

  // Categories (danh mục sản phẩm mô hình gỗ)
  const catMap = await prisma.category.upsert({
    where: { name: 'Bản đồ Việt Nam' },
    update: {},
    create: {
      name: 'Bản đồ Việt Nam',
      slug: 'ban-do-viet-nam',
    },
  });

  const catRegion = await prisma.category.upsert({
    where: { name: 'Bản đồ theo vùng' },
    update: {},
    create: {
      name: 'Bản đồ theo vùng',
      slug: 'ban-do-theo-vung',
    },
  });

  const catMini = await prisma.category.upsert({
    where: { name: 'Mô hình mini' },
    update: {},
    create: {
      name: 'Mô hình mini',
      slug: 'mo-hinh-mini',
    },
  });

  // Wood types (loại gỗ)
  const woodHuong = await prisma.woodType.upsert({
    where: { name: 'Gỗ Hương' },
    update: {},
    create: {
      name: 'Gỗ Hương',
      description: 'Gỗ quý, vân đẹp, từ phế phẩm xưởng mộc tái sử dụng.',
    },
  });

  const woodGo = await prisma.woodType.upsert({
    where: { name: 'Gỗ Gụ' },
    update: {},
    create: {
      name: 'Gỗ Gụ',
      description: 'Gỗ quý truyền thống, bền, màu nâu đậm.',
    },
  });

  const woodMixed = await prisma.woodType.upsert({
    where: { name: 'Gỗ hỗn hợp' },
    update: {},
    create: {
      name: 'Gỗ hỗn hợp',
      description: 'Ghép từ nhiều loại gỗ quý tái chế.',
    },
  });

  // Sample products (mô hình 3D bản đồ Việt Nam)
  const product1 = await prisma.product.upsert({
    where: { slug: 'ban-do-viet-nam-co-ban' },
    update: {},
    create: {
      name: 'Mô hình bản đồ Việt Nam cơ bản',
      slug: 'ban-do-viet-nam-co-ban',
      description:
        'Mô hình 3D bản đồ Việt Nam ghép từ gỗ quý tái chế, cắt CNC chính xác. Dễ lắp ráp, phù hợp trang trí bàn làm việc.',
      image: '/uploads/placeholder-map.png',
      price: 299000,
      stock: 50,
      status: 'AVAILABLE',
      difficulty: 'EASY',
      dimensions: '25 x 35 cm',
      categoryId: catMap.id,
      woodTypeId: woodHuong.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'ban-do-viet-nam-chi-tiet' },
    update: {},
    create: {
      name: 'Bản đồ Việt Nam chi tiết 63 tỉnh thành',
      slug: 'ban-do-viet-nam-chi-tiet',
      description:
        'Mô hình bản đồ Việt Nam có ranh giới 63 tỉnh thành. Gỗ Gụ tái chế, cắt CNC từng miếng ghép.',
      image: '/uploads/placeholder-map-detail.png',
      price: 599000,
      stock: 30,
      status: 'AVAILABLE',
      difficulty: 'MEDIUM',
      dimensions: '40 x 55 cm',
      categoryId: catMap.id,
      woodTypeId: woodGo.id,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { slug: 'ban-do-mien-nam' },
    update: {},
    create: {
      name: 'Mô hình bản đồ Miền Nam',
      slug: 'ban-do-mien-nam',
      description: 'Bản đồ 3D khu vực miền Nam Việt Nam. Gỗ hỗn hợp tái chế, dễ ghép.',
      image: '/uploads/placeholder-region.png',
      price: 199000,
      stock: 40,
      status: 'AVAILABLE',
      difficulty: 'EASY',
      dimensions: '20 x 28 cm',
      categoryId: catRegion.id,
      woodTypeId: woodMixed.id,
    },
  });

  console.log('Seeded:', {
    users: 3,
    categories: 3,
    woodTypes: 3,
    products: 3,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
