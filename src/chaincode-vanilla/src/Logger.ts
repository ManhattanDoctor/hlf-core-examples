import { LoggerLevel, LoggerWrapper } from '@ts-core/common/logger';

export class Logger extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(level: LoggerLevel, context?: any) {
        super(console, context, level);
        console['verbose'] = console.log;
    }
}
