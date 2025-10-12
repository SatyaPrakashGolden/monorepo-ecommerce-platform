"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const redis_client_1 = require("../radis/redis-client");
let SuperAdminGuard = class SuperAdminGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const token = authHeader.split(' ')[1];
            const decoded = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            if (decoded.roleId !== 1 && decoded.email !== 'satya@flipitnews.com') {
                throw new common_1.ForbiddenException('Access restricted to Super Admin');
            }
            const refreshTokenKey = `refreshToken:${decoded.id}`;
            const storedRefreshToken = await redis_client_1.default.get(refreshTokenKey);
            if (!storedRefreshToken) {
                throw new common_1.UnauthorizedException('Session expired. Please log in again.');
            }
            req['user'] = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                roleId: decoded.roleId,
            };
            return true;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token has expired');
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            else if (error instanceof common_1.UnauthorizedException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
};
exports.SuperAdminGuard = SuperAdminGuard;
exports.SuperAdminGuard = SuperAdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], SuperAdminGuard);
//# sourceMappingURL=superadmin.guard.js.map