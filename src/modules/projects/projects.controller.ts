import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/Create.Project.Dto';
import { Request } from 'express';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { User } from '../auth/types/express';
import { UpdateProjectDto } from './dto/Update.Project.Dto';
import { InviteUserProjectDto } from './dto/Invite.user.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  createNewProject(@Req() req: Request, @Body() body: CreateProjectDto) {
    const userId = (req.user as User).id
    return this.projectsService.createNewProject(userId, body)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  getProjectById(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as User).id
    return this.projectsService.getProjectById(id, userId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  async updateProject(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: UpdateProjectDto,
  ) {
    const userId = (req.user as User).id;
    return this.projectsService.updateProject(id, userId, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  async deleteProject(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.projectsService.deleteProject(id, userId);
  }

  @Post('invite/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  inviteUser(@Param('id') id: string, @Req() req: Request, @Body() body: InviteUserProjectDto) {
    const userId = (req.user as User).id;
    return this.projectsService.inviteUser(id, userId, body);
  }

  @Post('Accept-Invite/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  acceptInvite(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.projectsService.acceptInvite(id, userId);
  }

  @Get('All-Projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  getAllProjects(@Req() req: Request) {
    const userId = (req.user as User).id;
    return this.projectsService.getAllProjects(userId);
  }

  @Get('employee')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Role(Roles.USER) 
  async getEmployeeProjects(@Req() req: Request) {
    const userId = (req.user as User).id; 
    return this.projectsService.getEmployeeProjects(userId); 
  }

}
