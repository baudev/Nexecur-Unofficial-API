var fs = require('fs')

export class NexecurConfiguration {

    public static baseURL: string = "https://monnexecur-prd.nexecur.fr"
    public static configURI: string = "/webservices/configuration"
    public static saltURI: string = "/webservices/salt"
    public static siteURI: string = "/webservices/site"
    public static registerURI: string = "/webservices/register"
    public static panelStatusURI : string = "/webservices/panel-status"

    private static fileName = './config.json'


    /**
     * Update the token in the config.json file
     * @param {string} token
     */
    public static updateToken(token: string){
        let file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.token = token;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content))
    }

    /**
     * Update the id_device in config.json file
     * @param {string} idDevice
     */
    public static updateIdDevice(idDevice: string){
        let file_content = fs.readFileSync(NexecurConfiguration.fileName);
        var content = JSON.parse(file_content);
        content.id_device = idDevice;
        fs.writeFileSync(NexecurConfiguration.fileName, JSON.stringify(content))
    }


}