"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
    });
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: false,
    });
    app.setGlobalPrefix('api');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const kafkaClient = app.get('KAFKA_SERVICE');
    await kafkaClient.connect()
        .then(() => {
        console.log('✅ Kafka connected successfully!');
    })
        .catch((error) => {
        console.error('❌ Kafka connection failed:', error);
    });
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            host: 'localhost',
            port: 4004,
        },
    });
    await app.startAllMicroservices();
    const PORT = 2004;
    await app.listen(PORT);
    console.log(`🚀 Payment Service is running on http://localhost:${PORT}`);
    console.log('✅ TCP microservice running on port 4004');
}
bootstrap();
//# sourceMappingURL=main.js.map