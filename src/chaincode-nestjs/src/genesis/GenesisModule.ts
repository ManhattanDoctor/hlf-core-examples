import { Module } from '@nestjs/common';
import { GenesisService, GenesisGetHandler } from '@hlf-examples/chaincode-core/module/genesis';
import { UserModule } from '../user/UserModule';
import { UserService } from '@hlf-examples/chaincode-core/module/user';
import { Logger, ILogger } from '@ts-core/common/logger';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';

@Module({
    imports: [UserModule],
    providers: [
        {
            provide: GenesisService,
            inject: [Logger, TransportFabricChaincodeReceiver, UserService],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver, user: UserService) =>
                new GenesisService(logger, transport, user)
        },
        {
            provide: GenesisGetHandler,
            inject: [Logger, TransportFabricChaincodeReceiver, GenesisService],
            useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver, genesis: GenesisService) =>
                new GenesisGetHandler(logger, transport, genesis)
        }
    ],
    exports: [GenesisService]
})
export class GenesisModule {}
