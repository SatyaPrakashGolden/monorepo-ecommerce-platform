"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const dotenv = require("dotenv");
const payment_entity_1 = require("../modules/payment/entities/payment.entity");
const saga_state_entity_1 = require("../shared/entities/saga-state.entity");
dotenv.config();
exports.typeOrmConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'satya',
    password: process.env.DB_PASSWORD || 'Satya@123',
    database: process.env.DB_NAME || 'fashion_store',
    entities: [
        payment_entity_1.Payment, saga_state_entity_1.SagaState
    ],
    synchronize: true,
};
//# sourceMappingURL=database.config.js.map