"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
let GoogleAssistant = require('../lib/google-assistant');
let constants = GoogleAssistant.Constants;
let encoding = constants.Encoding;
const inputConfig = {
    encoding: encoding.LINEAR16,
    sampleRateHertz: 16000
};
const outputConfig = {
    encoding: encoding.LINEAR16,
    sampleRateHertz: 16000,
    volumePercentage: 100
};
let buildAssistant = () => {
    return new GoogleAssistant({
        input: inputConfig,
        output: outputConfig
    });
};
let buildAuthClient = () => {
    return {};
};
describe('GoogleAssistant', function () {
    describe('constructor', function () {
        it('should error on null config', function () {
            chai_1.assert.throws(() => { new GoogleAssistant(); }, TypeError);
        });
        it('should error on blank config', function () {
            chai_1.assert.throws(() => { new GoogleAssistant({}); }, TypeError);
        });
        it('should error on missing input config', function () {
            chai_1.assert.throws(() => {
                new GoogleAssistant({
                    output: outputConfig
                });
            }, TypeError);
        });
        it('should error on missing output config', function () {
            chai_1.assert.throws(() => {
                new GoogleAssistant({
                    input: inputConfig
                });
            }, TypeError);
        });
    });
    describe('.authenticate', function () {
        it('should error on null authClient', function () {
        });
    });
    describe('.converse', function () {
        let assistant = buildAssistant();
        let authClient = buildAuthClient();
        it('should error if not authenticated', function () {
            chai_1.assert.throw(assistant.converse, Error);
        });
        it('should succeed if authenticated', function () {
            assistant.authenticate(authClient);
            assistant.converse();
        });
    });
    describe('events', function () {
    });
});
//# sourceMappingURL=test.google-assistant.js.map