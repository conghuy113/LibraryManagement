import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleUser } from 'src/utils/RoleUser';

@Injectable()
export class RoleStrategy implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<RoleUser[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // Nếu không có role requirement, cho phép truy cập
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const hasRole = requiredRoles.includes(user.role);
        
        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions. Admin role required.');
        }

        return true;
    }

    // Helper method để check admin specifically
    static isAdmin(user: any): boolean {
        return user && user.role === RoleUser.ADMIN;
    }

    // Helper method để check user có role cụ thể
    static hasRole(user: any, role: RoleUser): boolean {
        return user && user.role === role;
    }
}
