export declare enum State {
    IN_PROGRESS = 0,
    FINISHED = 1,
}
export declare enum Event {
    END_OF_UTTERANCE = 1,
}
export declare enum MicMode {
    CLOSE_MICROPHONE = 1,
    DIALOG_FOLLOW_ON = 2,
}
export declare enum Encoding {
    LINEAR16 = 1,
    FLAC = 2,
    MP3 = 2,
    OPUS_IN_OGG = 3,
}
export declare module API {
    const ENDPOINT = "embeddedassistant.googleapis.com";
}
