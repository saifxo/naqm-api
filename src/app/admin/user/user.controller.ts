import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/app/authentication/guard/roles.guard';
import { ROLE } from 'src/shared/constants';
import { Roles } from 'src/app/authentication/decorators/role.decorator';
import { UserService } from './user.service';
import { SignupDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('Admin-Users')
@ApiBearerAuth('JWT-auth')
@Roles(ROLE.ADMIN)
@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() data: SignupDto) {
    return this.userService.create(data);
  }

  @Get('/')
  async findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.userService.update(id, data);
  }
}
