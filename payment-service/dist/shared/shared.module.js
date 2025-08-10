"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const microservices_1 = require("@nestjs/microservices");
const schedule_1 = require("@nestjs/schedule");
const kafkajs_1 = require("kafkajs");
const saga_state_entity_1 = require("./entities/saga-state.entity");
const saga_orchestrator_service_1 = require("./services/saga-orchestrator.service");
const saga_monitor_service_1 = require("./services/saga-monitor.service");
const saga_health_controller_1 = require("./controllers/saga-health.controller");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([saga_state_entity_1.SagaState]),
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
                        },
                        producer: {
                            createPartitioner: kafkajs_1.Partitioners.LegacyPartitioner,
                        },
                    },
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [saga_health_controller_1.SagaHealthController],
        providers: [saga_orchestrator_service_1.SagaOrchestratorService, saga_monitor_service_1.SagaMonitorService],
        exports: [saga_orchestrator_service_1.SagaOrchestratorService, saga_monitor_service_1.SagaMonitorService],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map