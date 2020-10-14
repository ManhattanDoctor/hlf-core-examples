import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { UserRemoveCommand, IUserRemoveDto } from '@hlf-examples/common/transport/command/user';
import { UserRemovedEvent } from '@hlf-examples/common/transport/event/user';
import { LedgerError, LedgerErrorCode } from '@hlf-examples/common/ledger/error';
import { UserGuard, IUserStubHolder, rolesCheck } from '../../guard';
import { LedgerRole } from '@hlf-examples/common/ledger/role';
import { TransportCommandFabricAsyncHandler } from '@hlf-core/transport/chaincode/handler';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { StubHolder } from '@hlf-core/transport/chaincode/stub';

export class UserRemoveHandler extends TransportCommandFabricAsyncHandler<IUserRemoveDto, void, UserRemoveCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincodeReceiver) {
        super(logger, transport, UserRemoveCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    @UserGuard()
    protected async execute(params: IUserRemoveDto, @StubHolder() holder: IUserStubHolder): Promise<void> {
        await rolesCheck(holder, LedgerRole.USER_MANAGER);

        let item = await holder.database.user.get(params.uid);
        if (_.isNil(item)) {
            throw new LedgerError(LedgerErrorCode.NOT_FOUND, `Unable to find user ${params.uid}`);
        }

        await holder.database.user.remove(params.uid);
        await holder.stub.dispatch(new UserRemovedEvent(holder.eventData));
    }
}
