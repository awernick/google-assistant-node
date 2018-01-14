"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').load(); /** Loading .env file where you can store your API keys for the app */
const GoogleAssistant = require("../lib/google-assistant");
const constants = GoogleAssistant.Constants;
const encoding = constants.Encoding;
const google = require('googleapis');
const opn = require('opn');
const OAuth2 = google.auth.OAuth2;
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
});
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// The Assistant is connected to Google and is ready to receive audio
// data from the mic.
assistant.on('ready', () => {
    // We're not using this for the text conversation.
});
// Transcription of the Assistant's response.
// Google sometimes does not send this text, so don't rely
// to heavily on it.
assistant.on('response-text', (text) => {
    console.log('Google Assistant:', text);
});
assistant.on('follow-on', (object) => {
    startConversation();
});
// There was an error somewhere. Stop the mic and speaker streams.
assistant.on('error', (err) => {
    console.error(err);
    console.log("Error ocurred. Exiting...");
});
// The conversation is over. Close the microphone and the speakers.
assistant.on('end', () => {
    startConversation();
});
assistant.once('unauthorized', () => {
    console.log("Not authorized. Exiting...");
});
// Authentication is a bit complicated since Google requires developers
// to create a Google Cloud Platform project to use the Google Assistant.
// You also need to enable the Google Assistant API in your GCP project
// in order to use the SDK.
// Defaulting the redirect URL to display the code so we can input it in the console.
var authClient = new OAuth2(process.env.CLIENT_ID || 'YOUR_CLIENT_ID', process.env.CLIENT_SECRET || 'YOUR_CLIENT_SECRET', process.env.REDIRECT_URL || 'urn:ietf:wg:oauth:2.0:oob' // Default to output code oob in window
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
console.log(url);
try {
    opn(url);
}
catch (error) {
    //trying to open url, if not possible, use url mentioned in console.
}
let userName;
/** Asking for auth code form authentication URL */
rl.question('Auth code: ', function (code) {
    /** Getting tokens from Google to authenticate */
    authClient.getToken(code, function (err, tokens) {
        if (!err) {
            authClient.setCredentials(tokens);
            console.log('Authentication succesful!');
            /** Authenticating the Google Assistant */
            assistant.authenticate(authClient);
            /** Getting the user profile information  */
            var oauth2 = google.oauth2({
                auth: authClient,
                version: 'v2'
            });
            oauth2.userinfo.v2.me.get(function (err, result) {
                /** Saving profile name for nice chatty output */
                userName = result.given_name;
                startConversation();
            });
        }
        else {
            console.log('Error happend, exiting....');
        }
    });
});
/** Starting a conversation, getting console input and sending it to google. */
function startConversation() {
    let textQuery;
    rl.question(userName + ': ', (input) => {
        if (input) {
            assistant.assist(input);
        }
        else {
            console.log('Whooppss, seems like you didn\'t say anything.');
        }
    });
}
//# sourceMappingURL=text-conversation.js.map