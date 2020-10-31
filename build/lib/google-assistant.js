"use strict";
const events = require("events");
const constants = require("./constants");
const audio_converter_1 = require("./audio-converter");
const constants_1 = require("./constants");
let grpc = require('grpc');
let messages = require('./googleapis/google/assistant/embedded/v1alpha2/embedded_assistant_pb');
let services = require('./googleapis/google/assistant/embedded/v1alpha2/embedded_assistant_grpc_pb');
class GoogleAssistant extends events.EventEmitter {
    constructor(config) {
        super();
        this.converter = new audio_converter_1.default();
        this.assistConfig = new messages.AssistConfig();
        this.audioInConfig = new messages.AudioInConfig();
        this.audioOutConfig = new messages.AudioOutConfig();
        this.dialogStateIn = new messages.DialogStateIn();
        this.deviceConfig = new messages.DeviceConfig();
        this.setInputConfig(config.input);
        this.setOutputConfig(config.output);
        this.setLanguageCode(config.languageCode);
        this.setDeviceConfig(config.device);
    }
    setDeviceConfig(config) {
        this.deviceConfig.setDeviceId(config.deviceId);
        this.deviceConfig.setDeviceModelId(config.deviceModelId);
    }
    setInputConfig(config) {
        if (config) {
            this.audioInConfig.setEncoding(config.encoding);
            this.audioInConfig.setSampleRateHertz(config.sampleRateHertz);
        }
    }
    setLanguageCode(languageCode) {
        this.languageCode = languageCode;
        this.dialogStateIn.setLanguageCode(languageCode);
    }
    setOutputConfig(config) {
        this.audioOutConfig.setEncoding(config.encoding);
        this.audioOutConfig.setSampleRateHertz(config.sampleRateHertz);
        this.audioOutConfig.setVolumePercentage(config.volumePercentage);
    }
    _updateAssistConfig() {
        if (this.textQuery) {
            this.assistConfig.setTextQuery(this.textQuery);
            this.assistConfig.clearAudioInConfig();
        }
        else {
            this.assistConfig.setAudioInConfig(this.audioInConfig);
            this.assistConfig.clearTextQuery();
        }
        this.assistConfig.setAudioOutConfig(this.audioOutConfig);
        this.assistConfig.setDialogStateIn(this.dialogStateIn);
        this.assistConfig.setDeviceConfig(this.deviceConfig);
    }
    authenticate(authClient) {
        let ssl_creds = grpc.credentials.createSsl();
        let call_creds = grpc.credentials.createFromGoogleCredential(authClient);
        let combined_creds = grpc.credentials.combineChannelCredentials(ssl_creds, call_creds);
        this.service = new services.EmbeddedAssistantClient(constants_1.API.ENDPOINT, combined_creds);
    }
    assist(textQuery) {
        if (this.state == constants_1.State.IN_PROGRESS && this.dialogStateIn.conversationState != null) {
            this.assistConfig.setDialogStateIn(this.dialogStateIn);
            this.dialogStateIn.conversationState = null;
        }
        this.textQuery = textQuery;
        this._updateAssistConfig();
        let request = new messages.AssistRequest();
        request.setConfig(this.assistConfig);
        // GUARD: Make sure service is created and authenticated
        if (this.service == null) {
            this.emit('unauthorized');
            return;
        }
        this.channel = this.service.assist(new grpc.Metadata(), request);
        // Setup event listeners
        this.channel.on('data', this._handleAudioOut.bind(this));
        this.channel.on('data', this._handleAssistResponse.bind(this));
        this.channel.on('data', this._handleEndOfUtterance.bind(this));
        this.channel.on('data', this._handleSpeechResults.bind(this));
        this.channel.on('error', this._handleError.bind(this));
        this.channel.on('end', this._handleConversationEnd.bind(this));
        // Write first AssistRequest
        this.channel.write(request);
        this.state = constants_1.State.IN_PROGRESS;
        // Wait for any errors to emerge before piping
        // audio data
        if (!this.textQuery) {
            setTimeout(() => {
                if (this.channel != null) {
                    // Signal that assistant is ready for audio input
                    this.emit('ready');
                }
            }, 100);
        }
        else {
            this.emit('ready', this.textQuery);
        }
    }
    // Write audio buffer to channel
    writeAudio(data) {
        if (this.channel) {
            var request = new messages.AssistRequest();
            request.setAudioIn(data);
            this.channel.write(request);
        }
    }
    say(sentence) {
        this.assist('repeat after me '.concat(sentence));
    }
    _handleEndOfUtterance(response) {
        if (response.getEventType() === constants_1.Event.END_OF_UTTERANCE) {
            this.emit('end-of-utterance');
        }
    }
    _handleAssistResponse(response) {
        if (response.hasDialogStateOut()) {
            this._handleDialogStateOut(response.getDialogStateOut());
        }
        if (response.hasDeviceAction()) {
            this.emit('device-request', JSON.parse(response.getDeviceAction().toObject().deviceRequestJson));
        }
    }
    _handleAudioOut(response) {
        if (response.hasAudioOut()) {
            this.emit('audio-data', new Buffer(response.getAudioOut().getAudioData()));
        }
    }
    _handleSpeechResults(response) {
        const speechResultsList = response.toObject().speechResultsList;
        if (speechResultsList) {
            this.emit('speech-results', speechResultsList);
        }
    }
    _handleDialogStateOut(state) {
        if (state.getSupplementalDisplayText()) {
            this.emit('response-text', state.getSupplementalDisplayText());
        }
        if (state.getConversationState()) {
            this.emit('state', new Buffer(state.getConversationState()));
            this._handleConversationState(state);
        }
    }
    _handleConversationState(state) {
        // Determine state based on microphone mode.
        if (state.getMicrophoneMode()) {
            this.emit('mic-mode', state.getMicrophoneMode());
            let micMode = state.getMicrophoneMode();
            // Keep state, and expect more input
            if (micMode == constants_1.MicMode.DIALOG_FOLLOW_ON) {
                this.state = constants_1.State.IN_PROGRESS;
            }
            else if (micMode == constants_1.MicMode.CLOSE_MICROPHONE) {
                this.state = constants_1.State.FINISHED;
            }
        }
        // Handle continous conversations
        if (state.getConversationState()) {
            let diaState = new messages.DialogStateIn(this.dialogStateIn);
            diaState.setLanguageCode(this.languageCode);
            diaState.setConversationState(state.getConversationState());
            this.dialogStateIn = diaState;
        }
    }
    _handleConversationEnd() {
        this.emit('end');
        if (this.state == constants_1.State.IN_PROGRESS) {
            this.emit('follow-on');
        }
    }
    _handleError(error) {
        if (this.channel != null) {
            this.channel.end();
            this.channel = null;
        }
        if (error.code && error.code == grpc.status.UNAUTHENTICATED) {
            this.emit('unauthorized', error);
        }
        else {
            this.emit('error', error);
        }
    }
    stop() {
        if (this.channel != null) {
            this.channel.removeAllListeners();
            this.channel.end();
            this.channel = null;
            this.emit('end');
        }
    }
}
GoogleAssistant.Constants = constants;
module.exports = GoogleAssistant;
//# sourceMappingURL=google-assistant.js.map