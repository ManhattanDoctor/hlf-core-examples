import { ApplicationBaseSettings } from '@hlf-examples/chaincode-core/settings';

export class AppSettings extends ApplicationBaseSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Fabric Properties
    //
    // --------------------------------------------------------------------------

    public get rootCompanyName(): string {
        return this.getValue('ROOT_COMPANY_NAME');
    }

    public get rootCompanyDescription(): string {
        return this.getValue('ROOT_COMPANY_DESCRIPTION');
    }
}
