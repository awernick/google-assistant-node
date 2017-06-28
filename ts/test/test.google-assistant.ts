import * as chai from "chai";
import * as stream from "stream";
chai.use(require("chai-events"));

let should = chai.should();
let sinon = require('sinon');
let spy = sinon.spy;
let GoogleAssistant = require('../lib/google-assistant');
let constants = GoogleAssistant.Constants; 
let micMode = constants.MicMode;
let encoding = constants.Encoding;
let helpers = require('./helpers');
let clone = require('lodash.clone');

let assistant: any = null;
let authClient: any = null;

const inputConfig = {
  encoding: encoding.LINEAR16,
  sampleRateHertz: 16000
}

const outputConfig = {
  encoding: encoding.LINEAR16,
  sampleRateHertz: 16000,
  volumePercentage: 100
}

const cbtimeout = 10000;

/* Build a valid Google Assistant */
let buildAssistant = (): any => {
  return new GoogleAssistant({
    input: inputConfig,
    output: outputConfig
  })
}

/* Build a valid auth client */
let buildAuthClient = (): any => {
  return helpers.authClient;
}

/* Create a simple conversation that doesn't require follow-on input */
let initConversation = function() {
  assistant.authenticate(authClient);
  assistant.on('ready', function(wstream: any) {
    let stream = helpers.audioStreams.createSimple();
    stream.pipe(wstream);
  })
  assistant.converse();
}

/* Create a multi-step conversation with follow-on input */
let initMultistepConversation = function() {
  assistant.authenticate(authClient);
  assistant.on('ready', function(wstream: any) {
    let stream = helpers.audioStreams.multistep.createFirstStream();
    stream.pipe(wstream);
  })
  assistant.converse();
}


