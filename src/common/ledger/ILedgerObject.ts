import { LedgerUser } from './user';
import { UID, IUIDable, getUid } from '@ts-core/common/dto';

export interface ILedgerObject extends IUIDable {}

export function IsUser(uid: UID): boolean {
    return LedgerUser.UID_REGXP.test(getUid(uid));
}