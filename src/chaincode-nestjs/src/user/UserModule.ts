import { Module } from '@nestjs/common';
import {
    UserService,
    UserGetHandler,
    UserAddHandler,
    UserEditHandler,
    UserListHandler,
    UserRemoveHandler,
    UserCryptoKeyChangeHandler
} from '@hlf-examples/chaincode-core/module/user';
import { Logger, ILogger } from '@ts-core/common/logger';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';

@Module({
    providers: [
        {
            provide: UserService,
            inject: [Logger],
            useFactory: (logger: ILogger) => new UserService(logger)
        },
        {
            provide: UserGetHandler,
            inject: [Logger, TransportFabricChaincodeReceiver],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver) => new UserGetHandler(logger, transport)
        },
        {
            provide: UserAddHandler,
            inject: [Logger, TransportFabricChaincodeReceiver, UserService],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver, user: UserService) =>
                new UserAddHandler(logger, transport, user)
        },
        {
            provide: UserListHandler,
            inject: [Logger, TransportFabricChaincodeReceiver],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver) => new UserListHandler(logger, transport)
        },
        {
            provide: UserEditHandler,
            inject: [Logger, TransportFabricChaincodeReceiver],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver) => new UserEditHandler(logger, transport)
        },
        {
            provide: UserRemoveHandler,
            inject: [Logger, TransportFabricChaincodeReceiver],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver) => new UserRemoveHandler(logger, transport)
        },
        {
            provide: UserCryptoKeyChangeHandler,
            inject: [Logger, TransportFabricChaincodeReceiver],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver) => new UserCryptoKeyChangeHandler(logger, transport)
        }
    ],
    exports: [UserService]
})
export class UserModule {}
