import { IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString({ each: true })
  itemIds: string[];
}
