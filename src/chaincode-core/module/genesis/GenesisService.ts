import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { IGenesis } from '@hlf-examples/common/ledger';
import { DatabaseManager, IUserStubHolder } from '../../guard';
import { ChaincodeStub } from 'fabric-shim';
import { LedgerRole } from '@hlf-examples/common/ledger/role';
import { LedgerUser } from '@hlf-examples/common/ledger/user';
import { TransformUtil } from '@ts-core/common/util';
import { Genesis } from '@hlf-examples/common/transport/command';
import { TransportFabricStub } from '@hlf-core/transport/chaincode/stub';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { TransportCryptoManagerEd25519 } from '@ts-core/common/transport/crypto';
import { UserService } from '../user';

export class GenesisService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    private static KEY = 'GENESIS';

    private static ROOT_USER_CRYPTO_KEY = 'e365007e85508c6b44d5101a1d59d0061a48fd1bcd393186ccb5e7ae938a59a8';
    private static ROOT_USER_DESCRIPTION = 'ROOT_USER';
    private static ROOT_USER_CRYPTO_ALGORITHM = TransportCryptoManagerEd25519.ALGORITHM;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: TransportFabricChaincodeReceiver, private user: UserService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private holderGet(stub: ChaincodeStub): IUserStubHolder {
        let transport = this.stubGet(stub);

        let database = new DatabaseManager(this.logger, transport);
        let destroy = () => database.destroy();

        return {
            id: null,
            name: null,
            stub: transport,
            user: LedgerUser.createRoot(),
            database,
            destroy
        };
    }

    private stubGet(stub: ChaincodeStub): TransportFabricStub {
        return new TransportFabricStub(
            stub,
            null,
            { userId: LedgerUser.createRoot().uid, signature: { nonce: null, value: null, algorithm: null, publicKey: null } },
            this.transport
        );
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async get(stub: ChaincodeStub): Promise<IGenesis> {
        return this.stubGet(stub).getState<IGenesis>(GenesisService.KEY);
    }

    public async add(stub: ChaincodeStub): Promise<IGenesis> {
        let holder = this.holderGet(stub);

        // Add root user
        let user = await this.user.add(
            holder,
            {
                roles: Object.values(LedgerRole),
                description: GenesisService.ROOT_USER_DESCRIPTION,
                cryptoKey: { value: GenesisService.ROOT_USER_CRYPTO_KEY, algorithm: GenesisService.ROOT_USER_CRYPTO_ALGORITHM }
            },
            true
        );
        // Save genesis information
        return holder.stub.putState<IGenesis>(
            GenesisService.KEY,
            TransformUtil.toClass(Genesis, {
                rootUserUid: user.uid,
                createdDate: holder.stub.transactionDate
            }),
            true,
            true
        );
    }
}
