import { Body, Controller, Get, Param, Patch, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../auth/enums/role.enum';
import { User } from '../auth/types/express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { UpdateUserDto } from './dto/update.user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Retrieves a user by their ID.
   * 
   * @param req - The request object containing user information.
   * @param id - The ID of the user to retrieve.
   * @returns The user information.
   * @throws UnauthorizedException - If the user is not authorized to access the requested user.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getUserById(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as User).id;
    return this.usersService.getUserById(id, userId);
  }

  /**
   * Blocks a user by their ID.
   * 
   * @param req - The request object containing user information.
   * @param id - The ID of the user to be blocked.
   * @returns A message indicating the result of the blocking operation.
   * @throws UnauthorizedException - If the user is not authorized to block the specified user.
   */
  @Put('blocked/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  blockedUser(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.blockedUser(id);
  }

  /**
   * Updates the profile of the authenticated user.
   * 
   * @param req - The request object containing user information.
   * @param body - The updated user profile details.
   * @returns The updated user profile.
   */
  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  updateProfile(@Req() req: Request, @Body() body: UpdateUserDto) {
    const userId = (req.user as User).id;
    return this.usersService.updateProfile(userId, body);
  }

  /**
   * Retrieves the total count of users.
   * 
   * @param req - The request object containing user information.
   * @returns The count of users.
   * @throws UnauthorizedException - If the user is not authorized to access user count.
   */
  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  getUserCount(@Req() req: Request) {
    const userId = (req.user as User).id;
    return this.usersService.getUserCount(userId);
  }

  /**
   * Retrieves all users managed by a specific manager.
   * 
   * @param managerId - The ID of the manager whose users are being retrieved.
   * @returns A list of users managed by the specified manager.
   * @throws UnauthorizedException - If the user is not authorized to view the users of the manager.
   */
  @Get('manager/:managerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  async getUsersByManager(@Param('managerId') managerId: string) {
    return this.usersService.getUsersByManager(managerId);
  }
}