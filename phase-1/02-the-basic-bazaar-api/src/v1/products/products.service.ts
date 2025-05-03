/* eslint-disable @typescript-eslint/no-unused-vars */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { ProductCategory } from 'generated/prisma';
import { TokenPayload } from '../auth/models/token-payload';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async createProduct(userId: string, dto: CreateProductDto) {
    return this.productsRepository.create(userId, dto);
  }

  async findAll(options: {
    page: number;
    limit: number;
    category?: ProductCategory;
    name?: string;
    sortBy?: string;
    order?: string;
  }) {
    return await this.productsRepository.findAll(options);
  }

  async findProduct(id: string) {
    return await this.productsRepository.findProduct(id);
  }

  async updateProduct(
    id: string,
    user: TokenPayload,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsRepository.findProduct(id);

    if (!product) {
      return null;
    }

    // only the owner of the product or admin can update the product
    if (product.sellerId !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenException('product-not-owned');
    }

    return await this.productsRepository.updateProduct(id, updateProductDto);
  }

  async deleteProduct(id: string, user: TokenPayload) {
    const product = await this.productsRepository.findProduct(id);

    if (!product) {
      return null;
    }

    // only the owner of the product or admin can update the product
    if (product.sellerId !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenException('product-not-owned');
    }

    return await this.productsRepository.deleteProduct(id);
  }
}
