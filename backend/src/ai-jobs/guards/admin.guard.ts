import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Mock Admin Guard - In production, this should check for admin role/permissions
 * For now, it checks if user has an 'admin' property set to true
 * or if the user role is 'admin'
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Mock admin check - in production, verify against actual admin role/permissions
    const isAdmin = user?.admin === true || user?.role === 'admin';

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
