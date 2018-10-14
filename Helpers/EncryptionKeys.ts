const crypto = require("crypto");

export class EncryptionKeys {

    private _password: string;
    private _salt: string;
    private _passwordHash: string;
    private _pinHash: string;

    /**
     * Constructor
     * @param {string} password
     * @param {string} salt
     */
    constructor(password: string, salt: string){
        this._password = password;
        this._salt = salt;
    }

    /**
     * Generate the passwordHash and the pinHash
     */
    public generateKeys() {
        let byte0 : number;
        let abyte0 : Buffer;
        let j : number;
        let s_new : Buffer = Buffer.from(this._password, "utf16le");
        abyte0 = new Buffer(this._salt, 'base64');
        let s2_new : Buffer = new Buffer(s_new.length + abyte0.length);

        j = 0;
        let stop : boolean = false;
        while((!stop)) {
            if(j >= s2_new.length) {
                this._pinHash = EncryptionKeys.sha1(s2_new);
                this._passwordHash = EncryptionKeys.sha256(s2_new);
                stop = true;
            } else {
                if(j >= abyte0.length) {
                    byte0 = s_new[j - abyte0.length];
                    s2_new[j] = byte0;
                    j++;
                } else {
                    byte0 = abyte0[j];
                    s2_new[j] = byte0;
                    j++;
                }
            }
        };
    }

    public static sha1(data) {
        return crypto.createHash("sha1").update(data).digest("base64");
    }

    public static sha256(data) {
        return crypto.createHash("sha256").update(data).digest("base64");
    }


    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get salt(): string {
        return this._salt;
    }

    set salt(value: string) {
        this._salt = value;
    }

    get passwordHash(): string {
        return this._passwordHash;
    }

    set passwordHash(value: string) {
        this._passwordHash = value;
    }

    get pinHash(): string {
        return this._pinHash;
    }

    set pinHash(value: string) {
        this._pinHash = value;
    }
}
