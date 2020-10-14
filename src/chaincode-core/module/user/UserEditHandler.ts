import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { UserEditCommand, IUserEditDto } from '@hlf-examples/common/transport/command/user';
import { UserGuard, IUserStubHolder, rolesCheck } from '../../guard';
import { LedgerError, LedgerErrorCode } from '@hlf-examples/common/ledger/error';
import { LedgerRole } from '@hlf-examples/common/ledger/role';
import { UserEditedEvent } from '@hlf-examples/common/transport/event/user';
import { TransportCommandFabricAsyncHandler } from '@hlf-core/transport/chaincode/handler';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { StubHolder } from '@hlf-core/transport/chaincode/stub';

export class UserEditHandler extends TransportCommandFabricAsyncHandler<IUserEditDto, void, UserEditCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincodeReceiver) {
        super(logger, transport, UserEditCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    @UserGuard()
    protected async execute(params: IUserEditDto, @StubHolder() holder: IUserStubHolder): Promise<void> {
        await rolesCheck(holder, LedgerRole.USER_MANAGER);

        let item = await holder.database.user.get(params.uid);
        if (_.isNil(item)) {
            throw new LedgerError(LedgerErrorCode.NOT_FOUND, `Unable to find user ${params.uid}`);
        }

        if (!_.isNil(params.description)) {
            await holder.database.user.descriptionSet(item, params.description);
        }

        if (!_.isNil(params.roles)) {
            await holder.database.user.roleSet(item, params.roles);
        }
        await holder.stub.dispatch(new UserEditedEvent(holder.eventData));
    }
}
