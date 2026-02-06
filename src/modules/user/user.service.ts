import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        passwordHash: true, // Need to check if empty
      },
    });
    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      hasPassword: passwordHash !== '', // Flag for frontend
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
    });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Google user check
    if (!user.passwordHash) {
      throw new BadRequestException('Cannot change password for Google account');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async getUserStats(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      select: { total: true, status: true },
    });

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(order => order.status === 'DELIVERED' || order.status === 'CONFIRMED' || order.status === 'SHIPPING' || order.status === 'PENDING') // Count pending/confirmed too or just delivered? Usually just confirmed/delivered
      // Let's count all except cancelled for "Potential Spend" or just Delivered for "Real Spend". 
      // User request "Thống kê mua hàng". Let's stick to total spent on non-cancelled orders.
      .filter(order => order.status !== 'CANCELLED')
      .reduce((sum, order) => sum + order.total, 0);

    const successfulOrders = orders.filter(order => order.status === 'DELIVERED').length;

    return {
      totalOrders,
      totalSpent,
      successfulOrders,
    };
  }

}
