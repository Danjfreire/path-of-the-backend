import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/_shared/authorization/guards/auth.guard';
import { Roles } from 'src/_shared/authorization/decorators/roles.decorator';
import { ReqUser } from 'src/_shared/authorization/decorators/user.decorator';
import { TokenPayload } from '../auth/models/token-payload';

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
    return this.productsService.create(user.sub, createProductDto);
  }

  @Get()
  findAllProducts() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findProduct(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
