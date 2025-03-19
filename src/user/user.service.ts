import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as DeviceDetector from 'device-detector-js';

@Injectable()
export class UserService {
  private readonly deviceDetector = new DeviceDetector();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    let { email, password } = createUserDto;
    try {
      let user = await this.prisma.user.findFirst({ where: { email } });
      if (user) {
        return new ConflictException('Already exists');
      }

      let hash = bcrypt.hashSync(password, 10);
      createUserDto.password = hash;

      let created = await this.prisma.user.create({ data: createUserDto });
      return { data: created };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async login(loginUserDto: LoginUserDto, req: Request) {
    let { email, password } = loginUserDto;
    try {
      let user = await this.prisma.user.findFirst({ where: { email } });
      if (!user) {
        return new UnauthorizedException('Unauthorized');
      }

      let match = bcrypt.compareSync(password, user.password);
      if (!match) {
        return new UnauthorizedException('Unauthorized');
      }

      let session = await this.prisma.session.findFirst({
        where: { AND: [{ ipaddres: req.ip }, { userId: user.id }] },
      });

      if (!session) {
        let useragent: any = req.headers['user-agent'];
        let device = this.deviceDetector.parse(useragent);

        let sessionData: any = {
          userId: user.id,
          ipaddres: req.ip,
          info: device,
        };

        let newSession = await this.prisma.session.create({
          data: sessionData,
        });
      }

      let token = this.jwtService.sign({ id: user.id, role: user['role'] });
      return { data: token };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async getMyData(req: Request) {
    let user = req['user'];
    try {
      let session = await this.prisma.session.findFirst({
        where: { AND: [{ ipaddres: req.ip }, { userId: user?.id }] },
      });

      if (!session) {
        return new UnauthorizedException();
      }

      let data = await this.prisma.user.findFirst({ where: { id: user?.id } });

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async getSessions(req: Request) {
    let user = req['user'];
    try {
      let data = await this.prisma.session.findFirst({
        where: { userId: user?.id },
      });

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async delSession(id: number) {
    try {
      let data = await this.prisma.session.delete({ where: { id } });

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

    if (filter.email) {
      search.email = { mode: 'insensitive', contains: filter.email };
    }

    try {
      let data = await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: {
          [sortBy]: orderBy,
        },
        where: search,
      });

      if (!data.length) {
        return new NotFoundException('Not found users');
      }

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      let data = await this.prisma.user.findFirst({ where: { id } });
      if (!data) {
        return new UnauthorizedException('Unauthorized');
      }

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      let data = await this.prisma.user.findFirst({ where: { id } });
      if (!data) {
        return new UnauthorizedException('Unauthorized');
      }

      let updated = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return { data: updated };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      let data = await this.prisma.user.findFirst({ where: { id } });
      if (!data) {
        return new UnauthorizedException('Unauthorized');
      }

      let deleted = await this.prisma.user.delete({ where: { id } });

      return { data: deleted };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
