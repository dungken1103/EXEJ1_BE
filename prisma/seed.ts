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
      description: `
<h2>Giới thiệu sản phẩm</h2>
<p><strong>Mô hình 3D bản đồ Việt Nam cơ bản</strong> là sản phẩm thủ công độc đáo được chế tác từ gỗ Hương tự nhiên - một trong những loại gỗ quý hiếm của Việt Nam. Sản phẩm được tạo ra từ nguồn gỗ tái chế từ các xưởng mộc, góp phần bảo vệ môi trường và tận dụng tối đa nguồn tài nguyên thiên nhiên.</p>

<h2>Quy trình sản xuất</h2>
<p>Mỗi mảnh ghép của bản đồ được cắt bằng công nghệ CNC hiện đại với độ chính xác cao, đảm bảo các chi tiết sắc nét và khớp hoàn hảo khi lắp ráp. Quy trình sản xuất trải qua nhiều công đoạn tỉ mỉ: từ việc chọn lọc gỗ chất lượng, xử lý chống mối mọt, đến việc đánh bóng và hoàn thiện bề mặt.</p>

<h2>Đặc điểm nổi bật</h2>
<ul>
  <li><strong>Chất liệu cao cấp:</strong> Gỗ Hương tự nhiên với vân gỗ đẹp, màu sắc ấm áp và độ bền cao theo thời gian.</li>
  <li><strong>Thiết kế tinh xảo:</strong> Hình dáng đất nước Việt Nam được thể hiện chính xác với đường bờ biển, các đảo và quần đảo.</li>
  <li><strong>Dễ lắp ráp:</strong> Phù hợp với mọi lứa tuổi, từ trẻ em đến người lớn, tạo hoạt động gắn kết gia đình.</li>
  <li><strong>Trang trí đẳng cấp:</strong> Sản phẩm hoàn hảo để trang trí bàn làm việc, kệ sách hoặc phòng khách.</li>
</ul>

<h2>Ý nghĩa giáo dục</h2>
<p>Bản đồ gỗ không chỉ là món đồ trang trí mà còn là công cụ giáo dục hữu ích. Trẻ em có thể học về hình dáng đất nước, vị trí địa lý và lịch sử Việt Nam thông qua việc lắp ráp và khám phá từng chi tiết của bản đồ. Đây cũng là món quà ý nghĩa cho những người con xa xứ, gợi nhớ về quê hương.</p>

<h2>Cam kết chất lượng</h2>
<p>Chúng tôi cam kết mỗi sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao đến tay khách hàng. Sản phẩm được đóng gói cẩn thận kèm hướng dẫn lắp ráp chi tiết bằng hình ảnh. Bảo hành 12 tháng cho các lỗi do nhà sản xuất.</p>

<p><em>Waste To Worth - Biến phế thải thành giá trị, mang đến những sản phẩm thân thiện với môi trường và đậm đà bản sắc Việt Nam.</em></p>
      `,
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
      description: `
<h2>Giới thiệu sản phẩm</h2>
<p><strong>Bản đồ Việt Nam chi tiết 63 tỉnh thành</strong> là phiên bản cao cấp nhất trong bộ sưu tập bản đồ gỗ của Waste To Worth. Sản phẩm được chế tác tỉ mỉ từ gỗ Gụ - loại gỗ quý truyền thống với màu nâu đậm sang trọng và độ bền vượt trội.</p>

<h2>Điểm đặc biệt</h2>
<p>Khác với các phiên bản thông thường, bản đồ này bao gồm <strong>63 mảnh ghép riêng biệt</strong>, mỗi mảnh đại diện cho một tỉnh thành của Việt Nam. Ranh giới hành chính được khắc laser chính xác theo bản đồ hành chính chuẩn của Chính phủ. Người dùng có thể tháo rời từng tỉnh thành để tìm hiểu vị trí địa lý một cách trực quan.</p>

<h2>Giá trị giáo dục</h2>
<ul>
  <li><strong>Học địa lý:</strong> Giúp học sinh, sinh viên nắm vững vị trí các tỉnh thành, vùng miền của đất nước.</li>
  <li><strong>Phát triển tư duy:</strong> Việc lắp ráp bản đồ rèn luyện khả năng tư duy không gian và sự kiên nhẫn.</li>
  <li><strong>Gắn kết gia đình:</strong> Hoạt động lắp ráp cùng gia đình tạo kỷ niệm đáng nhớ và truyền đạt kiến thức về quê hương.</li>
  <li><strong>Công cụ giảng dạy:</strong> Phù hợp cho giáo viên sử dụng trong các tiết học Địa lý, Lịch sử.</li>
</ul>

<h2>Quy trình sản xuất chuyên nghiệp</h2>
<p>Gỗ Gụ được thu mua từ các xưởng mộc uy tín, đảm bảo nguồn gốc rõ ràng và chất lượng đồng đều. Sau khi xử lý chống ẩm và mối mọt, gỗ được đưa vào máy CNC công nghiệp để cắt với độ chính xác đến 0.1mm. Mỗi mảnh ghép được đánh số và có ký hiệu riêng để dễ dàng nhận biết khi lắp ráp.</p>

<h2>Hướng dẫn sử dụng và bảo quản</h2>
<p>Sản phẩm đi kèm hướng dẫn lắp ráp chi tiết bằng video QR code. Để bảo quản tốt nhất, nên đặt sản phẩm ở nơi khô ráo, tránh ánh nắng trực tiếp và độ ẩm cao. Có thể lau bụi bằng khăn khô mềm hoặc chổi lông mịn.</p>

<h2>Quà tặng ý nghĩa</h2>
<p>Đây là món quà hoàn hảo cho các dịp sinh nhật, khai giảng, tốt nghiệp, hoặc làm quà tặng đối tác doanh nghiệp. Sản phẩm được đóng hộp cao cấp, kèm túi xách và thiệp chúc mừng theo yêu cầu.</p>

<p><em>Mỗi sản phẩm là một tác phẩm nghệ thuật độc đáo, mang đậm dấu ấn thủ công và tình yêu quê hương Việt Nam.</em></p>
      `,
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
      description: `
<h2>Giới thiệu sản phẩm</h2>
<p><strong>Mô hình bản đồ Miền Nam Việt Nam</strong> là sản phẩm dành riêng cho những ai muốn khám phá và tìm hiểu về vùng đất phương Nam trù phú. Bản đồ thể hiện chi tiết 19 tỉnh thành Đông Nam Bộ và Tây Nam Bộ, từ Bình Phước đến tận Cà Mau - điểm cực Nam của Tổ quốc.</p>

<h2>Chất liệu đặc biệt</h2>
<p>Sản phẩm được làm từ <strong>gỗ hỗn hợp tái chế</strong>, kết hợp nhiều loại gỗ quý khác nhau như Căm Xe, Xoan, và Tràm. Sự đa dạng về màu sắc và vân gỗ tạo nên vẻ đẹp độc đáo cho từng sản phẩm - không có hai bản đồ nào giống hệt nhau.</p>

<h2>Đặc điểm vùng miền</h2>
<ul>
  <li><strong>Đông Nam Bộ:</strong> Bao gồm TP.HCM - trung tâm kinh tế lớn nhất cả nước, cùng các tỉnh công nghiệp phát triển như Bình Dương, Đồng Nai.</li>
  <li><strong>Tây Nam Bộ:</strong> Vùng đồng bằng sông Cửu Long với 13 tỉnh thành, nổi tiếng với nền nông nghiệp lúa nước và thủy sản.</li>
  <li><strong>Điểm đặc biệt:</strong> Mũi Cà Mau và các đảo ven biển được thể hiện chi tiết trên bản đồ.</li>
</ul>

<h2>Ứng dụng đa dạng</h2>
<p>Bản đồ Miền Nam có kích thước nhỏ gọn, phù hợp để:</p>
<ul>
  <li>Trang trí bàn làm việc văn phòng hoặc ở nhà</li>
  <li>Làm quà tặng cho bạn bè, người thân là con cháu Miền Nam</li>
  <li>Sưu tập cùng các bản đồ vùng miền khác (Miền Bắc, Miền Trung)</li>
  <li>Giáo cụ trực quan cho học sinh tìm hiểu về các tỉnh phía Nam</li>
</ul>

<h2>Câu chuyện văn hóa</h2>
<p>Miền Nam Việt Nam là vùng đất của những con người hiền hòa, mến khách, với nền văn hóa đặc sắc từ đờn ca tài tử đến ẩm thực đường phố. Sở hữu bản đồ này là cách để tôn vinh và gìn giữ những giá trị văn hóa độc đáo của vùng đất này.</p>

<h2>Thông tin bổ sung</h2>
<p>Sản phẩm được đóng gói trong hộp carton chắc chắn, bảo vệ an toàn trong quá trình vận chuyển. Mỗi bản đồ đều có số serial riêng và giấy chứng nhận xuất xứ từ Waste To Worth.</p>

<p><em>Hãy để bản đồ gỗ Miền Nam trở thành cầu nối giữa bạn và vùng đất phương Nam tươi đẹp.</em></p>
      `,
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
