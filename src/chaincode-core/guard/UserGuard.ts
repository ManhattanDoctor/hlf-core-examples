import { LedgerError, LedgerErrorCode } from '@hlf-examples/common/ledger/error';
import * as _ from 'lodash';
import { LedgerUserStatus } from '@hlf-examples/common/ledger/user';
import { IUserStubHolder, DatabaseManager } from './IUserStubHolder';
import { ILogger } from '@ts-core/common/logger';
import { getStubHolder } from '@hlf-core/transport/chaincode/stub';

// --------------------------------------------------------------------------
//
//  Public Methods
//
// --------------------------------------------------------------------------

export const UserGuard = (options?: IUserGuardOptions): any => {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (_.isNil(options)) {
            options = {};
        }
        if (_.isNil(options.isNeedCheck)) {
            options.isNeedCheck = true;
        }
        if (_.isNil(options.isNeedCheckStatus)) {
            options.isNeedCheckStatus = options.isNeedCheck;
        }
        if (_.isNil(options.isNeedCheckStatus)) {
            options.isNeedCheckStatus = options.isNeedCheck;
        }
        if (_.isNil(options.isNeedCheckCryptoKey)) {
            options.isNeedCheckCryptoKey = options.isNeedCheck;
        }

        let originalMethod = descriptor.value;
        descriptor.value = async function(...args): Promise<any> {
            let holder = await getUserStubHolder(this.logger, options, target, args);

            if (options.isNeedCheckStatus) {
                if (holder.user.status !== LedgerUserStatus.ACTIVE) {
                    throw new LedgerError(LedgerErrorCode.FORBIDDEN, `User "${holder.user.uid}" status is not ${LedgerUserStatus.ACTIVE}`);
                }
            }

            if (options.isNeedCheckCryptoKey) {
                let cryptoKey = await holder.database.user.cryptoKeyGet(holder.user);
                if (_.isNil(cryptoKey)) {
                    throw new LedgerError(LedgerErrorCode.FORBIDDEN, `User "${holder.user.uid}" key is not found`);
                }
                if (cryptoKey.value !== holder.stub.userPublicKey) {
                    throw new LedgerError(LedgerErrorCode.FORBIDDEN, `User "${holder.user.uid}" key is mismatch`);
                }
            }

            return originalMethod.apply(this, args);
        };
    };
};

// --------------------------------------------------------------------------
//
//  Private Methods
//
// --------------------------------------------------------------------------

interface IUserGuardOptions {
    isNeedCheck?: boolean;
    isNeedCheckStatus?: boolean;
    isNeedCheckCryptoKey?: boolean;
}

async function getUserStubHolder<U = any>(
    logger: ILogger,
    options: IUserGuardOptions,
    target: any,
    args: Array<any>
): Promise<IUserStubHolder<U>> {
    let holder = getStubHolder(target, args) as IUserStubHolder<U>;
    if (_.isNil(holder) || _.isNil(holder.stub)) {
        throw new LedgerError(LedgerErrorCode.FORBIDDEN, `Unable to get stub, stub is invalid`);
    }

    if (_.isNil(holder.database)) {
        holder.database = new DatabaseManager(logger, holder.stub);

        let originalDestroy = holder.destroy;
        holder.destroy = (): void => {
            originalDestroy.call(holder);
            holder.database.destroy();
        };
    }

    if (_.isNil(holder.eventData)) {
        holder.eventData = { transactionHash: holder.stub.transactionHash };
    }

    if (options.isNeedCheck && _.isNil(holder.user)) {
        holder.user = await holder.database.user.get(holder.stub.userId);
        if (_.isNil(holder.user)) {
            throw new LedgerError(LedgerErrorCode.FORBIDDEN, `Unable to find user "${holder.stub.userId}"`);
        }
    }

    return holder;
}
