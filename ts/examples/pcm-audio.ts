require('dotenv').load(); /** Loading .env file where you can store your API keys for the app */

/**
 * Record audio using the internal microphone,
 * send it to the Google Assistant and listen to the response
 * through the speakers.
 */

import GoogleAssistant = require("../lib/google-assistant");
import * as stream from "stream";

const constants = GoogleAssistant.Constants;
const encoding = constants.Encoding;

const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const Speaker = require('speaker');
const Microphone = require('mic');

const opn = require('opn');

// Setup the speaker for PCM data
let speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 16000
})

// Setup an interface to the mic to record PCM data
let mic = new Microphone({
  rate: '16000',
  channels: '1',
  debug: true,
})

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Start the Assistant to process 16Hz PCM data from the mic,
// and send the data correctly to the speaker.
let assistant = new GoogleAssistant({
  input: {
    encoding: encoding.LINEAR16,
    sampleRateHertz: 16000
  },
  output: {
    encoding: encoding.LINEAR16,
    sampleRateHertz: 16000,
    volumePercentage: 100
  },
  device: {
    deviceId: 'pcm-audio',
    deviceModelId: 'pcm-audio-node',
  },
  languageCode: 'en-US',
})

// The Assistant is connected to Google and is ready to receive audio
// data from the mic.
assistant.on('ready', (conversationStream: stream.Writable) => {
  console.log("Ready");
  mic.getAudioStream().pipe(conversationStream)
})

// Transcription of the audio recorded by the mic
assistant.on('speech-results', (results: any) => {
  console.log("Speech results: ", results);
});


// Transcription of the Assistant's response.
// Google sometimes does not send this text, so don't rely
// to heavily on it.
assistant.on('response-text', (text: string) => {
  console.log("Response Text: ", text)
})

// This is the Assistant's audio response. Send it to the speakers.
assistant.on('audio-data', (data: Array<Number>) => {
  speaker.write(data)
})

// There was an error somewhere. Stop the mic and speaker streams.
assistant.on('error', (err: Error) => {
  console.error(err);
  console.log("Error ocurred. Exiting...");
  speaker.end();
  mic.stop();
})

// The conversation is over. Close the microphone and the speakers.
assistant.on('end', () => {
  startConversation();
})

assistant.once('unauthorized', () => {
  console.log("Not authorized. Exiting...");
  speaker.end();
  mic.stop();
})

// Authentication is a bit complicated since Google requires developers
// to create a Google Cloud Platform project to use the Google Assistant.
// You also need to enable the Google Assistant API in your GCP project
// in order to use the SDK.
// Defaulting the redirect URL to display the code so we can input it in the console.
var authClient = new OAuth2(
  process.env.CLIENT_ID     || 'YOUR_CLIENT_ID',
  process.env.CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  process.env.REDIRECT_URL  || 'urn:ietf:wg:oauth:2.0:oob' // Default to output code oob in window
);


/** Saving profile name for nice chatty output */
var url = authClient.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: ['https://www.googleapis.com/auth/assistant-sdk-prototype',
  'https://www.googleapis.com/auth/userinfo.profile'],
});

console.log('Login and get your refresh token.');
console.log(url)

try {
opn(url);
} catch (error) {
 //trying to open url, if not possible, use url mentioned in console.
}

let userName: any;

/** Asking for auth code form authentication URL */
rl.question('Auth code: ', function(code: any) {
  /** Getting tokens from Google to authenticate */
  authClient.getToken(code, function (err: any, tokens: any) {
    if (!err) {
      authClient.setCredentials(tokens);
      console.log('Authentication succesful!');

      /** Authenticating the Google Assistant */
      assistant.authenticate(authClient);
      
      startConversation();
    } else {
      console.log('Error happend, exiting....');
    }
  });
});


// Authenticate the Asssistant using a Google OAuth2Client
assistant.authenticate(authClient);

function startConversation() {
  console.log('Press any key to say something to Google, wait for your signal.');
  process.stdin.resume();
  process.stdin.on('data', () => { assistant.assist() });
}

