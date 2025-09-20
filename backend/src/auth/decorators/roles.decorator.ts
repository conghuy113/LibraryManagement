import { SetMetadata } from '@nestjs/common';
import { RoleUser } from 'src/utils/RoleUser';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleUser[]) => SetMetadata(ROLES_KEY, roles);

export const AdminOnly = () => Roles(RoleUser.ADMIN);

export const ReaderOnly = () => Roles(RoleUser.READER);

export const ManagerOnly = () => Roles(RoleUser.MANAGER);

export const AdminOrManager = () => Roles(RoleUser.ADMIN, RoleUser.MANAGER);

export const ManagerOrReader = () => Roles(RoleUser.MANAGER, RoleUser.READER);