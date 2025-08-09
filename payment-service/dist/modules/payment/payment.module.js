"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSagaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const microservices_1 = require("@nestjs/microservices");
const payment_controller_1 = require("./payment.controller");
const payment_service_1 = require("./payment.service");
const notification_service_1 = require("../../notification/notification.service");
const payment_saga_orchestrator_service_1 = require("./payment-saga-orchestrator.service");
const saga_event_controller_1 = require("./saga-event.controller");
const payment_entity_1 = require("./entities/payment.entity");
const order_entity_1 = require("./entities/order.entity");
const saga_entity_1 = require("./entities/saga.entity");
const auth_module_1 = require("../../auth/auth.module");
let PaymentSagaModule = class PaymentSagaModule {
};
exports.PaymentSagaModule = PaymentSagaModule;
exports.PaymentSagaModule = PaymentSagaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([saga_entity_1.Saga, saga_entity_1.SagaStep, payment_entity_1.Payment, order_entity_1.Order]),
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'payment-saga-service',
                            brokers: ['localhost:9092'],
                        },
                        consumer: {
                            groupId: 'payment-saga-consumer-group',
                        },
                    },
                },
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [payment_controller_1.PaymentController, saga_event_controller_1.SagaEventController],
        providers: [
            payment_service_1.PaymentService,
            payment_saga_orchestrator_service_1.PaymentSagaOrchestrator,
            notification_service_1.NotificationService,
        ],
        exports: [payment_saga_orchestrator_service_1.PaymentSagaOrchestrator],
    })
], PaymentSagaModule);
//# sourceMappingURL=payment.module.js.map