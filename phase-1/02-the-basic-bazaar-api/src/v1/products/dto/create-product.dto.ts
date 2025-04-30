import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { $Enums, ProductCategory } from 'generated/prisma';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  price: number;

  @IsString()
  @IsEnum($Enums.ProductCategory)
  category: ProductCategory;
}
