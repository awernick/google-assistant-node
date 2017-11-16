# Google Assistant SDK for Node
This wrapper allows you to use the Google Assistant api in any Node application.
It handles events, audio buffering, and client connection automatically.

This module uses the GRPC implementation of the Google Assistant SDK.
More info can be found [here](https://developers.google.com/assistant/sdk/reference/rpc/google.assistant.embedded.v1alpha1).

## Installation
```sh
npm install google-assistant-node
```

## Usage
```js
let GoogleAssistant = require('google-assistant-node');
let constants = GoogleAssistant.Constants;
let encodings = constants.Encoding;

let assistant = new GoogleAssistant({
  input: {
    encoding: encodings.LINEAR16,
    sampleRateHertz: 16000
  },
  output: {
    encoding: encodings.MP3,
    sampleRateHertz: 16000,
    volumePercentage: 100
  }
});

// Audio Data (bytes)
assistant.on('audio-data', (data) => {
});

//  Reponse Text (string)
assistant.on('response-text', (text) => {
});

//  Request Text (string)
assistant.on('request-text', (text) => {
});

//  Conversation State (bytes)
assistant.on('state', (state) => {
});

//  Microphone Mode (int)
assistant.on('mic-mode', (mode) => {
});

// Authorization error (error)
// E.g. Did not authenticate with OAuth client
assistant.on('unauthorized', (error) => {
})

//  Error (error)
assistant.on('error', (error) => {
});

// Assistant is ready to accept audio data. NOTE: .once() is used.
assistant.once('ready', (wstream) => {
  audioData.pipe(wstream);
});

// Current conversation is over. 
// NOTE: 'end' will be called even if there is a 'follow-on' event.
assistant.once('end', () => {
});

// Assistant is expecting a follow-on response from user.
assistant.on('follow-on', () => {
  
  // Setup follow-on 'ready' and 'end' event handler to change audio source
  // if desired (or if you used .once()).
  assistant.once('ready', (wstream) => { 
    moreAudioData.pipe(wstream)
  });
  
  // Handle follow-on conversation end.
  assistant.once('end', () => {
    moreAudioData.end();
  }) 

  // Don't forget to call .converse() to resume conversation
  assistant.converse();
})

// Use Google OAuth Client to authenticate: 
// https://github.com/google/google-auth-library-nodejs 
// or
// https://github.com/google/google-api-nodejs-client
assistant.authenticate(authClient);

// Start conversation
assistant.converse();
```

### Constants
#### Encoding
- LINEAR16: Uncompressed 16-bit signed little-endian samples.
- FLAC: Free Lossless Audio Codec. Input audio only.
- MP3: MP3 Audio Encoding. Output audio only.
- OPUS_IN_OGG: Opus-encoded audio wrapped in an ogg container. Output audio only.

#### MicMode
- CLOSE_MICROPHONE: The service is not expecting a follow-on question from the user. 
- DIALOG_FOLLOW_ON: The service is expecting a follow-on question from the user. 

## Contributing
Please feel free to make pull requests if you want to include a feature or
if you fix an issue previously reported in the tracker.
