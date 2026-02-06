import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../user/user.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':userId')
  async updateUser(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Put(':userId/change-password')
  async changePassword(@Param('userId') userId: string, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Get(':userId/stats')
  async getUserStats(@Param('userId') userId: string) {
    return this.usersService.getUserStats(userId);
  }

}
