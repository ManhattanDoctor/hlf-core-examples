import 'reflect-metadata';
import { AppSettings } from './AppSettings';
import { Logger } from './Logger';
import { Chaincode } from '@hlf-examples/chaincode-core';
import * as shim from 'fabric-shim';
import {
    UserService,
    UserGetHandler,
    UserAddHandler,
    UserListHandler,
    UserEditHandler,
    UserRemoveHandler,
    UserCryptoKeyChangeHandler
} from '@hlf-examples/chaincode-core/module/user';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { TransportCryptoManagerEd25519 } from '@ts-core/common/transport/crypto';
import { GenesisGetCommand } from '@hlf-examples/common/transport/command';
import { GenesisService, GenesisGetHandler } from '@hlf-examples/chaincode-core/module/genesis';

async function bootstrap(): Promise<void> {
    let settings = new AppSettings();
    let logger = (settings.logger = new Logger(settings.loggerLevel));

    let transport = new TransportFabricChaincodeReceiver(logger, {
        cryptoManagers: [new TransportCryptoManagerEd25519()],
        nonSignedCommands: [GenesisGetCommand.NAME]
    });

    let user = new UserService(logger);
    new UserGetHandler(logger, transport);
    new UserAddHandler(logger, transport, user);
    new UserListHandler(logger, transport);
    new UserEditHandler(logger, transport);
    new UserRemoveHandler(logger, transport);
    new UserCryptoKeyChangeHandler(logger, transport);

    let genesis = new GenesisService(logger, transport, user);
    new GenesisGetHandler(logger, transport, genesis);

    shim.start(new Chaincode(logger, transport, genesis));
}

bootstrap();
