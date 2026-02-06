import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }

  async getOrdersByStatusAndUser(status: string, userId: string, limit?: number) {
    const whereClause: any = {
      userId,
    };

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      whereClause.status = status as OrderStatus;
    }

    return this.prisma.order.findMany({
      where: whereClause,
      take: limit, // Apply limit if provided
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async confirmReceived(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' },
    });

    return { status: updatedOrder.status };
  }

  async createOrder(
    userId: string | null | undefined,
    items: { productId: string; quantity: number; price: number }[],
    payment: PaymentMethod,
    userAddress: any,
  ) {
    const isGuest = userId == null || userId === '';

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: isGuest ? null : userId,
          total,
          status: OrderStatus.PENDING,
          payment,
          userAddress,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        });
      }

      return order;
    });
  }

  async cancelOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Order cancelled' };
  }
}

