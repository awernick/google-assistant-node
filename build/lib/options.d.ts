export interface AudioInOptions {
    encoding: number;
    sampleRateHertz: number;
}
export interface AudioOutOptions extends AudioInOptions {
    volumePercentage: number;
}
export interface DeviceOptions {
    deviceId: string;
    deviceModelId: string;
}
