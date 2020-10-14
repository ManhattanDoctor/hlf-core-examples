import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { IUserCryptoKeyChangeDto, UserCryptoKeyChangeCommand } from '@hlf-examples/common/transport/command/user';
import { UserCryptoKeyChangedEvent } from '@hlf-examples/common/transport/event/user';
import { UserGuard, IUserStubHolder, rolesCheck } from '../../guard';
import { LedgerError, LedgerErrorCode } from '@hlf-examples/common/ledger/error';
import { LedgerRole } from '@hlf-examples/common/ledger/role';
import { TransportCommandFabricAsyncHandler } from '@hlf-core/transport/chaincode/handler';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { StubHolder } from '@hlf-core/transport/chaincode/stub';

export class UserCryptoKeyChangeHandler extends TransportCommandFabricAsyncHandler<
    IUserCryptoKeyChangeDto,
    void,
    UserCryptoKeyChangeCommand
> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincodeReceiver) {
        super(logger, transport, UserCryptoKeyChangeCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    @UserGuard()
    protected async execute(params: IUserCryptoKeyChangeDto, @StubHolder() holder: IUserStubHolder): Promise<void> {
        // User can edit his own key or someone who has role
        if (params.uid !== holder.user.uid) {
            await rolesCheck(holder, LedgerRole.USER_MANAGER);
        }
        let item = await holder.database.user.cryptoKeyGet(params.uid);
        if (_.isNil(item)) {
            throw new LedgerError(LedgerErrorCode.NOT_FOUND, `Unable to find user ${params.uid}`);
        }

        item.value = params.cryptoKey.value;
        item.algorithm = params.cryptoKey.algorithm;
        await holder.database.user.cryptoKey.save(item);

        await holder.stub.dispatch(new UserCryptoKeyChangedEvent(holder.eventData));
    }
}
