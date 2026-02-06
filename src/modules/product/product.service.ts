import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, ProductStatus } from '@prisma/client';
import { ProductFilterDto } from './dto/product-filter.dto';
import { slugify } from '../../utils/slug.util';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) { }

  async createWithImage(body: any, imagePath: string) {
    const {
      name,
      description,
      price,
      categoryId,
      woodTypeId,
      difficulty,
      dimensions,
      stock,
      slug,
    } = body;

    const data: Prisma.ProductCreateInput = {
      name,
      image: imagePath,
      description: description || null,
      price: Number(price),
      stock: stock != null ? Number(stock) : 0,
      slug: slugify(name),
      difficulty: difficulty || null,
      dimensions: dimensions || null,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      woodType: woodTypeId ? { connect: { id: woodTypeId } } : undefined,
    };

    return this.prisma.product.create({
      data,
      include: {
        category: true,
        woodType: true,
      },
    });
  }

  async disableProductById(productId: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: 'DISABLE' },
    });
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        woodType: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProductWithImage(
    id: string,
    body: any,
    imagePath: string | null,
  ) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const {
      name,
      description,
      price,
      categoryId,
      woodTypeId,
      difficulty,
      dimensions,
      stock,
      slug,
    } = body;

    const data: Prisma.ProductUpdateInput = {
      ...(name && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(price != null && { price: Number(price) }),
      ...(imagePath && { image: imagePath }),
      ...(name && { slug: slugify(name) }),
      ...(difficulty !== undefined && { difficulty: difficulty || null }),
      ...(dimensions !== undefined && { dimensions: dimensions || null }),
      ...(stock != null && { stock: Number(stock) }),
      ...(categoryId !== undefined && {
        category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
      }),
      ...(woodTypeId !== undefined && {
        woodType: woodTypeId ? { connect: { id: woodTypeId } } : { disconnect: true },
      }),
    };

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        woodType: true,
      },
    });
  }

  async findAllProducts(query: ProductFilterDto) {
    const { page = 1, limit = 10, categoryId, woodTypeId, status } = query;

    return this.prisma.product.findMany({
      where: {
        ...(status && { status }),
        ...(categoryId && { categoryId }),
        ...(woodTypeId && { woodTypeId }),
      },
      include: {
        category: true,
        woodType: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStock(id: string, stock: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock },
      include: { category: true, woodType: true },
    });
  }

  async getProductsByName(
    name: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: Prisma.ProductWhereInput = {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    };

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          woodType: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
  }
}
