import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class ProductFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'page must be a number' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'limit must be a number' })
  limit?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  woodTypeId?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'status must be a valid ProductStatus enum' })
  status?: ProductStatus;
}
