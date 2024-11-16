import { Body, Controller, Get, Param, Patch, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '../auth/decorators/role.decorator'
import { Roles } from '../auth/enums/role.enum';
import { User } from '../auth/types/express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { UpdateUserDto } from './dto/update.user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getUserById(@Req() req: Request, @Param('id') id: string) {
    //console.log('Authenticated user:', req.user); 
    const userId = (req.user as User).id;
    return this.usersService.getUserById(id, userId);
  }

  @Put('blocked/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  blockedUser(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.blockedUser(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  updateProfile(@Req() req: Request, @Body() body: UpdateUserDto) {
    const userId = (req.user as User).id;
    return this.usersService.updateProfile(userId, body);
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  getUserCount(@Req() req: Request) {
    const userId = (req.user as User).id;
    return this.usersService.getUserCount(userId);
  }

  @Get('manager/:managerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  async getUsersByManager(@Param('managerId') managerId: string) {
    return this.usersService.getUsersByManager(managerId);
  }

}
