import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { PaginableBookmark } from '@ts-core/common/dto';
import { UserListCommand, IUserListDto, IUserListDtoResponse } from '@hlf-examples/common/transport/command/user';
import { TransformUtil } from '@ts-core/common/util';
import { UserGuard, IUserStubHolder } from '../../guard';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { TransportCommandFabricAsyncHandler } from '@hlf-core/transport/chaincode/handler';
import { StubHolder } from '@hlf-core/transport/chaincode/stub';

export class UserListHandler extends TransportCommandFabricAsyncHandler<IUserListDto, IUserListDtoResponse, UserListCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincodeReceiver) {
        super(logger, transport, UserListCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    @UserGuard()
    protected async execute(params: IUserListDto, @StubHolder() holder: IUserStubHolder): Promise<IUserListDtoResponse> {
        return holder.database.user.findPaginated(params);
    }

    protected checkResponse(response: IUserListDtoResponse): IUserListDtoResponse {
        response.items = TransformUtil.fromClassMany(response.items);
        return response;
    }

    protected checkRequest(params: IUserListDto): IUserListDto {
        return PaginableBookmark.transform(params);
    }
}
