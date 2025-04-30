/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/_shared/prisma-database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma, Product, ProductCategory } from 'generated/prisma';
import { QueryResult } from 'src/_shared/types/queryResult';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, data: CreateProductDto) {
    const product = await this.prismaService.product.create({
      data: {
        category: data.category,
        description: data.description,
        name: data.name,
        price: data.price,
        seller: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return product;
  }

  async findAll(options: {
    page: number;
    limit: number;
    category?: ProductCategory;
    name?: string;
    sortBy?: string;
    order?: string;
  }): Promise<QueryResult<Product>> {
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};

    if (options.sortBy) {
      orderBy[options.sortBy] = options.order ?? 'asc';
    }

    const where: Prisma.ProductWhereInput = {
      isAvailable: true, // retun only available products
      category: options.category,
      name: {
        contains: options.name,
      },
    };

    const [count, products] = await Promise.all([
      this.prismaService.product.count({
        where,
      }),
      this.prismaService.product.findMany({
        skip: options.page * options.limit,
        take: options.limit,
        where,
        orderBy,
      }),
    ]);

    const res = {
      results: products,
      page: options.page,
      nbPages: Math.ceil(count / options.limit),
      resultsPerPage: options.limit,
      total: count,
    };

    return res;
  }

  async findProduct(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
