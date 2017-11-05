/**
 * @fileoverview
 * @enhanceable
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var google_api_annotations_pb = require('../../../../google/api/annotations_pb.js');
goog.exportSymbol('proto.google.api.servicecontrol.v1.CheckError', null, global);
goog.exportSymbol('proto.google.api.servicecontrol.v1.CheckError.Code', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.google.api.servicecontrol.v1.CheckError = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.google.api.servicecontrol.v1.CheckError, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.google.api.servicecontrol.v1.CheckError.displayName = 'proto.google.api.servicecontrol.v1.CheckError';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.google.api.servicecontrol.v1.CheckError.prototype.toObject = function(opt_includeInstance) {
  return proto.google.api.servicecontrol.v1.CheckError.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.google.api.servicecontrol.v1.CheckError} msg The msg instance to transform.
 * @return {!Object}
 */
proto.google.api.servicecontrol.v1.CheckError.toObject = function(includeInstance, msg) {
  var f, obj = {
    code: jspb.Message.getFieldWithDefault(msg, 1, 0),
    detail: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.google.api.servicecontrol.v1.CheckError}
 */
proto.google.api.servicecontrol.v1.CheckError.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.google.api.servicecontrol.v1.CheckError;
  return proto.google.api.servicecontrol.v1.CheckError.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.google.api.servicecontrol.v1.CheckError} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.google.api.servicecontrol.v1.CheckError}
 */
proto.google.api.servicecontrol.v1.CheckError.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.google.api.servicecontrol.v1.CheckError.Code} */ (reader.readEnum());
      msg.setCode(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDetail(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.google.api.servicecontrol.v1.CheckError.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.google.api.servicecontrol.v1.CheckError.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.google.api.servicecontrol.v1.CheckError} message
 * @param {!jspb.BinaryWriter} writer
 */
proto.google.api.servicecontrol.v1.CheckError.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCode();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getDetail();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.google.api.servicecontrol.v1.CheckError.Code = {
  ERROR_CODE_UNSPECIFIED: 0,
  NOT_FOUND: 5,
  PERMISSION_DENIED: 7,
  RESOURCE_EXHAUSTED: 8,
  SERVICE_NOT_ACTIVATED: 104,
  BILLING_DISABLED: 107,
  PROJECT_DELETED: 108,
  PROJECT_INVALID: 114,
  IP_ADDRESS_BLOCKED: 109,
  REFERER_BLOCKED: 110,
  CLIENT_APP_BLOCKED: 111,
  API_KEY_INVALID: 105,
  API_KEY_EXPIRED: 112,
  API_KEY_NOT_FOUND: 113,
  NAMESPACE_LOOKUP_UNAVAILABLE: 300,
  SERVICE_STATUS_UNAVAILABLE: 301,
  BILLING_STATUS_UNAVAILABLE: 302
};

/**
 * optional Code code = 1;
 * @return {!proto.google.api.servicecontrol.v1.CheckError.Code}
 */
proto.google.api.servicecontrol.v1.CheckError.prototype.getCode = function() {
  return /** @type {!proto.google.api.servicecontrol.v1.CheckError.Code} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.google.api.servicecontrol.v1.CheckError.Code} value */
proto.google.api.servicecontrol.v1.CheckError.prototype.setCode = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional string detail = 2;
 * @return {string}
 */
proto.google.api.servicecontrol.v1.CheckError.prototype.getDetail = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.google.api.servicecontrol.v1.CheckError.prototype.setDetail = function(value) {
  jspb.Message.setField(this, 2, value);
};


goog.object.extend(exports, proto.google.api.servicecontrol.v1);
