import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { IUserStubHolder } from '../../guard';
import { IUserAddDto } from '@hlf-examples/common/transport/command/user';
import { LedgerUser, LedgerUserStatus } from '@hlf-examples/common/ledger/user';
import { ObjectUtil } from '@ts-core/common/util';
import { LedgerCryptoKey } from '@hlf-examples/common/ledger/cryptoKey';
import * as _ from 'lodash';
import { UserAddedEvent } from '@hlf-examples/common/transport/event/user';

export class UserService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async add(holder: IUserStubHolder, params: IUserAddDto, isDefaultRootUser?: boolean): Promise<LedgerUser> {
        let item = !isDefaultRootUser
            ? LedgerUser.create(holder.stub.transactionDate, holder.stub.transactionHash)
            : LedgerUser.createRoot();
        item.status = LedgerUserStatus.ACTIVE;
        await holder.database.user.save(item);

        let cryptoKey = new LedgerCryptoKey();
        ObjectUtil.copyProperties(params.cryptoKey, cryptoKey);
        await holder.database.user.cryptoKeySet(item, cryptoKey);

        if (!_.isNil(params.description)) {
            await holder.database.user.descriptionSet(item, params.description);
        }
        if (!_.isEmpty(params.roles)) {
            await holder.database.user.roleSet(item, params.roles);
        }
        await holder.stub.dispatch(new UserAddedEvent(holder.eventData));
        return item;
    }
}
