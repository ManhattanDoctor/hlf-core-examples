import { DynamicModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { AppSettings } from './AppSettings';
import { LoggerWrapper, ILogger } from '@ts-core/common/logger';
import { Chaincode } from '@hlf-examples/chaincode-core';
import { GenesisModule } from './genesis/GenesisModule';
import { TransportFabricChaincodeModule } from './transport';
import { UserModule } from './user/UserModule';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { GenesisService } from '@hlf-examples/chaincode-core/module/genesis';

export class AppModule extends LoggerWrapper implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [LoggerModule.forRoot(settings), TransportFabricChaincodeModule.forRoot(), GenesisModule, UserModule],
            providers: [
                {
                    provide: AppSettings,
                    useValue: settings
                },
                {
                    provide: Chaincode,
                    inject: [Logger, TransportFabricChaincodeReceiver, GenesisService],
                    useFactory: (logger: ILogger, transport: TransportFabricChaincodeReceiver, genesis: GenesisService) =>
                        new Chaincode(logger, transport, genesis)
                }
            ],
            controllers: []
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(@Inject(Logger) logger: Logger, private settings: AppSettings) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        this.log(`Service started in ${this.settings.mode} mode`);
        this.initialize();
    }

    private async initialize(): Promise<void> {}
}
