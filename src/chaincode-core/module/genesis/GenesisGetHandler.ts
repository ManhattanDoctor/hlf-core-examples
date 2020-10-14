import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { IGenesis } from '@hlf-examples/common/ledger';
import { GenesisGetCommand } from '@hlf-examples/common/transport/command/GenesisGetCommand';
import { GenesisService } from './GenesisService';
import { TransportCommandFabricAsyncHandler } from '@hlf-core/transport/chaincode/handler';
import { TransportFabricChaincodeReceiver } from '@hlf-core/transport/chaincode';
import { StubHolder, ITransportFabricStubHolder } from '@hlf-core/transport/chaincode/stub';

export class GenesisGetHandler extends TransportCommandFabricAsyncHandler<void, IGenesis, GenesisGetCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: TransportFabricChaincodeReceiver, protected service: GenesisService) {
        super(logger, transport, GenesisGetCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: void, @StubHolder() holder: ITransportFabricStubHolder): Promise<IGenesis> {
        return this.service.get(holder.stub.stub);
    }
}
