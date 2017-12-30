import { AudioInOptions, AudioOutOptions, DeviceOptions } from "./options";

export interface AudioInConfig extends AudioInOptions {
  setEncoding(encoding: number): void
  setSampleRateHertz(encoding: number): void
}

export interface AudioOutConfig extends AudioOutOptions, AudioInConfig {
  setVolumePercentage(percentage: number): void
}

export interface DialogStateIn {
  conversationState: Array<number> | null
  languageCode: string | null
  setLanguageCode(languageCode: string): void
  setConversationState(state: Array<number> | null): void
}

export interface DeviceConfig extends DeviceOptions {
  setDeviceId(id: string): void;
  setDeviceModelId(id: string): void;
}

export interface AssistantConfig {
  output: AudioOutOptions
  input?: AudioInOptions
  device: DeviceOptions
  languageCode: string
}

export interface AssistConfig {
  setAudioInConfig(config: AudioInConfig): void
  setAudioOutConfig(config: AudioOutConfig): void
  setDialogStateIn(state: DialogStateIn): void
  setDeviceConfig(config: DeviceConfig): void
  setTextQuery(value: string): void
  clearAudioInConfig(): void
  clearTextQuery(): void
}
