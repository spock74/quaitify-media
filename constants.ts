import { CodecType, AudioCodecType, PresetType } from './types';

export const TOOLTIPS = {
  container: "The file extension/container format for the output (e.g., .mp4, .mkv, .mov).",
  videoCodec: "The encoder used to compress the video stream. H.264 is widely compatible; H.265 offers better compression but needs newer hardware.",
  audioCodec: "The encoder for the audio stream. AAC is standard for MP4. 'Copy' preserves original audio without re-encoding.",
  preset: "Trade-off between encoding speed and compression efficiency. 'Slow' produces smaller files but takes longer. 'Ultrafast' is quick but larger file size.",
  crf: "Constant Rate Factor. Lower values mean better quality but larger files. 18-28 is the sane range. 23 is default.",
  scale: "Resize the video. 'Original' keeps dimensions. '1080p' scales height to 1080 pixels while maintaining aspect ratio.",
  removeAudio: "Completely strips the audio track from the file."
};

export const INITIAL_OPTIONS = {
  container: 'mp4',
  videoCodec: CodecType.H264,
  audioCodec: AudioCodecType.AAC,
  preset: PresetType.MEDIUM,
  crf: 23,
  scale: 'original',
  fps: 'original',
  removeAudio: false
};