/* eslint-disable @typescript-eslint/no-unused-vars */
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import { Product, ProductCategory } from 'generated/prisma';
import { TokenPayload } from '../auth/models/token-payload';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly productsRepository: ProductsRepository,
  ) {}

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
    const cacheKey = `products:${options.page}:${options.limit}:${options.category}:${options.name}:${options.sortBy}:${options.order}`;
    const cacheTTL = 1000 * 60; // 1 minute

    const cachedProducts = await this.cache.get<Product[]>(cacheKey);

    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await this.productsRepository.findAll(options);

    await this.cache.set(cacheKey, products, cacheTTL);

    return products;
  }

  async findProduct(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;
    const cacheTTL = 1000 * 60; // 1 minute

    const cachedProduct = await this.cache.get<Product | null>(cacheKey);

    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productsRepository.findProduct(id);

    if (!product) {
      return null;
    }

    await this.cache.set(cacheKey, product, cacheTTL);

    return product;
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
