import {UserConfiguration} from "../Models/UserConfiguration";
import {Requests} from "./Requests";
import {NexecurConfiguration} from "../Models/NexecurConfiguration";
import {AlarmStatus} from "../Models/AlarmStatus";
let userConfig : UserConfiguration = require('../config.json')

export class Core {

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
                NexecurConfiguration.updateToken(response.token);
                // we register associated to the token a device
                Requests.register(name, (response) => {
                    NexecurConfiguration.updateIdDevice(response.id_device);
                    // TODO handle error
                    callback("success")
                })
            })
        })
    }

    public static enableAlarm(callback: (response: string) => void){
        this.checkIfNeedCreateDevice((response) => {

        })
    }

    public static disableAlarm(callback: (response: string) => void){
        this.checkIfNeedCreateDevice((response) => {

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
                    let result: AlarmStatus = response.status
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
                callback(response.evenements)
            })
        })

    }

}