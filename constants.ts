import { CodecType, AudioCodecType, PresetType } from './types';

export const TOOLTIPS = {
  container: "A extensão do arquivo/formato do contêiner para a saída (ex: .mp4, .mkv, .mov).",
  videoCodec: "O codificador usado para comprimir o fluxo de vídeo. H.264 é amplamente compatível; H.265 oferece melhor compressão mas requer hardware mais recente.",
  audioCodec: "O codificador para o fluxo de áudio. AAC é padrão para MP4. 'Copiar' preserva o áudio original sem recodificação.",
  preset: "Compromisso entre velocidade de codificação e eficiência de compressão. 'Slow' produz arquivos menores mas demora mais. 'Ultrafast' é rápido mas gera arquivos maiores.",
  crf: "Fator de Taxa Constante (Constant Rate Factor). Valores menores significam melhor qualidade mas arquivos maiores. 18-28 é a faixa recomendada. 23 é o padrão.",
  scale: "Redimensionar o vídeo. 'Original' mantém as dimensões. '1080p' dimensiona a altura para 1080 pixels mantendo a proporção.",
  fps: "Quadros por segundo. Reduzir para 24fps ou 30fps pode economizar espaço. Aumentar não melhora a qualidade se a fonte já for baixa.",
  removeAudio: "Remove completamente a faixa de áudio do arquivo."
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