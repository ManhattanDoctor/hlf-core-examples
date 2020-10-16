import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { GenesisGetCommand } from '@hlf-examples/common/transport/command';
import { IUserListDto, UserAddCommand, UserGetCommand, UserListCommand } from '@hlf-examples/common/transport/command/user';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { TransportFabricSender } from '@hlf-core/transport/client';
import { AppSettings } from './AppSettings';
import { ILogger } from '@ts-core/common/logger';
import { Ed25519, IKeyAsymmetric, ISignature } from '@ts-core/common/crypto';
import { ITransportCryptoManager, TransportCryptoManagerEd25519 } from '@ts-core/common/transport/crypto';
import { IGenesis } from '@hlf-examples/common/ledger';
import { LedgerUser } from '@hlf-examples/common/ledger/user';
import { LedgerRole } from '@hlf-examples/common/ledger/role';
import { throws } from 'assert';
import { TransportCommand } from '@ts-core/common/transport';

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
                    provide: AppSettings,
                    useValue: settings
                },
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

    public constructor(@Inject(TransportFabricSender) private transport: TransportFabricSender, private settings: AppSettings) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        await this.rootUserGet();
        await this.userAdd();
        await this.userListGet();
    }

    private async rootUserGet(): Promise<void> {
        // Get genesis data
        let genesis: IGenesis = await this.transport.sendListen(new GenesisGetCommand());
        // Get root user
        let rootUser: LedgerUser = await this.transport.sendListen(new UserGetCommand({ uid: genesis.rootUserUid }));
    }

    private async userAdd(): Promise<void> {
        // Root user credentials
        let rootUserKeys: IKeyAsymmetric = Ed25519.from(this.settings.rootUserPrivateKey);

        // New user keys
        let userKeys = Ed25519.keys();

        // Command to add new user
        let command = new UserAddCommand({
            description: 'New user manager',
            roles: [LedgerRole.USER_MANAGER],
            cryptoKey: {
                algorithm: TransportCryptoManagerEd25519.ALGORITHM,
                value: userKeys.publicKey
            }
        });

        // Sign aa user command
        let signature: ISignature = await TransportCommand.sign(command, new TransportCryptoManagerEd25519(), rootUserKeys);

        // Send signed user add command and receive user
        let user: LedgerUser = await this.transport.sendListen(command, { userId: this.settings.rootUserId, signature });
    }

    private async userListGet(): Promise<void> {
        // Get paginated users list
        let users: IUserListDto = await this.transport.sendListen(new UserListCommand({ pageSize: 25 }));
    }
}
