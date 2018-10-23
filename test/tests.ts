import {NexecurAPI} from "../Controllers/NexecurAPI";

var assert = require('assert');

describe('NexecurAPI', function () {
    describe('getAlarmStatus', function () {

        it('should get a response', function (done) {
            NexecurAPI.getAlarmStatus().then(() => {
                done();
            }).catch(() => {
                done("error");
            })

        });
    });

    describe('getHistoric', function () {
        it('should get a response', function (done) {
            NexecurAPI.getHistoric().then((res) => {
                done();
            }).catch(() => {
                done("error");
            })

        });
    });

});