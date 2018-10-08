var fs = require('fs')

export class NexecurConfiguration {

    public static baseURL: string = "https://monnexecur-prd.nexecur.fr"
    public static configURI: string = "/webservices/configuration"
    public static saltURI: string = "/webservices/salt"
    public static siteURI: string = "/webservices/site"
    public static registerURI: string = "/webservices/register"
    public static panelStatusURI : string = "/webservices/panel-status"


    /**
     * Update the token in the config.json file
     * @param {string} token
     */
    public static updateToken(token: string){
        var fileName = './config.json'
        var file_content = fs.readFileSync(fileName);
        var content = JSON.parse(file_content);
        content.token = token;
        fs.writeFileSync(fileName, JSON.stringify(content))
    }

    /**
     * Update the id_device in config.json file
     * @param {string} idDevice
     */
    public static updateIdDevice(idDevice: string){
        var fileName = './config.json'
        var file_content = fs.readFileSync(fileName);
        var content = JSON.parse(file_content);
        content.id_device = idDevice;
        fs.writeFileSync(fileName, JSON.stringify(content))
    }


}