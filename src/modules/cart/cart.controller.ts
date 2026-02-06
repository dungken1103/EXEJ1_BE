import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add product to cart' })
  addToCart(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.addToCart(userId, productId, quantity);
  }

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiQuery({ name: 'userId', required: true })
  getCart(@Query('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Patch(':id/quantity')
  @ApiOperation({ summary: 'Update quantity of a cart item' })
  @ApiParam({ name: 'id', required: true })
  updateQuantity(
    @Param('id') cartItemId: string,
    @Body('userId') userId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(userId, cartItemId, quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a cart item' })
  @ApiParam({ name: 'id', required: true })
  removeItem(
    @Param('id') cartItemId: string,
    @Body('userId') userId: string,
  ) {
    return this.cartService.removeItem(userId, cartItemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear user cart' })
  @ApiQuery({ name: 'userId', required: true })
  clearCart(@Query('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
