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
  }
})

// The Assistant is connected to Google and is ready to receive audio
// data from the mic.
assistant.on('ready', (conversationStream: stream.Writable) => {
  console.log("Ready");
  mic.getAudioStream().pipe(conversationStream)
})

// Transcription of the audio recorded by the mic
assistant.on('request-text', (text: string) => {
  console.log("Request Text: ", text)
})


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
assistant.once('end', () => {
  speaker.end();
  mic.stop();
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
var authClient = new OAuth2(
  'YOUR_CLIENT_ID' || process.env.CLIENT_ID,
  'YOUR_CLIENT_SECRET' || process.env.CLIENT_SECRET,
  'YOUR (OPTIONAL) REDIRECT_URL' || process.env.REDIRECT_URL
);

// Retrieve tokens via token exchange explained here:
// https://github.com/google/google-api-nodejs-client
//
// There are also many other methods to obtain an access token from Google.
// Please read the following for more information:
// https://developers.google.com/identity/protocols/OAuth2
authClient.setCredentials({
  access_token: 'ACCESS TOKEN HERE',
  refresh_token: 'REFRESH TOKEN HERE'
  // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
  // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
});


// Authenticate the Asssistant using a Google OAuth2Client
assistant.authenticate(authClient);

// Start the conversation with the Google Assistant.
// Remember that you should start piping data once the `ready` event has 
// been fired.
assistant.converse();
