import { Global, DynamicModule, Provider } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { TransportCryptoManagerEd25519 } from '@ts-core/common/transport/crypto';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { GenesisGetCommand, LedgerCommand } from '@hlf-examples/common/transport/command';
import { LedgerCommandFactory } from '../../common/transport/command';
import { UserGetCommand, UserListCommand } from '@hlf-examples/common/transport/command/user';

@Global()
export class TransportFabricChaincodeModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(): DynamicModule {
        let providers: Array<Provider> = [];
        providers.push({
            provide: TransportFabricChaincodeReceiver,
            inject: [Logger],
            useFactory: async (logger: Logger) => {
                let item = new TransportFabricChaincodeReceiver(logger, {
                    cryptoManagers: [new TransportCryptoManagerEd25519()],
                    commandFactory: payload => LedgerCommandFactory.create(payload.name as LedgerCommand, payload.request),
                    nonSignedCommands: [GenesisGetCommand.NAME, UserGetCommand.NAME, UserListCommand.NAME]
                });
                return item;
            }
        });

        return {
            module: TransportFabricChaincodeModule,
            imports: [],
            providers,
            exports: providers
        };
    }
}
