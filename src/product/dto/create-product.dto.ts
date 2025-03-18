import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 'Laptop.png' })
  @IsNotEmpty()
  @IsString()
  image: string;
}
