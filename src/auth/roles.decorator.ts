import { SetMetadata } from '@nestjs/common';
import { RoleEnumType } from 'src/user/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnumType[]) =>
  SetMetadata(ROLES_KEY, roles);
