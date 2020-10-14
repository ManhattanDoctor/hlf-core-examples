import { ITransportFabricConnectionSettings } from '@hlf-core/transport/client';
import { ILoggerSettings, EnvSettingsStorage } from '@ts-core/backend/settings';
import { ILogger, LoggerLevel } from '@ts-core/common/logger';
import { AbstractSettingsStorage } from '@ts-core/common/settings';

export class AppSettings extends EnvSettingsStorage implements ILoggerSettings, ITransportFabricConnectionSettings {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public logger?: ILogger;

    // --------------------------------------------------------------------------
    //
    //  Logger Properties
    //
    // --------------------------------------------------------------------------

    public get loggerLevel(): LoggerLevel {
        return this.getValue('LOGGER_LEVEL', LoggerLevel.ALL);
    }

    // --------------------------------------------------------------------------
    //
    //  Root User Properties
    //
    // --------------------------------------------------------------------------

    public get rootUserPrivateKey(): string {
        return this.getValue('ROOT_USER_PRIVATE_KEY');
    }

    // --------------------------------------------------------------------------
    //
    //  Public Fabric Properties
    //
    // --------------------------------------------------------------------------

    public get fabricIdentity(): string {
        return this.getValue('FABRIC_IDENTITY');
    }

    public get fabricIdentityMspId(): string {
        return this.getValue('FABRIC_IDENTITY_MSP_ID');
    }

    public get fabricIdentityPrivateKey(): string {
        return AbstractSettingsStorage.parsePEM(this.getValue('FABRIC_IDENTITY_PRIVATE_KEY'));
    }

    public get fabricIdentityCertificate(): string {
        return AbstractSettingsStorage.parsePEM(this.getValue('FABRIC_IDENTITY_CERTIFICATE'));
    }

    public get fabricChaincodeName(): string {
        return this.getValue('FABRIC_CHAINCODE_NAME');
    }

    public get fabricNetworkName(): string {
        return this.getValue('FABRIC_NETWORK_NAME');
    }

    public get fabricConnectionSettingsPath(): string {
        return this.getValue('FABRIC_CONNECTION_SETTINGS_PATH');
    }

    public get fabricIsDiscoveryEnabled(): boolean {
        return AbstractSettingsStorage.parseBoolean(this.getValue('FABRIC_IS_DISCOVERY_ENABLED'));
    }

    public get fabricIsDiscoveryAsLocalhost(): boolean {
        return AbstractSettingsStorage.parseBoolean(this.getValue('FABRIC_IS_DISCOVERY_AS_LOCALHOST'));
    }
}
