import * as stream from "stream";
let messages = require('./googleapis/google/assistant/embedded/v1alpha1/embedded_assistant_pb');

class AudioConverter extends stream.Transform {
  public static MESSAGE_SIZE = 1024 * 16;  // 16 kB

  public buffer: Buffer;
  public offset: number;

  constructor() {
    super({ objectMode: true });
    this.buffer = new Buffer(AudioConverter.MESSAGE_SIZE);
    this.offset = 0;
  }
  
  public _transform(chunk: Buffer, enc: string, cb: (err?: Error) => void) {

    // The buffer is not empty. Attempt to append data to it.
    if(this.offset != 0) {
      let bytesNeeded = this.offset - chunk.length;

      // The chunk is larger than the remaining space in the buffer.
      if(chunk.length >= bytesNeeded) {

        // Slice up the chunk to fit the remaining space in the buffer. Append
        // it to the buffer.
        let nibble = chunk.slice(0, bytesNeeded);
        chunk = chunk.slice(bytesNeeded, chunk.length);
        this.buffer = Buffer.concat([this.buffer, nibble]);

        // Convert the buffer to a ConverseRequest message.
        this._chunkToRequest(this.buffer);

        // Reset buffer for the next request
        this.offset = 0;
        this.buffer = new Buffer(AudioConverter.MESSAGE_SIZE);
      }

      // The chunk will not fill up the buffer to the max length. Append it.
      else {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        this.offset += chunk.length;
      }
    }

    // The buffer is empty. Attempt to send the chunk as a whole, or else fill
    // up the buffer.
    if(this.offset == 0) {
      let nibble = this._chunkToRequest(chunk);

      // Fill up the buffer with the remaining data.
      if(nibble.length) {
        this.buffer = Buffer.concat([this.buffer, nibble]);
        this.offset += nibble.length;
      }
    }

    return cb(null);
  }

  public _flush(done: () => void) {
    if(this.offset) {
      this.push(this.buffer.slice(0, this.offset));
      done();
    }
  }

  private _chunkToRequest(chunk: Buffer) {
    let offset = 0;
    let size = chunk.length;
    let requestSize = AudioConverter.MESSAGE_SIZE;

    while(size >= requestSize) {
      let nibble = chunk.slice(offset, offset + requestSize);

      let request = new messages.ConverseRequest(); 
      request.setAudioIn(nibble);
      this.push(request);

      offset += requestSize;
      size -= requestSize;
    }

    return chunk.slice(offset, offset + size);
  }
}

export default AudioConverter;
