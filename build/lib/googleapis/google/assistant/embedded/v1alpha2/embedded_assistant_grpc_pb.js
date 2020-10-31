// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use strict';
var grpc = require('grpc');
var google_assistant_embedded_v1alpha2_embedded_assistant_pb = require('../../../../google/assistant/embedded/v1alpha2/embedded_assistant_pb.js');
var google_api_annotations_pb = require('../../../../google/api/annotations_pb.js');
var google_type_latlng_pb = require('../../../../google/type/latlng_pb.js');

function serialize_google_assistant_embedded_v1alpha2_AssistRequest(arg) {
  if (!(arg instanceof google_assistant_embedded_v1alpha2_embedded_assistant_pb.AssistRequest)) {
    throw new Error('Expected argument of type google.assistant.embedded.v1alpha2.AssistRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_google_assistant_embedded_v1alpha2_AssistRequest(buffer_arg) {
  return google_assistant_embedded_v1alpha2_embedded_assistant_pb.AssistRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_assistant_embedded_v1alpha2_AssistResponse(arg) {
  if (!(arg instanceof google_assistant_embedded_v1alpha2_embedded_assistant_pb.AssistResponse)) {
    throw new Error('Expected argument of type google.assistant.embedded.v1alpha2.AssistResponse');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_google_assistant_embedded_v1alpha2_AssistResponse(buffer_arg) {
  return google_assistant_embedded_v1alpha2_embedded_assistant_pb.AssistResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


// Service that implements the Google Assistant API.
var EmbeddedAssistantService = exports.EmbeddedAssistantService = {
  // Initiates or continues a conversation with the embedded Assistant Service.
  // Each call performs one round-trip, sending an audio request to the service
  // and receiving the audio response. Uses bidirectional streaming to receive
  // results, such as the `END_OF_UTTERANCE` event, while sending audio.
  //
  // A conversation is one or more gRPC connections, each consisting of several
  // streamed requests and responses.
  // For example, the user says *Add to my shopping list* and the Assistant
  // responds *What do you want to add?*. The sequence of streamed requests and
  // responses in the first gRPC message could be:
  //
  // *   AssistRequest.config
  // *   AssistRequest.audio_in
  // *   AssistRequest.audio_in
  // *   AssistRequest.audio_in
  // *   AssistRequest.audio_in
  // *   AssistResponse.event_type.END_OF_UTTERANCE
  // *   AssistResponse.speech_results.transcript "add to my shopping list"
  // *   AssistResponse.dialog_state_out.microphone_mode.DIALOG_FOLLOW_ON
  // *   AssistResponse.audio_out
  // *   AssistResponse.audio_out
  // *   AssistResponse.audio_out
  //
  //
  // The user then says *bagels* and the Assistant responds
  // *OK, I've added bagels to your shopping list*. This is sent as another gRPC
  // connection call to the `Assist` method, again with streamed requests and
  // responses, such as:
  //
  // *   AssistRequest.config
  // *   AssistRequest.audio_in
  // *   AssistRequest.audio_in
  // *   AssistRequest.audio_in
  // *   AssistResponse.event_type.END_OF_UTTERANCE
  // *   AssistResponse.dialog_state_out.microphone_mode.CLOSE_MICROPHONE
  // *   AssistResponse.audio_out
  // *   AssistResponse.audio_out
  // *   AssistResponse.audio_out
  // *   AssistResponse.audio_out
  //
  // Although the precise order of responses is not guaranteed, sequential
  // `AssistResponse.audio_out` messages will always contain sequential portions
  // of audio.
  assist: {
    path: '/google.assistant.embedded.v1alpha2.EmbeddedAssistant/Assist',
    requestStream: true,
    responseStream: true,
    requestType: google_assistant_embedded_v1alpha2_embedded_assistant_pb.AssistRequest,
    responseType: google_assistant_embedded_v1alpha2_embedded_assistant_pb.AssistResponse,
    requestSerialize: serialize_google_assistant_embedded_v1alpha2_AssistRequest,
    requestDeserialize: deserialize_google_assistant_embedded_v1alpha2_AssistRequest,
    responseSerialize: serialize_google_assistant_embedded_v1alpha2_AssistResponse,
    responseDeserialize: deserialize_google_assistant_embedded_v1alpha2_AssistResponse,
  },
};

exports.EmbeddedAssistantClient = grpc.makeGenericClientConstructor(EmbeddedAssistantService);