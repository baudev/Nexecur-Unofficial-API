import {NexecurConfiguration} from "../Models/NexecurConfiguration";
import {UserConfiguration} from "../Models/UserConfiguration";
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
            // TODO handle error
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
            // TODO handle error
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
            // TODO handle error
            callback(body)
        })
    }

    static async site(callback: (response: string) => void) {
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
            // TODO handle error
            callback(body)
        })
    }

    static async panelStatus(callback: (response: string) => void) {
        var requestOptions = {
            url: NexecurConfiguration.baseURL + NexecurConfiguration.panelStatusURI,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Auth-Token': userConfig.token
            }
        }
        request.post(requestOptions, function(err,httpResponse,body){
            // TODO handle error
            callback(body)
        })
    }

}
