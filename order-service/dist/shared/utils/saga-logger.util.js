"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaLogger = void 0;
const common_1 = require("@nestjs/common");
class SagaLogger {
    static instance;
    logger = new common_1.Logger('Saga');
    static getInstance() {
        if (!SagaLogger.instance) {
            SagaLogger.instance = new SagaLogger();
        }
        return SagaLogger.instance;
    }
    logSagaStart(sagaId, type, payload) {
        this.logger.log(`🎬 SAGA_STARTED: ${sagaId} [${type}]`, {
            sagaId,
            type,
            payload,
            timestamp: new Date().toISOString(),
        });
    }
    logSagaStep(sagaId, step, status, data) {
        const emoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : '🔄';
        this.logger.log(`${emoji} SAGA_STEP: ${sagaId} [${step}] - ${status}`, {
            sagaId,
            step,
            status,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    logSagaComplete(sagaId, finalStatus, duration) {
        const emoji = finalStatus === 'completed' ? '🎉' : '💀';
        this.logger.log(`${emoji} SAGA_COMPLETE: ${sagaId} - ${finalStatus}`, {
            sagaId,
            finalStatus,
            duration,
            timestamp: new Date().toISOString(),
        });
    }
    logSagaCompensation(sagaId, step, reason) {
        this.logger.warn(`🔄 SAGA_COMPENSATION: ${sagaId} [${step}] - ${reason}`, {
            sagaId,
            step,
            reason,
            timestamp: new Date().toISOString(),
        });
    }
    logSagaError(sagaId, error, context) {
        this.logger.error(`💥 SAGA_ERROR: ${sagaId} - ${error.message}`, error.stack, {
            sagaId,
            error: error.message,
            context,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.SagaLogger = SagaLogger;
//# sourceMappingURL=saga-logger.util.js.map