import * as fs from "fs";
let env = process.env;
let google = require('googleapis');
let OAuth2 = google.auth.OAuth2;
require('dotenv').config()

// GOOGLE AUTH
let authClient = new OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  ''
)

authClient.setCredentials({
  access_token: env.GOOGLE_ACCESS_TOKEN,
  refresh_token: env.GOOGLE_REFRESH_TOKEN
})

authClient.refreshAccessToken(function(err: Error, tokens: any) {
  if(err) { throw err }
})

console.log(env.GOOGLE_CLIENT_ID);
console.log(env.GOOGLE_CLIENT_SECRET);
console.log(env.GOOGLE_ACCESS_TOKEN);
console.log(env.GOOGLE_REFRESH_TOKEN);

// AUDIO DATA
let createSimpleAudioStream = function() {
  return fs.createReadStream('./simple.wav');
}

let createFirstStepAudioStream = function() {
  return fs.createReadStream('./multi.1.wav');
}

let createSecondStepAudioStream = function() {
  return fs.createReadStream('./multi.2.wav');
}

module.exports = {
  authClient: authClient,
  audioStreams: {
    createSimple: createSimpleAudioStream,
    multistep: {
      createFirstStream: createFirstStepAudioStream,
      createSecondStream: createSecondStepAudioStream
    }
  }
}
