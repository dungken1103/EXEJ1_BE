import { Controller, Get, Query, Post, Body, Put, Param, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentMethod } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

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

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createOrder(
    @Request() req,
    @Body()
    body: {
      items: { productId: string; quantity: number; price: number }[];
      payment: PaymentMethod;
      userAddress: any;
    },
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.orderService.createOrder(
      userId,
      body.items,
      body.payment,
      body.userAddress,
    );
  }
}

