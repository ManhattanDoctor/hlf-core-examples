import { TransportCommandAsync, TransportCommand, ITransportCommand } from '@ts-core/common/transport';
import * as _ from 'lodash';

export enum LedgerCommand {
    USER_GET = 'UserGet',
    USER_ADD = 'UserAdd',
    USER_LIST = 'UserList',
    USER_EDIT = 'UserEdit',
    USER_REMOVE = 'UserRemove',
    USER_CRYPTO_KEY_CHANGE = 'UserCryptoKeyChange',

    GENESIS_GET = 'GenesisGet'
}

export class LedgerTransportCommand<T> extends TransportCommand<T> {
    constructor(name: LedgerCommand, request?: T, id?: string, public isReadonly?: boolean) {
        super(name, request, id);
        this.isReadonly = isReadonly;
    }
}

export class LedgerTransportCommandAsync<U, V> extends TransportCommandAsync<U, V> {
    constructor(name: LedgerCommand, request?: U, id?: string, public isReadonly?: boolean) {
        super(name, request, id);
        this.isReadonly = isReadonly;
    }
}
