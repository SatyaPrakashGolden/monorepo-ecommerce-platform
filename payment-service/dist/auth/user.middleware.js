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
exports.UserAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const redis_client_1 = require("../radis/redis-client");
let UserAuthGuard = class UserAuthGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Authorization header is missing');
        }
        if (!authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Invalid authorization header format. Expected: Bearer <token>');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new common_1.UnauthorizedException('Token not provided');
        }
        console.log(token);
        let decoded;
        try {
            decoded = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
        }
        catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Access token has expired');
            }
            if (jwtError.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('Invalid access token');
            }
            throw new common_1.UnauthorizedException('Token verification failed');
        }
        if (!decoded?.id) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        console.log(decoded);
        try {
            const refreshTokenKey = `refreshToken:${decoded.id}`;
            const storedRefreshToken = await redis_client_1.default.get(refreshTokenKey);
            if (!storedRefreshToken) {
                throw new common_1.UnauthorizedException('Session expired. Please log in again.');
            }
        }
        catch (redisError) {
            console.error('Redis error:', redisError);
            throw new common_1.UnauthorizedException('Authentication service unavailable');
        }
        if (!decoded.emailId) {
            throw new common_1.UnauthorizedException('Token missing required user data');
        }
        req['user'] = {
            id: decoded.id,
            emailId: decoded.email
        };
        return true;
    }
};
exports.UserAuthGuard = UserAuthGuard;
exports.UserAuthGuard = UserAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], UserAuthGuard);
//# sourceMappingURL=user.middleware.js.map