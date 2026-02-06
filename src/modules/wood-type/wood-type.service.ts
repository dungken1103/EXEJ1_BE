import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WoodTypeService {
    constructor(private readonly prisma: PrismaService) { }

    async getAll() {
        return this.prisma.woodType.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });
    }

    async create(data: { name: string; description?: string }) {
        const existing = await this.prisma.woodType.findUnique({
            where: { name: data.name },
        });

        if (existing) {
            throw new BadRequestException('Loại gỗ này đã tồn tại');
        }

        return this.prisma.woodType.create({ data });
    }

    async update(id: string, data: { name?: string; description?: string }) {
        const woodType = await this.prisma.woodType.findUnique({
            where: { id },
        });

        if (!woodType) {
            throw new NotFoundException('Không tìm thấy loại gỗ');
        }

        if (data.name && data.name !== woodType.name) {
            const existing = await this.prisma.woodType.findUnique({
                where: { name: data.name },
            });
            if (existing) {
                throw new BadRequestException('Tên loại gỗ đã được sử dụng');
            }
        }

        return this.prisma.woodType.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        const woodType = await this.prisma.woodType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!woodType) {
            throw new NotFoundException('Không tìm thấy loại gỗ');
        }

        if (woodType._count.products > 0) {
            throw new BadRequestException(
                `Không thể xóa loại gỗ này vì đang có ${woodType._count.products} sản phẩm tham chiếu.`
            );
        }

        return this.prisma.woodType.delete({
            where: { id },
        });
    }
}
