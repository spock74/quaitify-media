import { CodecType, AudioCodecType, PresetType } from './types';

export const TOOLTIPS = {
  container: "A extensão do arquivo/formato do contêiner para a saída (ex: .mp4, .mkv, .mov).",
  videoCodec: `O algoritmo responsável por comprimir o vídeo.

• H.264 (AVC): O padrão universal.
  (+) Compatível com tudo (TVs, Web, Celulares antigos). Conversão rápida.
  (-) Arquivos maiores que H.265 para a mesma qualidade.

• H.265 (HEVC): Alta eficiência moderna.
  (+) Gera arquivos até 50% menores que H.264.
  (-) Conversão muito lenta. Requer hardware recente para rodar suavemente.

• ProRes: Formato profissional da Apple.
  (+) Edição fluida, sem perda visual perceptível.
  (-) Arquivos gigantescos. Não serve para envio web/whatsapp.

• VP9: Padrão Web/Google.
  (+) Alta qualidade, gratuito, ótimo para streaming.
  (-) Menos suporte em editores de vídeo antigos.

• Copy: Não recodifica.
  (+) Instantâneo. Apenas troca o "envelope" (ex: MKV para MP4).`,

  audioCodec: `O algoritmo responsável por comprimir o áudio.

• AAC: O padrão para vídeos MP4.
  (+) Excelente qualidade com tamanhos pequenos. Amplamente compatível.

• MP3: O clássico do áudio.
  (+) Roda em qualquer coisa (até torradeiras).
  (-) Menos eficiente que AAC (qualidade inferior no mesmo tamanho).

• Copy (Copiar):
  (+) Mantém o áudio original bit-a-bit (Lossless se a fonte for boa).
  (-) Pode ser incompatível com alguns containers.

• Nenhum:
  (+) Remove a faixa de áudio completamente (Mudo).`,
  
  preset: "Compromisso entre velocidade de codificação e eficiência de compressão. 'Slow' produz arquivos menores mas demora mais. 'Ultrafast' é rápido mas gera arquivos maiores.",
  crf: "Fator de Taxa Constante (Constant Rate Factor). Valores menores significam melhor qualidade mas arquivos maiores. 18-28 é a faixa recomendada. 23 é o padrão.",
  scale: "Redimensionar o vídeo. 'Original' mantém as dimensões. '1080p' dimensiona a altura para 1080 pixels mantendo a proporção.",
  fps: "Quadros por segundo. Reduzir para 24fps ou 30fps pode economizar espaço. Aumentar não melhora a qualidade se a fonte já for baixa."
};

export const INITIAL_OPTIONS = {
  container: 'mp4',
  videoCodec: CodecType.H264,
  audioCodec: AudioCodecType.AAC,
  preset: PresetType.MEDIUM,
  crf: 23,
  scale: 'original',
  fps: 'original'
};