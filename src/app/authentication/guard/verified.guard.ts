import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
@Injectable()
export class VerifiedGuard implements CanActivate {
    constructor() { }

    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();
        return user.verified;  
    }
}