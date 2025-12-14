export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
}

export enum CodecType {
  H264 = 'libx264',
  H265 = 'libx265',
  PRORES = 'prores_ks',
  VP9 = 'libvpx-vp9',
  AV1 = 'libaom-av1',
  COPY = 'copy'
}

export enum AudioCodecType {
  AAC = 'aac',
  MP3 = 'libmp3lame',
  OPUS = 'libopus', 
  COPY = 'copy',
  NONE = 'an'
}
 
export enum PresetType {
  ULTRAFAST = 'ultrafast',
  SUPERFAST = 'superfast',
  VERYFAST = 'veryfast',
  FASTER = 'faster',
  FAST = 'fast',
  MEDIUM = 'medium',
  SLOW = 'slow',
  SLOWER = 'slower',
  VERYSLOW = 'veryslow'
}

export interface ConversionOptions {
  container: string;
  videoCodec: CodecType;
  audioCodec: AudioCodecType;
  preset: PresetType;
  crf: number; // 0-51 quality
  scale: string; // e.g. "1920:-1" or "original"
  fps: string; // e.g. "30", "60" or "original"
}