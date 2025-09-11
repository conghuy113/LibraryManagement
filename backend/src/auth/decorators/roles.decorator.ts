import { SetMetadata } from '@nestjs/common';
import { RoleUser } from 'src/utils/RoleUser';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleUser[]) => SetMetadata(ROLES_KEY, roles);

// Decorator riêng cho admin
export const AdminOnly = () => Roles(RoleUser.ADMIN);

// Decorator cho reader
export const ReaderOnly = () => Roles(RoleUser.READER);

// Decorator cho manager
export const ManagerOnly = () => Roles(RoleUser.MANAGER);

// Decorator cho admin và manager
export const AdminOrManager = () => Roles(RoleUser.ADMIN, RoleUser.MANAGER);
