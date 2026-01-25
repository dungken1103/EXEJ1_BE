import { Controller, Get, Query, Post, Body, Put, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentMethod } from '@prisma/client';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('get')
  async getOrdersByStatusAndUser(
    @Query('status') status: string,
    @Query('userId') userId: string,
  ) {
    return this.orderService.getOrdersByStatusAndUser(status, userId);
  }

  @Put('confirm-received/:orderId')
  async confirmReceived(@Param('orderId') orderId: string) {
    return this.orderService.confirmReceived(orderId);
  }

  @Put(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.orderService.cancelOrder(orderId);
  }

  @Post('create')
  async createOrder(
    @Body()
    body: {
      userId?: string | null;
      items: { productId: string; quantity: number; price: number }[];
      payment: PaymentMethod;
      userAddress: any;
    },
  ) {
    return this.orderService.createOrder(
      body.userId ?? null,
      body.items,
      body.payment,
      body.userAddress,
    );
  }
}
