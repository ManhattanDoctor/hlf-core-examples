import { NestFactory } from '@nestjs/core';
import { DefaultLogger } from '@ts-core/backend-nestjs/logger';
import { AppModule } from './AppModule';
import { AppSettings } from './AppSettings';
import { Chaincode } from '@hlf-examples/chaincode-core';
import * as shim from 'fabric-shim';

async function bootstrap(): Promise<void> {
    let settings = new AppSettings();
    let logger = (settings.logger = new DefaultLogger(settings.loggerLevel));
    let application = await NestFactory.createApplicationContext(AppModule.forRoot(settings), { logger });
    shim.start(application.get(Chaincode));
}

bootstrap();
