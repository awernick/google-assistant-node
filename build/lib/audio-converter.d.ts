/// <reference types="node" />
import * as stream from "stream";
declare class AudioConverter extends stream.Transform {
    constructor();
    _transform(chunk: any, enc: string, cb: (err?: Error) => void): void;
}
export default AudioConverter;
