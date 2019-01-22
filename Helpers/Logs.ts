let logs = require('simple-node-logger');

export class Logs {

    private static opts = {
        errorEventName:'error',
        logDirectory:__dirname + '/../logs', // NOTE: folder must exist and be writable...
        fileNamePattern:'roll-<DATE>.instance',
        dateFormat:'YYYY.MM.DD'
    };

    constructor(){
        Logs.instance.setLevel('debug');
    }

    private static _instance = logs.createRollingFileLogger( Logs.opts );


    static get instance(): any {
        return this._instance;
    }

    static set instance(value: any) {
        this._instance = value;
    }
}
