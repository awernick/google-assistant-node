
import GoogleAssistant = require("../lib/google-assistant");
import * as stream from "stream";

const constants = GoogleAssistant.Constants;
const encoding = constants.Encoding;

const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;

//const Speaker = require('speaker');

// Setup the speaker for PCM data
/*
let speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 16000
})
*/

// Start the Assistant to process 16Hz PCM data from the mic,
// and send the data correctly to the speaker.
let assistant = new GoogleAssistant({
  output: {
    encoding: encoding.LINEAR16,
    sampleRateHertz: 16000,
    volumePercentage: 100
  },
  device: {
    deviceId: 'ga-desktop',
    deviceModelId: 'ga-desktop-electron',
  },
  languageCode: 'en-US',
})

// The Assistant is connected to Google and is ready to receive audio
// data from the mic.
assistant.on('ready', (conversationStream: stream.Writable) => {
  console.log("Ready");
})

// Transcription of the audio recorded by the mic
assistant.on('request-text', (text: string) => {
  console.log("Request Text: ", text);
})


// Transcription of the Assistant's response.
// Google sometimes does not send this text, so don't rely
// to heavily on it.
assistant.on('speech-results', (results: any) => {
  console.log("Response Text: ", results);
})

// This is the Assistant's audio response. Send it to the speakers.
assistant.on('audio-data', (data: Array<Number>) => {
  //speaker.write(data)
})

// There was an error somewhere. Stop the mic and speaker streams.
assistant.on('error', (err: Error) => {
  console.error(err);
  console.log("Error ocurred. Exiting...");
  //speaker.end();
})

// The conversation is over. Close the microphone and the speakers.
assistant.once('end', () => {
  console.log('ended.');
})

assistant.once('unauthorized', () => {
  console.log("Not authorized. Exiting...");
})

// Authentication is a bit complicated since Google requires developers
// to create a Google Cloud Platform project to use the Google Assistant.
// You also need to enable the Google Assistant API in your GCP project
// in order to use the SDK.
var authClient = new OAuth2(
  '1008767088687-rjpej2ecgpl7ktvtnlmnpkl9hgl4odch.apps.googleusercontent.com' || process.env.CLIENT_ID,
  'Ryn_0H-etWquCeSIJj8y9koX' || process.env.CLIENT_SECRET,
);

// Retrieve tokens via token exchange explained here:
// https://github.com/google/google-api-nodejs-client
//
// There are also many other methods to obtain an access token from Google.
// Please read the following for more information:
// https://developers.google.com/identity/protocols/OAuth2
authClient.setCredentials({
  access_token: 'ya29.GlsyBS2ywk7-zhFdHn1Rrc0d2FcPnn8oWVNjgE24-ve7zkJgCSrOOy6Djs5CYVbX2nOL9DoeB-3Pg1hr_RNDM5-pz2HMBSX9Wj43agMoJSS9z6wewwK_iDHqy19k',
  refresh_token: '1/hf2ljFUQGDQXG2AczXIuWOn0mRCZBPx6FB7AMJ5smAA'
});

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let textQuery;

assistant.authenticate(authClient);

rl.question('What would you like to say to Google Assistant?', (input: any) => {
  console.log(`${input}`);
  rl.close();
  assistant.assist(input);
});

