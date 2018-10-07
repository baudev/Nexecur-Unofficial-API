class Config {

    private _token: string;
    private _id_site: number;
    private _password: string;
    private _id_device: string;
    private _pin: string;

    constructor(){

    }

    get token(): string {
        return this._token;
    }

    set token(value: string) {
        this._token = value;
    }

    get id_site(): number {
        return this._id_site;
    }

    set id_site(value: number) {
        this._id_site = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get id_device(): string {
        return this._id_device;
    }

    set id_device(value: string) {
        this._id_device = value;
    }

    get pin(): string {
        return this._pin;
    }

    set pin(value: string) {
        this._pin = value;
    }
}