import { Logger } from '@ts-core/common/logger';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { LedgerUser } from '@hlf-examples/common/ledger/user';
import { UserAddCommand, IUserAddDto, UserAddDto } from '@hlf-examples/common/transport/command/user';
import { UserGuard, IUserStubHolder, rolesCheck } from '../../guard';
import { LedgerRole } from '@hlf-examples/common/ledger/role';
import { TransportCommandFabricAsyncHandler } from '@hlf-core/transport/chaincode/handler';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { StubHolder } from '@hlf-core/transport/chaincode/stub';
import { UserService } from './UserService';

export class UserAddHandler extends TransportCommandFabricAsyncHandler<IUserAddDto, LedgerUser, UserAddCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincodeReceiver, private service: UserService) {
        super(logger, transport, UserAddCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    @UserGuard()
    protected async execute(params: IUserAddDto, @StubHolder() holder: IUserStubHolder): Promise<LedgerUser> {
        await rolesCheck(holder, LedgerRole.USER_MANAGER);
        return this.service.add(holder, params);
    }

    protected checkRequest(request: IUserAddDto): IUserAddDto {
        return TransformUtil.toClass(UserAddDto, request);
    }

    protected checkResponse(response: LedgerUser): LedgerUser {
        return TransformUtil.fromClass(response);
    }
}
