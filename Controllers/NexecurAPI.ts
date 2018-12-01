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
     * @throws {SaltGenerationError} Will throw an error if the response body of the salt generation request can't be correctly interpreted
     * @throws {TokenGenerationError} Will throw an error if the response body of the token generation request can't be correctly interpreted
     * @throws {RegisteringDeviceError} Will throw an error if the response of the register request can't be correctly interpreted
     * @throws {UndefinedAPIError} Will throw an error if one request failed
     */
    private static createDevice(name: string, callback: (response: string) => void) {
        // we get the salt
        Requests.getSalt((response: string) => {
            try {
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
                    try {
                        // we check if an error occurred
                        if (response["message"] != "OK" || response["status"] != 0) {
                            throw new TokenGenerationError("Error while getting a token for a new device.");
                        }
                        // we register associated to the token a device
                        Requests.register(name, (response) => {
                            try {
                                if (response["message"] != "" || response["status"] != 0) {
                                    throw new RegisteringDeviceError("Error while registering a new device. The script can't update the id_device value. This error is normally not fatal.")
                                }
                                NexecurConfiguration.updateIdDevice(response["id_device"], userConfig);
                                callback("success")
                            } catch (e) {
                                if (e instanceof RegisteringDeviceError) {
                                    throw e;
                                } else {
                                    throw new UndefinedAPIError("Error while registering device : register POST request throwed error =>   \n" + e.message);
                                }
                            }
                        })
                    } catch (e) {
                        if (e instanceof TokenGenerationError) {
                            throw e;
                        } else if (e instanceof RegisteringDeviceError) {
                            throw e;
                        } else if (e instanceof UndefinedAPIError) {
                            throw e;
                        } else {
                            throw new UndefinedAPIError("Error while getting token : site POST request throwed error =>   \n" + e.message);
                        }
                    }
                })
            } catch (e) {
                if (e instanceof SaltGenerationError) {
                    throw e;
                } else if (e instanceof TokenGenerationError) {
                    throw e;
                } else if (e instanceof RegisteringDeviceError) {
                    throw e;
                } else if (e instanceof UndefinedAPIError) {
                    throw e;
                } else {
                    throw new UndefinedAPIError("Error while getting salt : getSalt POST request throwed error =>   \n" + e.message);
                }
            }
        })
    }

    /**
     * Enable the alarm system
     * @param {(response: string) => void} callback
     * @throws {UndefinedAPIError} Will throw an error if the request failed or the response can't be correctly interpreted
     */
    public static enableAlarm(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.checkIfNeedCreateDevice((response) => {
                try {
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
                } catch (e) {
                    if (e instanceof OrderAlarmError) {
                        //response body is not well structured
                        throw new UndefinedAPIError("Error while enabling alarm : OrderAlarmError\n" + e.message);
                    } else {
                        throw new UndefinedAPIError("Error while enabling alarm : panelStatus POST request throwed error =>   \n" + e.message);
                    }
                }
            })
        });
    }

    /**
     * Disable the alarm system
     * @param {(response: string) => void} callback
     * @throws {UndefinedAPIError} Will throw an error if the request failed or the response can't be correctly interpreted
     */
    public static disableAlarm(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.checkIfNeedCreateDevice((response) => {
                try {
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
                } catch (e) {
                    if (e instanceof OrderAlarmError) {
                        //response body is not well structured
                        throw new UndefinedAPIError("Error while disabling alarm : OrderAlarmError\n" + e.message);
                    } else {
                        throw new UndefinedAPIError("Error while disabling alarm : panelStatus POST request throwed error =>   \n" + e.message);
                    }
                }
            })
        });
    }

    /**
     * Return the current status of the Alarm
     * @param {(response: string) => void} callback
     * @throws {UndefinedAPIError} Will throw an error if the request failed or the response can't be correctly interpreted
     */
    public static getAlarmStatus(): Promise<AlarmStatus> {
        return new Promise((resolve, reject) => {
            this.checkIfNeedCreateDevice((response) => {
                try {
                    // we get the status of the alarm
                    Requests.site(userConfig, (response) => {
                        if (response["message"] != "OK" || response["status"] != 0) {
                            reject(new UndefinedAPIError("Error while getting alarm status."));
                        }
                        let result: AlarmStatus = response["panel_status"];
                        resolve(result);
                    })
                } catch (e) {
                    if (e instanceof UndefinedAPIError) {
                        //response body is not well structured
                        throw e;
                    } else {
                        throw new UndefinedAPIError("Error while getting alarm status : site POST request throwed error =>   \n" + e.message);
                    }
                }
            })
        });
    }

    /**
     * Return the historic of the alarm usages
     * @param {(response: string) => void} callback
     * @throws {UndefinedAPIError} Will throw an error if the request failed or the response can't be correctly interpreted
     */
    public static getHistoric(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.checkIfNeedCreateDevice((response) => {
                    // we get the status of the alarm
                    Requests.site(userConfig, (response) => {
                        if (response["message"] != "OK" || response["status"] != 0) {
                            reject(new UndefinedAPIError("Error while getting alarm status."));
                        }
                        resolve(response["evenements"]);
                    })
                })
            } catch (e) {
                if (e instanceof UndefinedAPIError) {
                    //response body is not well structured
                    throw e;
                } else {
                    throw new UndefinedAPIError("Error while getting alarm status : site POST request throwed error =>   \n" + e.message);
                }
            }
        });
    }

}