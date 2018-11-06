import { UserConfiguration } from "../Models/UserConfiguration";
import { Requests } from "./Requests";
import { NexecurConfiguration } from "../Models/NexecurConfiguration";
import { AlarmStatus } from "../Models/AlarmStatus";
import { SaltGenerationError } from "../Models/Errors/SaltGenerationError";
import { TokenGenerationError } from "../Models/Errors/TokenGenerationError";
import { RegisteringDeviceError } from "../Models/Errors/RegisteringDeviceError";
import { OrderAlarmError } from "../Models/Errors/OrderAlarmError";
import { UndefinedAPIError } from "../Models/Errors/UndefinedAPIError";
import { EncryptionKeys } from "../Helpers/EncryptionKeys";
let userConfig: UserConfiguration = require('./../config.json')

export class NexecurAPI {

    /**
     * Check if we need creating a new device to control the alarm
     * @param {(response: string) => void} callback
     */
    private static checkIfNeedCreateDevice(callback: (response: string) => void) {
        //check if token is null
        if (userConfig.token == "") {
            // we must register a new device
            this.createDevice(userConfig.deviceName, callback);
        } else {
            callback("already registered")
        }
    }

    /**
     * Register a new device to control the alarm
     * @param {string} name
     * @param {(response: string) => void} callback
     */
    private static createDevice(name: string, callback: (response: string) => void) {
        // we get the salt
        Requests.getSalt((response: string) => {
            if (response["message"] != "OK" || response["status"] != 0) {
                throw new SaltGenerationError("Error while generating a new device. The script can't get a new salt.")
            }
            // we generate passwordHash and pinHash
            let keys: EncryptionKeys = new EncryptionKeys(userConfig.password, response["salt"]);
            keys.generateKeys();
            // we save the generated keys
            NexecurConfiguration.updatePassword(keys.passwordHash, userConfig);
            NexecurConfiguration.updatePinHash(keys.pinHash, userConfig);
            // we get a token
            Requests.site(userConfig, (response) => {
                // we check if an error occurred
                if (response["message"] != "OK" || response["status"] != 0) {
                    throw new TokenGenerationError("Error while getting a token for a new device.");
                }
                // we register associated to the token a device
                Requests.register(name, (response) => {
                    if (response["message"] != "" || response["status"] != 0) {
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
     * @return Promise{}
     */
    public static enableAlarm(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.checkIfNeedCreateDevice((response) => {
                Requests.panelStatus((response => {
                    // we check if an error occurred
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new OrderAlarmError("Error while activating alarm..."));
                    }
                    // if there is any error, we check if the activation was instantaneous
                    if (response["pending"] == 0) {
                        // the alarm is now activated
                        resolve();
                    } else {
                        // the alarm is still not activated
                        new Promise((r, j) => {
                            Requests.panelCheckStatus(r, j);
                        }).then((result) => {
                            resolve();
                        })
                    }
                }), 1)
            })
        });
    }

    /**
     * Disable the alarm system
     * @return Promise{}
     */
    public static disableAlarm(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.checkIfNeedCreateDevice((response) => {
                Requests.panelStatus((response => {
                    // we check if an error occurred
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new OrderAlarmError("Error while disabling alarm..."));
                    }
                    // if there is any error, we check if the activation was instantaneous
                    if (response["pending"] == 0) {
                        // the alarm is now activated
                        resolve();
                    } else {
                        // the alarm is still not activated
                        new Promise((r, j) => {
                            Requests.panelCheckStatus(r, j);
                        }).then((result) => {
                            resolve();
                        })
                    }
                }), 0)
            })
        });
    }

    /**
     * Return the current status of the Alarm
     * @return Promise<AlarmStatus>
     */
    public static getAlarmStatus(): Promise<AlarmStatus> {
        return new Promise((resolve, reject) => {
            this.checkIfNeedCreateDevice((response) => {
                // we get the status of the alarm
                Requests.site(userConfig, (response) => {
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new UndefinedAPIError("Error while getting alarm status."));
                    }
                    let result: AlarmStatus = response["panel_status"];
                    resolve(result);
                })
            })
        });
    }

    /**
     * Return the historic of the alarm usages
     * @return Promise<any>
     */
    public static getHistoric(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.checkIfNeedCreateDevice((response) => {
                // we get the status of the alarm
                Requests.site(userConfig, (response) => {
                    if (response["message"] != "OK" || response["status"] != 0) {
                        reject(new UndefinedAPIError("Error while getting alarm status."));
                    }
                    resolve(response["evenements"]);
                })
            })
        });
    }

}