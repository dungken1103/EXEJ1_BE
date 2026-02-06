import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { OrderModule } from './modules/order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminOrderModule } from './modules/admin-order/admin-order.module';
import { CartModule } from './modules/cart/cart.module';
import { ProvincesModule } from './modules/province/provinces.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';

@Module({
  imports: [ScheduleModule.forRoot(),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    AdminOrderModule,
    CartModule,
    ProvincesModule,
    AdminDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
