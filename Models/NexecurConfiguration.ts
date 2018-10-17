import {UserConfiguration} from "./UserConfiguration";

var fs = require('fs')

export class NexecurConfiguration {

    public static baseURL: string = "https://monnexecur-prd.nexecur.fr"
    public static configURI: string = "/webservices/configuration"
    public static saltURI: string = "/webservices/salt"
    public static siteURI: string = "/webservices/site"
    public static registerURI: string = "/webservices/register"
    public static panelStatusURI : string = "/webservices/panel-status"
    public static panelCheckStatusURI : string = "/webservices/check-panel-status"

    private static fileName = __dirname + "/../config.json";

    /**
     * When we send the order to activate the alarm, the order can take times before being applied.
     * The following variable define how many seconds we are ready to wait for before triggering an error.
     * @type {number}
     */
    public static NUMBER_SECONDS_MAX_WAIT_ACTIVATION_ALARM = 60;

    /**
     * Update the token in the config.json file
     * @param {string} token
     * @param userConfig
     */
    public static updateToken(token: string, userConfig: UserConfiguration){
        let file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.token = token;
        userConfig.token = token;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content))
    }

    /**
     * Update the pin in the config.json file
     * @param {string} pin
     * @param userConfig
     */
    public static updatePinHash(pin: string, userConfig: UserConfiguration){
        let file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.pin = pin;
        userConfig.pin = pin;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content))
    }

    /**
     * Update the password in the config.json
     * @param {string} password
     * @param userConfig
     */
    public static updatePassword(password: string, userConfig: UserConfiguration){
        let file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.password = password;
        userConfig.password = password;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content))
    }

    /**
     * Update the id_device in config.json file
     * @param {string} idDevice
     * @param userConfig
     */
    public static updateIdDevice(idDevice: string, userConfig: UserConfiguration){
        let file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.id_device = idDevice;
        userConfig.id_device = idDevice;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content))
    }


}