import { LedgerCommand, LedgerTransportCommandAsync } from './LedgerCommand';
import { IGenesis } from '../../ledger';
import { LedgerUser } from '../../ledger/user';
import { TransformUtil } from '@ts-core/common/util';
import { Matches, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class GenesisGetCommand extends LedgerTransportCommandAsync<void, IGenesis> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = LedgerCommand.GENESIS_GET;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super(GenesisGetCommand.NAME, null, null, true);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(item: IGenesis): IGenesis {
        return TransformUtil.toClass(Genesis, item);
    }
}

export class Genesis implements IGenesis {
    @Matches(LedgerUser.UID_REGXP)
    rootUserUid: string;

    @Type(() => Date)
    @IsDate()
    createdDate: Date;
}
