import { LedgerUser } from '@hlf-examples/common/ledger/user';
import { TransformUtil, ValidateUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { ILogger } from '@ts-core/common/logger';
import { EntityManager } from '@hlf-core/transport/chaincode/database/entity';
import { CryptoKeyManager } from '../cryptoKey';
import { LedgerError, LedgerErrorCode } from '@hlf-examples/common/ledger/error';
import { LedgerCryptoKey } from '@hlf-examples/common/ledger/cryptoKey';
import { IPaginableBookmark, IPaginationBookmark } from '@ts-core/common/dto';
import { LedgerRole } from '@hlf-examples/common/ledger/role';
import { ITransportFabricStub } from '@hlf-core/transport/chaincode/stub';
import { UID, getUid } from '@ts-core/common/dto';

export class UserManager extends EntityManager<LedgerUser> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX_LINK = 'userLink';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private _cryptoKey: CryptoKeyManager;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, stub: ITransportFabricStub) {
        super(logger, stub);
        this._cryptoKey = new CryptoKeyManager(logger, stub);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async loadDetails(item: LedgerUser, details?: Array<keyof LedgerUser>): Promise<void> {
        if (_.isEmpty(details)) {
            return;
        }

        if (_.isNil(item.description) && details.includes('description')) {
            item.description = await this.descriptionGet(item);
        }

        if (_.isNil(item.cryptoKey) && details.includes('cryptoKey')) {
            item.cryptoKey = await this.cryptoKeyGet(item);
        }

        if (_.isNil(item.roles) && details.includes('roles')) {
            item.roles = await this.roleList(item);
        }
    }

    public async remove(item: UID): Promise<void> {
        await this.cryptoKey.remove(this.getCryptoKeyUid(item));

        await this.stub.removeState(this.getDescriptionKey(item));
        await this.stub.removeState(this.getRoleKey(item));
        await super.remove(item);
    }

    public initialize(): void {}

    public destroy(): void {
        super.destroy();
        this._cryptoKey.destroy();
        this._cryptoKey = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async deserialize(item: any, details?: Array<keyof LedgerUser>): Promise<LedgerUser> {
        if (_.isNil(item)) {
            return null;
        }
        let value = TransformUtil.toClass(LedgerUser, item);
        ValidateUtil.validate(value);

        await this.loadDetails(value, details);
        return value;
    }

    protected async serialize(item: LedgerUser): Promise<any> {
        if (!(item instanceof LedgerUser)) {
            throw new LedgerError(LedgerErrorCode.BAD_REQUEST, `Not instance of LedgerUser`, item);
        }

        ValidateUtil.validate(item);

        delete item.roles;
        delete item.cryptoKey;
        delete item.description;
        return TransformUtil.fromClass(item);
    }

    // --------------------------------------------------------------------------
    //
    //  Description Methods
    //
    // --------------------------------------------------------------------------

    public async descriptionGet(user: UID): Promise<string> {
        return this.stub.getStateRaw(this.getDescriptionKey(user));
    }

    public async descriptionSet(user: UID, description: string): Promise<void> {
        if (_.isNil(user) || _.isNil(description)) {
            return;
        }
        await this.stub.putStateRaw(this.getDescriptionKey(user), description);
    }

    protected getDescriptionKey(user: UID): string {
        return `→${this.prefix}~description:${getUid(user)}`;
    }

    // --------------------------------------------------------------------------
    //
    //  CryptoKey Methods
    //
    // --------------------------------------------------------------------------

    public async cryptoKeyGet(user: UID): Promise<LedgerCryptoKey> {
        return this.cryptoKey.get(this.getCryptoKeyUid(user));
    }

    public async cryptoKeySet(user: UID, cryptoKey: LedgerCryptoKey): Promise<void> {
        if (_.isNil(user) || _.isNil(cryptoKey)) {
            return;
        }
        cryptoKey.uid = this.getCryptoKeyUid(user);
        await this.cryptoKey.save(cryptoKey);
    }

    protected getCryptoKeyUid(user: UID): string {
        return `→${this.prefix}~${this.cryptoKey.prefix}:${getUid(user)}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Role Methods
    //
    // --------------------------------------------------------------------------

    public async roleList(user: UID): Promise<Array<LedgerRole>> {
        let items = await this.stub.getStateRaw(this.getRoleKey(user));
        return !_.isNil(items) ? (items.split(',') as Array<LedgerRole>) : [];
    }

    public async roleSet(user: UID, roles: Array<LedgerRole>): Promise<void> {
        await this.stub.putStateRaw(this.getRoleKey(user), !_.isNil(roles) ? roles.join(',') : '');
    }

    protected getRoleKey(user: UID): string {
        return `→${this.prefix}~role:${getUid(user)}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get prefix(): string {
        return LedgerUser.PREFIX;
    }

    public get cryptoKey(): CryptoKeyManager {
        return this._cryptoKey;
    }
}
