import { TransformUtil } from '@ts-core/common/util';
import { LedgerCommand, LedgerTransportCommandAsync } from '../LedgerCommand';
import { IPaginationBookmark, PaginableBookmark } from '@ts-core/common/dto';
import { ITraceable } from '@ts-core/common/trace';
import { LedgerUser } from '../../../ledger/user';

export class UserListCommand extends LedgerTransportCommandAsync<IUserListDto, IUserListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = LedgerCommand.USER_LIST;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IUserListDto) {
        super(UserListCommand.NAME, request, null, true);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(response: IUserListDtoResponse): IUserListDtoResponse {
        response.items = TransformUtil.toClassMany(LedgerUser, response.items);
        return response;
    }
}

export interface IUserListDto extends PaginableBookmark<LedgerUser>, ITraceable {}
export interface IUserListDtoResponse extends IPaginationBookmark<LedgerUser> {}
