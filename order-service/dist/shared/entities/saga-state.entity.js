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
exports.SagaState = exports.SagaStatus = void 0;
const typeorm_1 = require("typeorm");
var SagaStatus;
(function (SagaStatus) {
    SagaStatus["STARTED"] = "STARTED";
    SagaStatus["ORDER_CREATED"] = "ORDER_CREATED";
    SagaStatus["PAYMENT_PROCESSING"] = "PAYMENT_PROCESSING";
    SagaStatus["PAYMENT_VERIFIED"] = "PAYMENT_VERIFIED";
    SagaStatus["COMPLETED"] = "COMPLETED";
    SagaStatus["FAILED"] = "FAILED";
    SagaStatus["COMPENSATING"] = "COMPENSATING";
    SagaStatus["COMPENSATED"] = "COMPENSATED";
})(SagaStatus || (exports.SagaStatus = SagaStatus = {}));
let SagaState = class SagaState {
    id;
    saga_id;
    correlation_id;
    status;
    saga_type;
    payload;
    compensation_data;
    error_message;
    retry_count;
    max_retries;
    expires_at;
    razorpay_order_id;
    created_at;
    updated_at;
};
exports.SagaState = SagaState;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SagaState.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], SagaState.prototype, "saga_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], SagaState.prototype, "correlation_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SagaStatus,
        default: SagaStatus.STARTED,
    }),
    __metadata("design:type", String)
], SagaState.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SagaState.prototype, "saga_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SagaState.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SagaState.prototype, "compensation_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SagaState.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SagaState.prototype, "retry_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 3 }),
    __metadata("design:type", Number)
], SagaState.prototype, "max_retries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SagaState.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SagaState.prototype, "razorpay_order_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SagaState.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SagaState.prototype, "updated_at", void 0);
exports.SagaState = SagaState = __decorate([
    (0, typeorm_1.Entity)('saga_state'),
    (0, typeorm_1.Index)(['correlation_id']),
    (0, typeorm_1.Index)(['razorpay_order_id'])
], SagaState);
//# sourceMappingURL=saga-state.entity.js.map