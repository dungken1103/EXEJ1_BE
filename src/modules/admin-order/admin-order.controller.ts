import { Controller, Get, Query, Put, Param, BadRequestException, Body } from '@nestjs/common';
import { AdminOrderService } from './admin-order.service';
import { OrderStatus } from '@prisma/client';

@Controller('admin/order')
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) { }

  @Get('get')
  async getOrders(
    @Query('status') status?: string
  ) {
    return this.adminOrderService.getOrders(status);
  }

  @Put(':orderId/approve')
  async approveOrder(@Param('orderId') orderId: string) {
    return this.adminOrderService.approveOrder(orderId);
  }

  @Put(':orderId/assign')
  async assignOrder(@Param('orderId') orderId: string) {
    return this.adminOrderService.assignOrder(orderId);
  }

  @Put(':orderId/cancel')
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Body('reason') reason: string,
  ) {
    if (!reason) {
      throw new BadRequestException('Vui lòng nhập lý do hủy đơn');
    }
    return this.adminOrderService.cancelOrder(orderId, reason);
  }
}
