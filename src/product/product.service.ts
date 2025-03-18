import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      let category = await this.prisma.category.findFirst({
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        return new NotFoundException('Not found category');
      }

      let data = await this.prisma.product.create({ data: createProductDto });
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findAll(query: any) {
    let { orderBy, sortBy = 'name', limit = 10, page = 1, ...filter } = query;
    let search: any = {};

    if (filter.name) {
      search.name = { mode: 'insensitive', contains: filter.name };
    }

    if (filter.price) {
      search.price = Number(filter.price);
    }

    if (filter.categoryId) {
      search.category = { id: Number(filter.categoryId) };
    }

    if (filter.maxPrice || filter.minPrice) {
      search.price = {};
      if (filter.minPrice) search.price.gte = Number(filter.minPrice);
      if (filter.maxPrice) search.price.lte = Number(filter.maxPrice);
    }

    try {
      let data = await this.prisma.product.findMany({
        include: { category: true },
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: {
          [sortBy]: orderBy,
        },
        where: search,
      });

      if (!data.length) {
        return new NotFoundException('Not found data');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      let data = await this.prisma.product.findFirst({
        where: { id },
        include: { category: true },
      });

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      let data = await this.prisma.product.findFirst({ where: { id } });
      if (!data) {
        return new NotFoundException('Not found data');
      }

      let updated = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });

      if (updateProductDto.image) {
        let oldImage = path.join('uploads', data['image']);
        try {
          fs.unlinkSync(oldImage);
        } catch (error) {}
      }

      return { data: updated };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      let data = await this.prisma.product.delete({ where: { id } });
      if (!data) {
        return new NotFoundException('Not found data');
      }

      let oldImage = path.join('uploads', data['image']);
      try {
        fs.unlinkSync(oldImage);
      } catch (error) {}

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
