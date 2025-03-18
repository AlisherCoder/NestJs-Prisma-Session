import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      let data = await this.prisma.category.create({ data: createCategoryDto });
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findAll(query: any) {
    let { orderBy, limit = 10, page = 1, name } = query;
    try {
      let data = await this.prisma.category.findMany({
        where: { name: { mode: 'insensitive', contains: name } },
        orderBy: { name: orderBy },
        take: Number(limit),
        skip: (page - 1) * limit,
        include: { Product: true },
      });

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      let data = await this.prisma.category.findFirst({
        where: { id },
        include: { Product: true },
      });
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      let data = await this.prisma.category.findFirst({ where: { id } });
      if (!data) {
        return new NotFoundException('Not found data');
      }

      let updated = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      return { data: updated };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      let data = await this.prisma.category.delete({ where: { id } });
      if (!data) {
        return new NotFoundException('Not found data');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
