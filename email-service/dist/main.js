"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const kafkajs_1 = require("kafkajs");
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
            },
            consumer: {
                groupId: process.env.KAFKA_GROUP_ID || 'email-service-group',
            },
            producer: {
                createPartitioner: kafkajs_1.Partitioners.LegacyPartitioner,
            },
        },
    });
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            host: 'localhost',
            port: 6005,
        },
    });
    await app.startAllMicroservices();
    const kafkaClient = app.get('KAFKA_SERVICE');
    await kafkaClient.connect()
        .then(() => {
        console.log('✅ Kafka connected successfully!');
    })
        .catch((error) => {
        console.error('❌ Kafka connection failed:', error);
    });
    const PORT = 5005;
    await app.listen(PORT);
    console.log(`🚀 Order Service is running at http://localhost:${PORT}`);
    console.log('✅ TCP Microservice is running on port 6005');
}
bootstrap();
//# sourceMappingURL=main.js.map