describe('GoogleAssistant', function() {
  describe('constructor' , function() {
    it('should error on null config', function() {
      (() => { new GoogleAssistant() }).should.throw(TypeError);
    })

    it('should error on blank config', function() {
      (() => { new GoogleAssistant({}) }).should.throw(TypeError);
    })

    it('should error on missing input config', function() {
      (() => { 
        new GoogleAssistant({
          output: outputConfig
        }) 
      }).should.throw(TypeError);
    })

    it('should error on missing output config', function() {
      (() => { 
        new GoogleAssistant({
          input: inputConfig
        }) 
      }).should.throw(TypeError);
    })
  })

  describe('authenticate()', function() {

    beforeEach(function() {
      assistant = buildAssistant();
      authClient = buildAuthClient();
    })
  
    it('should error if authClient is missing', function() {
      assistant.authenticate();
    })

    it('should error if authClient is null', function() {
      authClient = null;
      assistant.authenticate(authClient);
    })
  })

  describe('converse()', function() {
    let assistant: any = null;
    let authClient: any = null;

    beforeEach(function() {
      assistant = buildAssistant();
      authClient = buildAuthClient();
    })

    it('should error if not authenticated', function() {
      assistant.converse.should.throw(Error);
    })
  })

  describe('events', function() {
    beforeEach(function() {
      assistant = buildAssistant();
      authClient = buildAuthClient();
    })

    describe('unauthenticated', function() {
      it('should emit `unauthorized` if not authenticated', function() {
        let cb = spy();
        assistant.on("unauthorized", cb);
        assistant.converse();
        cb.called.should.be.true;
      })

      it('should not emit `ready` if not authenticated', function() {
        let cb = spy();
        assistant.on('ready', cb);
        assistant.converse();
        cb.notCalled.should.be.true;
      })

      it('should not emit `end` if not authenticated', function() {
        let cb = spy();
        assistant.on('end', cb);
        assistant.converse();
        cb.notCalled.should.be.true;
      })

      it('should emit `unauthorized` if using incorrect credentials', function () {
        let cb = spy();
        let invalidAuthClient = clone(authClient);
        invalidAuthClient.setCredentials({
          access_token: 'THIS IS WRONG'
        })
        assistant.authenticate(invalidAuthClient);
        assistant.on('unauthorized', cb);
        assistant.converse();
        cb.notCalled.should.be.true;
      })
    })

    describe('authenticated', function() {
      beforeEach(function(done) {
        // Wait 2 secs between authentications
        let timeout = 2000;
        this.timeout(timeout + 1000);
        setTimeout(() => {
          assistant.authenticate(authClient);
          done();
          console.log('test');
        }, timeout)
      })


      describe('`ready`', function() {
        it('should be emitted if authenticated correctly', function(done) {
          assistant.once('ready', () => {
            done();
          });
          assistant.converse();
        }).timeout(cbtimeout);

        it('should create a write stream when `ready`', function(done) {
          assistant.on('ready', function(wstream: any) {
            wstream.should.be.an.instanceof(stream.Writable);
            done();
          })
          assistant.converse();
        })
      })

      describe('`error`', function() {
        it('should be emitted if invalid input encoding is used', function(done) {
          assistant.once('error', function(error: Error) {
            done();
          });
          assistant.setInputConfig({
            encoding: 9999,
            sampleRateHertz: 16000
          });
          initConversation();
        }).timeout(4000);

        it('should be emitted if invalid output encoding is used', function(done) {
          assistant.once('error', function() {
            done();
          })
          assistant.setOutputConfig({
            encoding: 9999,
            sampleRateHertz: 16000
          });
          initConversation();
        }).timeout(4000);

        it('should be emitted if invalid input hertz rate is used', function(done) {
          assistant.once('error', function() {
            done();
          })
          assistant.setInputConfig({
            encoding: encoding.LINEAR16,
            sampleRateHertz: 999999
          });
          initConversation();
        }).timeout(4000);

        it('should be emitted if invalid output hertz rate is used', function(done) {
          assistant.once('error', function() {
            done();
          })
          assistant.setOutputConfig({
            encoding: encoding.LINEAR16,
            sampleRateHertz: 999999
          });
          initConversation();
        }).timeout(4000);
      })

      describe('`audio-data`', function() {
        it('should be emitted after writing valid audio data', function(done) {
          assistant.on('error', function(error: Error) {
            console.log(error.toString());
          })

          assistant.once('audio-data', function() {
            done();
          })

          initConversation();
        }).timeout(cbtimeout);

        it('should return a buffer on `audio-data`', function(done) {
          assistant.once('audio-data', function(data: any) {
            data.should.be.an.instanceof(Buffer);
            done();
          })
          initConversation();
        }).timeout(cbtimeout);
      })

      describe('`request-text`', function() {
        it('should be emitted after writing valid audio data', function(done) {
          assistant.on('request-text', function() {
            done();
          })
          initConversation();
        }).timeout(cbtimeout);

        it('should return a string on `request-text`', function(done) {
          assistant.on('request-text', function(requestText: any) {
            requestText.should.be.a('string');
            done();
          });
          initConversation();
        }).timeout(cbtimeout);
      })

      describe('`mic-mode`', function() {
        it('should be emitted after writing valid audio data', function(done) {
          assistant.once('mic-mode', function() {
            done();
          })
          initConversation();
        }).timeout(cbtimeout);

        it('should return CLOSE_MICROPHONE for one-step conversations', function(done) {
          assistant.once('mic-mode', function(mode: number) {
            mode.should.equal(micMode.CLOSE_MICROPHONE);
            done();
          })
          initConversation();
        }).timeout(cbtimeout);

        it('should return DIALOG_FOLLOW_ON for multi-step conversations', function(done) {
          assistant.once('error', function (error: Error) {
            console.log(error.toString());
          })

          assistant.once('mic-mode', function(mode: number) {
            mode.should.equal(micMode.DIALOG_FOLLOW_ON);
            done();
          })
          initMultistepConversation();
        })
      })

      describe('`state`', function() {
        it('should be emitted after writing valid audio data', function(done) {
          assistant.once('data', function() {
            done();
          })
          initConversation();
        }).timeout(cbtimeout);

        it('should return a buffer with `conversation state`', function(done) {
          assistant.once('data', function(state: any) {
            state.should.be.an.instanceof(Buffer);
            done();
          })
          initConversation();
        }).timeout(cbtimeout);
      })

      describe('`follow-on`', function() {
        it('should be emitted after a conversation that requires more input', function(done) {
          assistant.once('follow-on', function() {
            done();
          })
          initMultistepConversation();
        }).timeout(cbtimeout);

        it('should not be emitted with a single-step conversation', function(done) {
          setTimeout(() => {
            assistant.should.not.emit('follow-on');
            done();
          }, 3000);
          assistant.converse();
        }).timeout(cbtimeout);
      })
    })
  })
})
