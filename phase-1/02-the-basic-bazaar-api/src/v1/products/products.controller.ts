import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/_shared/authorization/guards/auth.guard';
import { Roles } from 'src/_shared/authorization/decorators/roles.decorator';
import { ReqUser } from 'src/_shared/authorization/decorators/user.decorator';
import { TokenPayload } from '../auth/models/token-payload';
import { ValidateEnum } from 'src/_shared/pipes/validate-enum.pipe';
import { productOrder, productSortBy } from './models/validations';
import { $Enums, ProductCategory } from 'generated/prisma';

@UseGuards(AuthGuard)
@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles('ADMIN', 'USER')
  @Post()
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @ReqUser() user: TokenPayload,
  ) {
    return this.productsService.createProduct(user.sub, createProductDto);
  }

  @Get()
  findAllProducts(
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('category', new ValidateEnum($Enums.ProductCategory, false))
    category?: ProductCategory,
    @Query('name') name?: string,
    @Query('sortBy', new ValidateEnum(productSortBy, false))
    sortBy?: string,
    @Query('order', new ValidateEnum(productOrder, false))
    order?: string,
  ) {
    return this.productsService.findAll({
      page,
      limit,
      category,
      name,
      sortBy,
      order,
    });
  }

  @Roles('ADMIN', 'USER')
  @Get(':id')
  async findProduct(@Param('id') id: string) {
    const product = await this.productsService.findProduct(id);

    if (!product) {
      throw new NotFoundException('product--not-found');
    }

    return product;
  }

  @Roles('ADMIN', 'USER')
  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @ReqUser() user: TokenPayload,
  ) {
    const updatedProduct = await this.productsService.updateProduct(
      id,
      user,
      updateProductDto,
    );

    if (!updatedProduct) {
      throw new NotFoundException('product-not-found');
    }

    return updatedProduct;
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
