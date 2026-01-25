import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    return this.prisma.category.create({
      data: {
        name,
      },
      include: {
        products: true,
      },
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: {
        products: true,
      },
    });
  }
  async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return {
      success: true,
      data: category,
    };
  }
}
