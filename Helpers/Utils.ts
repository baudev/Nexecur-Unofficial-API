export class Utils {

    public static async sleep(millis) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () { resolve(); }, millis);
        });
    }

}