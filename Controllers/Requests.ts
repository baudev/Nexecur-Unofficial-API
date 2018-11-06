import {NexecurConfiguration} from "../Models/NexecurConfiguration";
import {UserConfiguration} from "../Models/UserConfiguration";
import {Utils} from "../Helpers/Utils";
import {StillPendingError} from "../Models/Errors/StillPendingError";
let request = require('request');
let userConfig : UserConfiguration = require('../config.json')

export class Requests {


    static async getConfiguration(callback: (response: string) => void) {
        var requestOptions = {
            url: NexecurConfiguration.baseURL + NexecurConfiguration.configURI,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': ''
            },
            json: {
                os :'android'
            }
        }
        request.post(requestOptions, function(err,httpResponse,body){
            if(err) throw new Error(err)
            callback(body)
        })
    }

    static async getSalt(callback: (response: string) => void) {
        var requestOptions = {
            url: NexecurConfiguration.baseURL + NexecurConfiguration.saltURI,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': ''
            },
            json: {
                id_site : userConfig.id_site,
                password: userConfig.password,
                id_device: userConfig.id_device,
                'partage': '1',
                pin: userConfig.pin
            }
        }
        request.post(requestOptions, function(err,httpResponse,body){
            if(err) throw new Error(err)
            callback(body)
        })
    }

    static async register(deviceName: string, callback: (response: string) => void) {
        var requestOptions = {
            url: NexecurConfiguration.baseURL + NexecurConfiguration.registerURI,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': userConfig.token
            },
            json: {
                "alert":"enabled",
                "appname":"Mon+Nexecur",
                "nom":"",
                "badge":"enabled",
                "options":[1],
                "sound":"enabled",
                "id_device":userConfig.id_device,
                "actif":1,
                "plateforme":"gcm",
                "app_version":"1.15 (30)",
                "device_model":"SM-G315F",
                "device_name":deviceName,
                "device_version":"7.0"
            }
        }
        request.post(requestOptions, function(err,httpResponse,body){
            if(err) throw new Error(err)
            callback(body)
        })
    }

    static async site(userConfig: UserConfiguration, callback: (response: string) => void) {
        var requestOptions = {
            url: NexecurConfiguration.baseURL + NexecurConfiguration.siteURI,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': userConfig.token
            },
            json: {
                id_site : userConfig.id_site,
                password: userConfig.password,
                id_device: userConfig.id_device,
                'partage': '1',
                pin: userConfig.pin
            }
        }
        request.post(requestOptions, function(err,httpResponse,body){
            if(err) throw new Error(err)
            // we update the token
            NexecurConfiguration.updateToken(body["token"], userConfig)
            callback(body)
        })
    }

    static async panelStatus(callback: (response: string) => void, alarmOrder: number = -1) {
        var requestOptions = {
            url: NexecurConfiguration.baseURL + NexecurConfiguration.panelStatusURI,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': userConfig.token
            },
            json: {}
        }
        // we ask alarming or disarming the alarm
        if(alarmOrder !== -1){
            console.log("Arming or Disarming Alarm")
            requestOptions.json = {
                "status": alarmOrder
            }
        }
        request.post(requestOptions, function(err,httpResponse,body){
            if(err) throw new Error(err)
            callback(body)
        })
    }

    static async panelCheckStatus(resolve, reject, counter: number = 0) {
        // if the alarm is still not enabled or disabled after 60 seconds, we trigger an error
        if(counter >= NexecurConfiguration.NUMBER_SECONDS_MAX_WAIT_ACTIVATION_ALARM){
            throw new StillPendingError("The order (enabling or disabling the alarm) don't seem to be applied correctly.");
        }
        var requestOptions = {
            url: NexecurConfiguration.baseURL + NexecurConfiguration.panelCheckStatusURI,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': userConfig.token
            }
        }
        request.post(requestOptions, async function (err, httpResponse, body) {
            if (err) throw new Error(err)
            // if the status is 0, it's ok
            if (body["still_pending"] == 0) {
                resolve(body);
            } else {
                // if the status is still not 0, we make the request again
                // we wait 1 second
                await Utils.sleep(2000);
                Requests.panelCheckStatus(resolve, reject, counter+1);
            }
        })
    }
}
