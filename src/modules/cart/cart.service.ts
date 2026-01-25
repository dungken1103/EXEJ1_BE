import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    if (product.status !== 'AVAILABLE') {
      throw new BadRequestException('Product is not available for sale');
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: { product: true },
    });
  }

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { addedAt: 'desc' },
    });
  }

  async updateQuantity(userId: string, cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });
  }

  async removeItem(userId: string, cartItemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return { message: 'Item removed successfully' };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { message: 'Cart cleared successfully' };
  }
}
