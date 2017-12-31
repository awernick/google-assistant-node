export enum State {
  IN_PROGRESS = 0,
  FINISHED    = 1
}

export enum Event {
  EVENT_TYPE_UNSPECIFIED = 0,
  END_OF_UTTERANCE = 1
}

export enum MicMode {
  MICROPHONE_MODE_UNSPECIFIED = 0,
  CLOSE_MICROPHONE = 1,
  DIALOG_FOLLOW_ON = 2
}

export enum Encoding {
  LINEAR16      = 1,
  FLAC          = 2, // Input
  MP3           = 2, // Output
  OPUS_IN_OGG   = 3  // Output
}

export module API {
  export const ENDPOINT = 'embeddedassistant.googleapis.com'
}
