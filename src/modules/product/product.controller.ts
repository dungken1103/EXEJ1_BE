import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductStatus } from '@prisma/client';
import { ProductFilterDto } from './dto/product-filter.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('search')
  async searchProducts(
    @Query('name') name: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.productService.getProductsByName(name, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', required: true })
  getById(@Param('id') id: string) {
    return this.productService.getById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'woodTypeId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  getProducts(@Query() query: ProductFilterDto) {
    return this.productService.findAllProducts(query);
  }

  @Patch(':id/disable')
  @ApiOperation({ summary: 'Disable a product by ID (soft delete)' })
  disableProduct(@Param('id') id: string) {
    return this.productService.disableProductById(id);
  }

  @Post('create-product')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload image and create product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        categoryId: { type: 'string' },
        woodTypeId: { type: 'string' },
        difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
        dimensions: { type: 'string' },
        stock: { type: 'number' },
        slug: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const imagePath = `/uploads/products/${file.filename}`;
    return this.productService.createWithImage(body, imagePath);
  }

  @Patch(':id/update-product')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update product with optional image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        categoryId: { type: 'string' },
        woodTypeId: { type: 'string' },
        difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
        dimensions: { type: 'string' },
        stock: { type: 'number' },
        slug: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async updateProductWithImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const imagePath = file ? `/uploads/products/${file.filename}` : null;
    return this.productService.updateProductWithImage(id, body, imagePath);
  }

  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật tồn kho sản phẩm' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stock: { type: 'number', example: 10 },
      },
    },
  })
  async updateStock(@Param('id') id: string, @Body('stock') stock: number) {
    if (isNaN(stock) || stock < 0) {
      throw new BadRequestException('Số lượng tồn kho không hợp lệ');
    }
    return this.productService.updateStock(id, stock);
  }
}
