import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleUser } from 'src/utils/RoleUser';

@Injectable()
export class RoleGuard implements CanActivate {  // Đổi tên từ RoleStrategy thành RoleGuard
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Lấy required roles từ decorator
        const requiredRoles = this.reflector.getAllAndOverride<RoleUser[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        // Lấy admin-only requirement
        const isAdminOnly = this.reflector.getAllAndOverride<boolean>('admin-only', [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Nếu endpoint yêu cầu admin-only
        if (isAdminOnly && user.role !== RoleUser.ADMIN) {
            throw new ForbiddenException('Access denied. Admin role required.');
        }

        // Nếu có yêu cầu roles cụ thể
        if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = requiredRoles.includes(user.role);
            if (!hasRole) {
                throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
            }
        }

        return true;
    }

    // Helper methods
    static isAdmin(user: any): boolean {
        return user && user.role === RoleUser.ADMIN;
    }

    static hasRole(user: any, role: RoleUser): boolean {
        return user && user.role === role;
    }

    static hasAnyRole(user: any, roles: RoleUser[]): boolean {
        return user && roles.includes(user.role);
    }
}