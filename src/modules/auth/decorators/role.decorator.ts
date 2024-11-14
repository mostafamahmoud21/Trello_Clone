import { SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/role.enum';

export const Role = (...roles: Roles[]) => SetMetadata('roles', roles);