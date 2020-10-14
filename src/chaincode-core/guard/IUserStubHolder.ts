import { LedgerUser } from '@hlf-examples/common/ledger/user';
import { UserManager } from '../database/user';
import { ILogger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { DestroyableContainer } from '@ts-core/common/DestroyableContainer';
import { IDestroyable } from '@ts-core/common/IDestroyable';
import { ILedgerEventDto } from '@hlf-examples/common/transport/event';
import { ITransportCommand } from '@ts-core/common/transport';
import { ITransportFabricStubHolder, ITransportFabricStub } from '@hlf-core/transport/chaincode/stub';

export interface IUserStubHolder<U = any> extends ITransportFabricStubHolder, ITransportCommand<U> {
    user?: LedgerUser;
    database?: IDatabaseManager;
    eventData?: ILedgerEventDto;
}

export interface IDatabaseManager extends IDestroyable {
    user?: UserManager;
}

export class DatabaseManager extends DestroyableContainer implements IDatabaseManager {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _user: UserManager;
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, stub: ITransportFabricStub) {
        super();
        this._user = this.addDestroyable(new UserManager(logger, stub));
        this._user.initialize();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get user(): UserManager {
        return this._user;
    }
}
