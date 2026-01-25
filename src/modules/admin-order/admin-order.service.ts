import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(status?: string) {
    const query: any = {
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    };

    if (status && status.trim() !== '') {
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        throw new BadRequestException('Trạng thái đơn hàng không hợp lệ');
      }
      query.where = { status: status as OrderStatus };
    }

    const orders = await this.prisma.order.findMany(query);

    return orders.map((order) => ({
      ...order,
      userAddress: order.userAddress as {
        fullName: string;
        phone: string;
        province: string;
        district: string;
        ward: string;
        addressDetail: string;
      },
    }));
  }

  async approveOrder(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Chỉ có thể duyệt đơn hàng ở trạng thái PENDING',
        );
      }

      for (const item of order.items) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm "${item.product.name}" không đủ tồn kho. Còn ${item.product.stock}, cần ${item.quantity}`,
          );
        }
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CONFIRMED },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      });
    });
  }

  async assignOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Chỉ có thể giao đơn hàng đã được duyệt');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DELIVERED },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
  }
}
