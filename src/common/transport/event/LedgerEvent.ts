import { IsString } from 'class-validator';
import { TransformUtil } from '@ts-core/common/util';
import { TransportEvent } from '@ts-core/common/transport';

export enum LedgerEvent {
    USER_ADDED = 'UserAdded',
    USER_EDITED = 'UserEdited',
    USER_REMOVED = 'UserRemoved',
    USER_CRYPTO_KEY_CHANGED = 'UserCryptoKeyChanged',
}

export interface ILedgerEventDto {
    transactionHash: string;
}

export class LedgerEventDto implements ILedgerEventDto {
    @IsString()
    transactionHash: string;
}

export class LedgerEventDefault extends TransportEvent<ILedgerEventDto> {
    constructor(name: string, data: ILedgerEventDto) {
        super(name, TransformUtil.toClass(LedgerEventDto, data));
    }
}
