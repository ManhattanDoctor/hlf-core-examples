import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { GenesisGetCommand } from '@hlf-examples/common/transport/command';
import { UserGetCommand } from '@hlf-examples/common/transport/command/user';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { TransportFabricSender } from '@hlf-core/transport/client';
import { AppSettings } from './AppSettings';
import { ILogger } from '@ts-core/common/logger';

export class AppModule implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [LoggerModule.forRoot(settings)],
            providers: [
                {
                    provide: TransportFabricSender,
                    inject: [Logger],
                    useFactory: async (logger: ILogger) => {
                        let item = new TransportFabricSender(logger, settings);
                        await item.connect();
                        return item;
                    }
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

    public constructor(@Inject(TransportFabricSender) private transport: TransportFabricSender) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        console.log(
            await this.transport.sendListen(
                new UserGetCommand({ uid: 'user/15778540800000/0000000000000000000000000000000000000000000000000000000000000000' })
            )
        );
    }
}
