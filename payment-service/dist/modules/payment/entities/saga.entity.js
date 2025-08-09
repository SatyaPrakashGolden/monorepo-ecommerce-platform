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
exports.SagaStep = exports.Saga = exports.SagaStepType = exports.SagaStepStatus = exports.SagaStatus = void 0;
const typeorm_1 = require("typeorm");
var SagaStatus;
(function (SagaStatus) {
    SagaStatus["PENDING"] = "pending";
    SagaStatus["IN_PROGRESS"] = "in_progress";
    SagaStatus["COMPLETED"] = "completed";
    SagaStatus["COMPENSATING"] = "compensating";
    SagaStatus["COMPENSATED"] = "compensated";
    SagaStatus["FAILED"] = "failed";
})(SagaStatus || (exports.SagaStatus = SagaStatus = {}));
var SagaStepStatus;
(function (SagaStepStatus) {
    SagaStepStatus["PENDING"] = "pending";
    SagaStepStatus["EXECUTING"] = "executing";
    SagaStepStatus["COMPLETED"] = "completed";
    SagaStepStatus["FAILED"] = "failed";
    SagaStepStatus["COMPENSATING"] = "compensating";
    SagaStepStatus["COMPENSATED"] = "compensated";
})(SagaStepStatus || (exports.SagaStepStatus = SagaStepStatus = {}));
var SagaStepType;
(function (SagaStepType) {
    SagaStepType["INVENTORY_RESERVE"] = "inventory_reserve";
    SagaStepType["ORDER_CREATE"] = "order_create";
    SagaStepType["PAYMENT_PROCESS"] = "payment_process";
    SagaStepType["INVENTORY_CONFIRM"] = "inventory_confirm";
    SagaStepType["ORDER_CONFIRM"] = "order_confirm";
    SagaStepType["NOTIFICATION_SEND"] = "notification_send";
})(SagaStepType || (exports.SagaStepType = SagaStepType = {}));
let Saga = class Saga {
    id;
    saga_id;
    status;
    payload;
    context;
    user_id;
    razorpay_order_id;
    payment_id;
    error_message;
    created_at;
    updated_at;
    steps;
};
exports.Saga = Saga;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Saga.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Saga.prototype, "saga_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SagaStatus, default: SagaStatus.PENDING }),
    __metadata("design:type", String)
], Saga.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], Saga.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], Saga.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Saga.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Saga.prototype, "razorpay_order_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Saga.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Saga.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Saga.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Saga.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SagaStep, step => step.saga),
    __metadata("design:type", Array)
], Saga.prototype, "steps", void 0);
exports.Saga = Saga = __decorate([
    (0, typeorm_1.Entity)('sagas')
], Saga);
let SagaStep = class SagaStep {
    id;
    saga_id;
    step_type;
    status;
    step_order;
    input_data;
    output_data;
    compensation_data;
    error_message;
    retry_count;
    max_retries;
    created_at;
    updated_at;
    saga;
};
exports.SagaStep = SagaStep;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SagaStep.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SagaStep.prototype, "saga_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SagaStepType }),
    __metadata("design:type", String)
], SagaStep.prototype, "step_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SagaStepStatus, default: SagaStepStatus.PENDING }),
    __metadata("design:type", String)
], SagaStep.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SagaStep.prototype, "step_order", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], SagaStep.prototype, "input_data", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], SagaStep.prototype, "output_data", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], SagaStep.prototype, "compensation_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SagaStep.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SagaStep.prototype, "retry_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 3 }),
    __metadata("design:type", Number)
], SagaStep.prototype, "max_retries", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SagaStep.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SagaStep.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Saga, saga => saga.steps),
    (0, typeorm_1.JoinColumn)({ name: 'saga_id', referencedColumnName: 'saga_id' }),
    __metadata("design:type", Saga)
], SagaStep.prototype, "saga", void 0);
exports.SagaStep = SagaStep = __decorate([
    (0, typeorm_1.Entity)('saga_steps')
], SagaStep);
//# sourceMappingURL=saga.entity.js.map