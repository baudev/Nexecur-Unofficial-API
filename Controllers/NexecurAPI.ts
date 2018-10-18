import {UserConfiguration} from "../Models/UserConfiguration";
import {Requests} from "./Requests";
import {NexecurConfiguration} from "../Models/NexecurConfiguration";
import {AlarmStatus} from "../Models/AlarmStatus";
import {SaltGenerationError} from "../Models/Errors/SaltGenerationError";
import {TokenGenerationError} from "../Models/Errors/TokenGenerationError";
import {RegisteringDeviceError} from "../Models/Errors/RegisteringDeviceError";
import {OrderAlarmError} from "../Models/Errors/OrderAlarmError";
import {UndefinedAPIError} from "../Models/Errors/UndefinedAPIError";
import {EncryptionKeys} from "../Helpers/EncryptionKeys";
import {Logs} from "../Helpers/Logs";
let userConfig : UserConfiguration = require('./../config.json')

export class NexecurAPI {

    /**
     * Check if we need creating a new device to control the alarm
     * @param {(response: string) => void} callback
     */
    private static checkIfNeedCreateDevice(callback: (response: string) => void){
        //check if token is null
        Logs.instance.info("Checking if a device need to be created");
        if(userConfig.token == ""){
            // we must register a new device
            Logs.instance.info("A device must be created");
            this.createDevice(userConfig.deviceName, callback);
        } else {
            Logs.instance.info("A device is already registered");
            callback("already registered")
        }
    }

    /**
     * Register a new device to control the alarm
     * @param {string} name
     * @param {(response: string) => void} callback
     */
    private static createDevice(name: string, callback: (response: string) => void){
        // we get the salt
        Requests.getSalt((response: string) => {
            Logs.instance.info("Salt obtained");
            Logs.instance.debug(response);
            if(response["message"] != "OK" || response["status"] != 0){
                throw new SaltGenerationError("Error while generating a new device. The script can't get a new salt.")
            }
            Logs.instance.info("Generating keys");
            // we generate passwordHash and pinHash
            let keys: EncryptionKeys = new EncryptionKeys(userConfig.password, response["salt"]);
            keys.generateKeys();
            // we save the generated keys
            NexecurConfiguration.updatePassword(keys.passwordHash, userConfig);
            NexecurConfiguration.updatePinHash(keys.pinHash, userConfig);
            Logs.instance.debug("password hash: "+ keys.passwordHash);
            Logs.instance.debug("pin hash: "+ keys.pinHash);
            // we get a token
            Logs.instance.info("Getting a token");
            Requests.site(userConfig, (response) => {
                Logs.instance.info("Token obtained");
                Logs.instance.debug(response);
                // we check if an error occurred
                if(response["message"] != "OK" || response["status"] != 0){
                    throw new TokenGenerationError("Error while getting a token for a new device.");
                }
                // we register associated to the token a device
                Logs.instance.info("Registering the device");
                Requests.register(name, (response) => {
                    Logs.instance.info("Device registered");
                    Logs.instance.debug(response);
                    if(response["message"] != "" || response["status"] != 0){
                        throw new RegisteringDeviceError("Error while registering a new device. The script can't update the id_device value. This error is normally not fatal.")
                    }
                    NexecurConfiguration.updateIdDevice(response["id_device"], userConfig);
                    callback("success")
                })
            })
        })
    }

    /**
     * Enable the alarm system
     * @param {(response: string) => void} callback
     */
    public static enableAlarm(callback: () => void){
        Logs.instance.info("Enabling alarm");
        this.checkIfNeedCreateDevice((response) => {
            Logs.instance.info("Order sent to enable alarm");
            Logs.instance.debug(response);
            Logs.instance.info("Getting current status of the alarm");
            Requests.panelStatus((response => {
                Logs.instance.info("Status of the alarm obtained");
                Logs.instance.debug(response);
                // we check if an error occurred
                if(response["message"] != "OK" || response["status"] != 0){
                    throw new OrderAlarmError("Error while activating alarm...");
                }
                // if there is any error, we check if the activation was instantaneous
                if(response["pending"] == 0) {
                    Logs.instance.info("Alarm enabled");
                    // the alarm is now activated
                    callback();
                } else {
                    // the alarm is still not activated
                    new Promise((r, j) => {
                        Requests.panelCheckStatus(r, j);
                    }).then((result) => {
                        callback();
                    })
                }
            }), 1)
        })
    }

    /**
     * Disable the alarm system
     * @param {(response: string) => void} callback
     */
    public static disableAlarm(callback: () => void){
        Logs.instance.info("Disarming alarm");
        this.checkIfNeedCreateDevice((response) => {
            Requests.panelStatus((response => {
                Logs.instance.info("Order sent to disable alarm");
                Logs.instance.debug(response);
                // we check if an error occurred
                if(response["message"] != "OK" || response["status"] != 0){
                    throw new OrderAlarmError("Error while disabling alarm...");
                }
                // if there is any error, we check if the activation was instantaneous
                if(response["pending"] == 0) {
                    // the alarm is now activated
                    Logs.instance.info("Alarm disabled");
                    callback();
                } else {
                    // the alarm is still not activated
                    new Promise((r, j) => {
                        Requests.panelCheckStatus(r, j);
                    }).then((result) => {
                        callback();
                    })
                }
            }), 0)
        })
    }

    /**
     * Return the current status of the Alarm
     * @param {(response: string) => void} callback
     */
    public static getAlarmStatus(callback: (response: AlarmStatus) => void){
        Logs.instance.info("Getting alarm status");
        this.checkIfNeedCreateDevice((response) => {
                // we get the status of the alarm
                Requests.site(userConfig,(response) => {
                    Logs.instance.info("Status obtained");
                    Logs.instance.debug(response);
                    if(response["message"] != "OK" || response["status"] != 0){
                        throw new UndefinedAPIError("Error while getting alarm status.");
                    }
                    let result: AlarmStatus = response["panel_status"];
                    callback(result)
                })
            })

    }

    /**
     * Return the historic of the alarm usages
     * @param {(response: string) => void} callback
     */
    public static getHistoric(callback: (response: string) => void){
        Logs.instance.info("Getting historic");
        this.checkIfNeedCreateDevice((response) => {
            // we get the status of the alarm
            Requests.site(userConfig,(response) => {
                Logs.instance.info("Historic obtained");
                Logs.instance.debug(response);
                if(response["message"] != "OK" || response["status"] != 0){
                    throw new UndefinedAPIError("Error while getting alarm status.");
                }
                callback(response["evenements"])
            })
        })

    }

}
