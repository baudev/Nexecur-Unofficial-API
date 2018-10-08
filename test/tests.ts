import {NexecurAPI} from "../Controllers/NexecurAPI";
import {AlarmStatus} from "../Models/AlarmStatus";

var assert = require('assert');

describe('NexecurAPI', function() {
    describe('getAlarmStatus', function () {

        it('should return 0 or 1', function (done) {
            NexecurAPI.getAlarmStatus((response => {
                if(response != (AlarmStatus.Disabled && AlarmStatus.Enabled)){
                    done("error");
                } else {
                    done();
                }
            }))

        });
    });

    describe('getHistoric', function() {
        it('should be an array', function(done) {
            NexecurAPI.getHistoric((response => {
               if(Array.isArray(response)){
                   done();
               } else {
                   done("error");
               }
            }))

        });
    });

});