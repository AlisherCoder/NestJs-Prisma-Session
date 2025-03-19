import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { SelfGuard } from 'src/auth/self.guard';
import { Role } from './dto/create-user.dto';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    return this.userService.login(loginUserDto, req);
  }

  @UseGuards(AuthGuard)
  @Get('mydata')
  getMyData(@Req() req: Request) {
    return this.userService.getMyData(req);
  }

  @UseGuards(AuthGuard)
  @Get('sessions')
  getSessions(@Req() req: Request) {
    return this.userService.getSessions(req);
  }

  @UseGuards(AuthGuard)
  @Delete('session:id')
  delSession(@Param('id') id: string) {
    return this.userService.delSession(+id);
  }

  @ApiQuery({ name: 'orderBy', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'email'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.userService.findAll(query);
  }

  @UseGuards(SelfGuard)
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(SelfGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(SelfGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
