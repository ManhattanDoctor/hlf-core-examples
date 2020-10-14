import { LedgerCommand } from './LedgerCommand';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ITransportCommand } from '@ts-core/common/transport';
import { UserAddCommand, UserCryptoKeyChangeCommand, UserEditCommand, UserGetCommand, UserListCommand } from './user';
import { GenesisGetCommand } from './GenesisGetCommand';
import { UnreachableStatementError } from '@ts-core/common/error';

export class LedgerCommandFactory {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<U = any>(name: LedgerCommand, request: U): ITransportCommand<U> {
        let Type: ClassType<ITransportCommand<any>> = null;
        switch (name) {
            case LedgerCommand.USER_GET:
                Type = UserGetCommand;
                break;
            case LedgerCommand.USER_ADD:
                Type = UserAddCommand;
                break;
            case LedgerCommand.USER_LIST:
                Type = UserListCommand;
                break;
            case LedgerCommand.USER_EDIT:
                Type = UserEditCommand;
                break;
            case LedgerCommand.USER_REMOVE:
                Type = UserEditCommand;
                break;
            case LedgerCommand.USER_CRYPTO_KEY_CHANGE:
                Type = UserCryptoKeyChangeCommand;
                break;

            case LedgerCommand.GENESIS_GET:
                Type = GenesisGetCommand;
                break;

            default:
                throw new UnreachableStatementError(name);
        }
        return new Type(request);
    }
}
