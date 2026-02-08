
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

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
      include: {
        items: {
          include: {
            product: true,
          }
        },
        user: true,
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' },
    });

    // Notify user
    if (order.user?.email) {
      this.mailService.sendOrderStatusUpdateEmail(order.user.email, order, 'DELIVERED').catch(err => console.error(err));
    }

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

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
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
        include: { items: { include: { product: true } } },
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

      return newOrder;
    });

    // Send email to admin
    const adminEmail = process.env.MAIL_FROM || process.env.MAIL_USER;
    if (adminEmail) {
      this.mailService.sendOrderCreatedEmail(adminEmail, order).catch(err => console.error(err));
    }

    return order;
  }

  async cancelOrder(orderId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        user: true,
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelReason: reason,
        },
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            sold: { decrement: item.quantity },
          },
        });
      }

      return order; // Return original order for email context
    });

    // Send email to admin about cancellation
    const adminEmail = process.env.MAIL_FROM || process.env.MAIL_USER;
    if (adminEmail) {
      this.mailService.sendOrderCancelledEmail(adminEmail, order, reason).catch(err => console.error(err));
    }

    // Optionally notify user that they cancelled (or just rely on UI)
    if (order.user?.email) {
      this.mailService.sendOrderStatusUpdateEmail(order.user.email, order, 'CANCELLED', reason).catch(err => console.error(err));
    }

    return { message: 'Order cancelled' };
  }
}
