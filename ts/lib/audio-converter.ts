import * as stream from "stream";
let messages = require('./googleapis/google/assistant/embedded/v1alpha2/embedded_assistant_pb');

class AudioConverter extends stream.Transform {
  constructor() {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, enc: string, cb: (err?: Error) => void) {
    /** We're disabeling the transformation of data for now to see how Google response to it */
    /** 
    var buff = Buffer.from(chunk)
    var offset = 0;
    var size = 1024 * 16;

    for(var i = 0; i < chunk.length / size; i++) {
      var nibble = buff.slice(offset, (offset + size));
      offset += size;
      var request = new messages.AssistRequest(); 
      request.setAudioIn(nibble);
      this.push(request);
    }

    return cb(null);

    */

    var request = new messages.AssistRequest(); 
    request.setAudioIn(chunk);
    this.push(request);
    console.log('Pushing chunk...');
  }
}

export default AudioConverter;
