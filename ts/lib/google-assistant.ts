import * as events from "events";
import * as stream from "stream";
import * as constants from "./constants";
import  AudioConverter from "./audio-converter";
import { State, Event, API, MicMode } from "./constants";
import { AudioInOptions , AudioOutOptions, DeviceOptions }  from "./options";
import { 
  AssistConfig, AudioInConfig, AudioOutConfig, AssistantConfig, DialogStateIn, DeviceConfig,
} from "./config";

let grpc = require('grpc');
let messages = require('./googleapis/google/assistant/embedded/v1alpha2/embedded_assistant_pb');
let services = require('./googleapis/google/assistant/embedded/v1alpha2/embedded_assistant_grpc_pb');

class GoogleAssistant extends events.EventEmitter {
  static Constants = constants;

  private state: State
  private service: any   // gRPC Service
  private channel: any   // gRPC Duplex Channel
  private converter: AudioConverter
  private assistConfig: AssistConfig
  private conversationState: Array<number> | null
  private textQuery: string | null
  private languageCode: string

  private audioInConfig: AudioInConfig;
  private audioOutConfig: AudioOutConfig;
  private dialogStateIn: DialogStateIn;
  private deviceConfig: DeviceConfig;

  constructor(config: AssistantConfig) {
    super();
    this.converter = new AudioConverter();
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

  public setDeviceConfig(config: DeviceOptions) {
    this.deviceConfig.setDeviceId(config.deviceId);
    this.deviceConfig.setDeviceModelId(config.deviceModelId);
  }

  public setInputConfig(config?: AudioInOptions) {
    if(config) {
      this.audioInConfig.setEncoding(config.encoding);
      this.audioInConfig.setSampleRateHertz(config.sampleRateHertz);
    }
  }

  public setLanguageCode(languageCode: string) {
    this.languageCode = languageCode;
    this.dialogStateIn.setLanguageCode(languageCode);
  }

  public setOutputConfig(config: AudioOutOptions) {
    this.audioOutConfig.setEncoding(config.encoding);
    this.audioOutConfig.setSampleRateHertz(config.sampleRateHertz);
    this.audioOutConfig.setVolumePercentage(config.volumePercentage);
  }

  private _updateAssistConfig() {
    if(this.textQuery) {
      this.assistConfig.setTextQuery(this.textQuery);
      this.assistConfig.clearAudioInConfig();
    } else {
      this.assistConfig.setAudioInConfig(this.audioInConfig);
      this.assistConfig.clearTextQuery();
    }
    this.assistConfig.setAudioOutConfig(this.audioOutConfig);
    this.assistConfig.setDialogStateIn(this.dialogStateIn);
    this.assistConfig.setDeviceConfig(this.deviceConfig);
  }
  
  public authenticate(authClient: any) {
    let ssl_creds = grpc.credentials.createSsl(); 
    let call_creds = grpc.credentials.createFromGoogleCredential(authClient); 
    let combined_creds = grpc.credentials.combineChannelCredentials(
      ssl_creds, 
      call_creds
    );
    this.service = new services.EmbeddedAssistantClient(
      API.ENDPOINT, 
      combined_creds
    ); 
  } 

  public assist(textQuery?: string) {
    // [TODO]: Add support for text-input requests
    if(this.state == State.IN_PROGRESS && this.dialogStateIn.conversationState != null) {
      this.assistConfig.setDialogStateIn(this.dialogStateIn);
      this.dialogStateIn.conversationState = null;
    }

    this.textQuery = textQuery;
    this._updateAssistConfig();
    let request = new messages.AssistRequest();
    request.setConfig(this.assistConfig); 

    // GUARD: Make sure service is created and authenticated
    if(this.service == null) {
      this.emit('unauthorized');
      return;
    }

    this.channel = this.service.assist(
      new grpc.Metadata(), request
    );

    // Setup event listeners
    this.channel.on('data', this._handleAssistResponse.bind(this));
    this.channel.on('error', this._handleError.bind(this));
    this.channel.on('end', this._handleConversationEnd.bind(this));

    // Write first AssistRequest
    this.channel.write(request)
    this.state = State.IN_PROGRESS;

    // Wait for any errors to emerge before piping
    // audio data
    if(!this.textQuery) {
      setTimeout(() => {
        if(this.channel != null) {
          // Setup conversion stream
          this.converter
            .pipe(this.channel)
            .on('error', this._handleError.bind(this));

          // Signal that assistant is ready
          this.emit('ready', this.converter);
        }
      }, 100);
    } else {
      this.emit('ready', this.textQuery);
    }
  }

  private _handleAssistResponse(response: any) {
    if(response.getEventType() == Event.END_OF_UTTERANCE) {
      this.emit('end-of-utterance');
    }

    if(response.getSpeechResultsList()) {
      this.emit('speech-results', response.getSpeechResultsList());
    }

    if(response.hasDialogStateOut()) {
      this._handleDialogStateOut(response.getDialogStateOut());
    }

    if(response.hasAudioOut()) {
      this.emit('audio-data', 
        new Buffer(response.getAudioOut().getAudioData())
      );
    }

    // [TODO]: Add support for device actions.
    /*
    if(response.hasError()) { 
      this.emit('error', response.getError());
    }
    */
  }

  private _handleDialogStateOut(state: any) {
    if(state.getSupplementalDisplayText()) {
      this.emit('response-text', state.getSupplementalDisplayText());
    }

    if(state.getConversationState()) {
      this.emit('state', 
        new Buffer(state.getConversationState())
      );
      this._handleConversationState(state);
    }
  }

  private _handleConversationState(state: any) { 
    // Determine state based on microphone mode.
    if(state.getMicrophoneMode()) {
      this.emit('mic-mode', state.getMicrophoneMode());
      let micMode = state.getMicrophoneMode();
      // Keep state, and expect more input
      if(micMode == MicMode.DIALOG_FOLLOW_ON) {
        this.state = State.IN_PROGRESS;
      } 
      
      // Conversation is over, wait for output to finish streaming
      else if(micMode == MicMode.CLOSE_MICROPHONE) {
        this.state = State.FINISHED;
      }
    }
    // Handle continous conversations
    if(state.getConversationState()) {
      let diaState = new messages.DialogStateIn(this.dialogStateIn);
      diaState.setLanguageCode(this.languageCode);
      diaState.setConversationState(state.getConversationState());
      this.dialogStateIn = diaState;
    }
  }

  public _handleConversationEnd() {
    this.emit('end');
    if(this.state == State.IN_PROGRESS) {
      this.emit('follow-on');
    }
  }

  public _handleError(error: any) {
    if(this.channel != null) {
      this.channel.end();
      this.channel = null;
    }

    if(error.code && error.code == grpc.status.UNAUTHENTICATED) {
      this.emit('unauthorized', error);
    } else {
      this.emit('error', error);
    }
  }
}

export = GoogleAssistant;
