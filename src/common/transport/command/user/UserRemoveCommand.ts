
import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerUser } from '../../../ledger/user';
import { Matches } from 'class-validator';
import { LedgerCommand, LedgerTransportCommandAsync } from '../LedgerCommand';

export class UserRemoveCommand extends LedgerTransportCommandAsync<IUserRemoveDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = LedgerCommand.USER_REMOVE;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IUserRemoveDto) {
        super(UserRemoveCommand.NAME, TransformUtil.toClass(UserRemoveDto, request));
    }
}

export interface IUserRemoveDto extends ITraceable {
    uid: string;
}

class UserRemoveDto implements IUserRemoveDto {
    @Matches(LedgerUser.UID_REGXP)
    uid: string;
}
