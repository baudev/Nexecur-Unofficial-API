import {UserConfiguration} from "../Models/UserConfiguration";
import {Requests} from "./Requests";
import {NexecurConfiguration} from "../Models/NexecurConfiguration";
import {AlarmStatus} from "../Models/AlarmStatus";
//import * as userConfig from '../Models/UserConfiguration';
let userConfig : UserConfiguration = require('./../config.json')

export class NexecurAPI {

    /**
     * Check if we need creating a new device to control the alarm
     * @param {(response: string) => void} callback
     */
    private static checkIfNeedCreateDevice(callback: (response: string) => void){
        //check if token is null
        if(userConfig.token == ""){
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
    private static createDevice(name: string, callback: (response: string) => void){
        // we get the salt (we don't know currently to what it's for...)
        Requests.getSalt((response: string) => {
            // TODO analyze response
            // we get a token
            Requests.site((response) => {
                // we update token in config.json file
                NexecurConfiguration.updateToken(response["token"]);
                // we register associated to the token a device
                Requests.register(name, (response) => {
                    NexecurConfiguration.updateIdDevice(response["id_device"]);
                    // TODO handle error
                    callback("success")
                })
            })
        })
    }

    /**
     * Enable the alarm system
     * @param {(response: string) => void} callback
     */
    public static enableAlarm(callback: (response: string) => void){
        this.checkIfNeedCreateDevice((response) => {
            Requests.panelStatus((response => {
                // we check if an error occurred
                if(response["message"] != "OK"){
                    throw new Error("Error while activating alarm...");
                }
                // if there is any error, we check if the activation was instantaneous
                if(response["pending"] == 0) {
                    // the alarm is now activated
                    callback("Alarm successfully enabled");
                } else {
                    // the alarm is still not activated
                    new Promise((r, j) => {
                        Requests.panelCheckStatus(r, j);
                    }).then((result) => {
                        callback("Alarm successfully enabled");
                    })
                }
            }), 1)
        })
    }

    /**
     * Disable the alarm system
     * @param {(response: string) => void} callback
     */
    public static disableAlarm(callback: (response: string) => void){
        this.checkIfNeedCreateDevice((response) => {
            Requests.panelStatus((response => {
                // we check if an error occurred
                if(response["message"] != "OK"){
                    throw new Error("Error while disabling alarm...");
                }
                // if there is any error, we check if the activation was instantaneous
                if(response["pending"] == 0) {
                    // the alarm is now activated
                    callback("Alarm successfully disabled");
                } else {
                    // the alarm is still not activated
                    new Promise((r, j) => {
                        Requests.panelCheckStatus(r, j);
                    }).then((result) => {
                        callback("Alarm successfully disabled");
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
        this.checkIfNeedCreateDevice((response) => {
                // we get the status of the alarm
                Requests.site((response) => {
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
        this.checkIfNeedCreateDevice((response) => {
            // we get the status of the alarm
            Requests.site((response) => {
                callback(response["evenements"])
            })
        })

    }

}