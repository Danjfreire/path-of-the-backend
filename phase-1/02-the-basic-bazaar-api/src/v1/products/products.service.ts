/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { ProductCategory } from 'generated/prisma';

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

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
