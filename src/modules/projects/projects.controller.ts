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
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Creates a new project.
   * 
   * @param req - The request object containing user information.
   * @param body - The details of the project to be created.
   * @returns The created project.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  createNewProject(@Req() req: Request, @Body() body: CreateProjectDto) {
    const userId = (req.user as User).id;
    return this.projectsService.createNewProject(userId, body);
  }

  /**
   * Retrieves a project by its ID.
   * 
   * @param req - The request object containing user information.
   * @param id - The ID of the project to retrieve.
   * @returns The requested project.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  getProjectById(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as User).id;
    return this.projectsService.getProjectById(id, userId);
  }

  /**
   * Updates an existing project.
   * 
   * @param id - The ID of the project to update.
   * @param req - The request object containing user information.
   * @param body - The updated project details.
   * @returns The updated project.
   */
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

  /**
   * Deletes a project by its ID.
   * 
   * @param id - The ID of the project to delete.
   * @param req - The request object containing user information.
   * @returns A message indicating the result of the deletion.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  async deleteProject(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.projectsService.deleteProject(id, userId);
  }

  /**
   * Invites a user to join a project.
   * 
   * @param id - The ID of the project to which the user is invited.
   * @param req - The request object containing user information.
   * @param body - The details of the user to invite.
   * @returns A message indicating the result of the invitation.
   */
  @Post('invite/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  inviteUser(@Param('id') id: string, @Req() req: Request, @Body() body: InviteUserProjectDto) {
    const userId = (req.user as User).id;
    return this.projectsService.inviteUser(id, userId, body);
  }

  /**
   * Accepts an invitation to join a project.
   * 
   * @param id - The ID of the invitation to accept.
   * @param req - The request object containing user information.
   * @returns A message indicating the result of accepting the invitation.
   */
  @Post('Accept-Invite/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  acceptInvite(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.projectsService.acceptInvite(id, userId);
  }

  /**
   * Retrieves all projects for the manager.
   * 
   * @param req - The request object containing user information.
   * @returns A list of all projects.
   */
  @Get('All-Projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  getAllProjects(@Req() req: Request) {
    const userId = (req.user as User).id;
    return this.projectsService.getAllProjects(userId);
  }

  /**
   * Retrieves all projects for an employee.
   * 
   * @param req - The request object containing user information.
   * @returns A list of projects associated with the employee.
   */
  @Get('employee')
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Role(Roles.USER) 
  async getEmployeeProjects(@Req() req: Request) {
    const userId = (req.user as User).id; 
    return this.projectsService.getEmployeeProjects(userId); 
  }
}