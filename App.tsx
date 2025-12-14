import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Settings, Terminal, CheckCircle2, Copy, RefreshCw, AlertCircle, Play, Download, HardDrive, AlertTriangle } from 'lucide-react';
import Background3D, { AnimationVariant } from './components/Background3D';
import DropZone from './components/DropZone';
import InfoTooltip from './components/InfoTooltip';
import ProgressBar from './components/ProgressBar';
import { FileMetadata, ConversionOptions, CodecType, AudioCodecType, PresetType } from './types';
import { TOOLTIPS, INITIAL_OPTIONS } from './constants';

const App: React.FC = () => {
  // CONFIGURATION
  const animationVariant: AnimationVariant = 'knot'; 
  const MAX_FILE_SIZE_MB = 500; // Security: Limit client-side upload size
  // FIX: Acesso seguro ao import.meta.env para evitar crash em ambientes sem injeção do Vite
  const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Navigation State
  const [view, setView] = useState<'landing' | 'converter'>('landing');
  const [showScript, setShowScript] = useState(false);
  
  // Data State
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [options, setOptions] = useState<ConversionOptions>(INITIAL_OPTIONS);
  const [generatedCommand, setGeneratedCommand] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Conversion Workflow State
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'uploading' | 'estimating' | 'converting' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Logic to process file selection
  const handleFileSelect = (selectedFile: File) => {
    // Security Check: Size Limit
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      alert(`Arquivo muito grande! O limite para a versão web é ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
    setConversionStatus('idle');
    setProgress(0);
    setEstimatedSize(null);
    setDownloadUrl(null);
    setErrorMsg(null);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    
    setMetadata({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type || 'video/unknown',
      lastModified: selectedFile.lastModified,
      extension: ext
    });

    // Smart defaults based on input
    if (ext === 'mov') {
      setOptions(prev => ({ ...prev, container: 'mp4', videoCodec: CodecType.H264 }));
    } else if (ext === 'png' || ext === 'jpg') {
      setOptions(prev => ({ ...prev, container: 'webp', videoCodec: CodecType.COPY }));
    }
  };

  // Logic to generate FFmpeg string
  const generateScript = () => {
    if (!file) return;
    const sanitizedBaseName = getSanitizedName(file.name);
    const outputName = `${sanitizedBaseName}_converted.${options.container}`;
    
    const parts = ['ffmpeg', '-i', `"${file.name}"`];

    const isAudioOnlyContainer = options.container === 'mp3';

    // Video Codec Configuration
    if (isAudioOnlyContainer) {
      // If container is MP3, we must strip video
      parts.push('-vn');
    } else {
      if (options.videoCodec !== CodecType.COPY) {
         parts.push('-c:v', options.videoCodec);
         parts.push('-preset', options.preset);
         parts.push('-crf', options.crf.toString());
      } else {
         parts.push('-c:v', 'copy');
      }

      // Scaling
      if (options.scale !== 'original') {
        parts.push('-vf', `scale=${options.scale}`);
      }

      // FPS (Frame Rate)
      if (options.fps !== 'original') {
        parts.push('-r', options.fps);
      }
    }

    // Audio Configuration
    if (options.audioCodec === AudioCodecType.NONE) {
      if (isAudioOnlyContainer) {
         // Fallback safety: Cannot have no audio in an audio-only container
         parts.push('-c:a', 'libmp3lame'); 
      } else {
         parts.push('-an');
      }
    } else {
      parts.push('-c:a', options.audioCodec);
    }

    if (options.audioCodec === AudioCodecType.AAC && !isAudioOnlyContainer) {
       parts.push('-movflags', '+faststart');
    }

    parts.push(`"${outputName}"`);

    setGeneratedCommand(parts.join(' '));
    setShowScript(true);
  };

  const getSanitizedName = (fileName: string) => {
    const originalNameNoExt = fileName.substring(0, fileName.lastIndexOf('.'));
    return originalNameNoExt
      .replace(/\s+/g, '_')
      .replace(/[^\x00-\x7F]/g, '_');
  };

  // REAL API INTEGRATION
  const handleRealConversion = async () => {
    if (!file) return;
    setErrorMsg(null);
    
    try {
      // Step 1: Upload
      setConversionStatus('uploading');
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Falha no upload. Verifique conexão ou tamanho do arquivo.');
      
      const uploadData = await uploadResponse.json();
      const sessionId = uploadData.session_id;
      setProgress(100);

      // Step 2: Request Conversion
      setConversionStatus('converting'); // Skip estimating for now to simplify flow, or add separate endpoint
      setProgress(0);

      const convertResponse = await fetch(`${API_BASE_URL}/convert/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadData.filename,
          container: options.container,
          video_codec: options.container === 'mp3' ? 'none' : options.videoCodec, // Backend logic support needed or handled by ffmpeg args
          audio_codec: options.audioCodec === AudioCodecType.NONE ? 'aac' : options.audioCodec, 
          preset: options.preset,
          crf: options.crf,
          remove_audio: options.audioCodec === AudioCodecType.NONE,
          scale: options.scale !== 'original' ? options.scale : null,
          fps: options.fps !== 'original' ? options.fps : null
        })
      });

      if (!convertResponse.ok) {
        const errData = await convertResponse.json();
        throw new Error(errData.detail || 'Erro durante a conversão.');
      }

      const convertData = await convertResponse.json();
      
      // In a real WebSocket/SSE setup, we would stream progress here.
      // For REST, we assume the server waits (blocking) or we poll. 
      // Assuming the endpoint returns when done for this MVP.
      setProgress(100);
      
      // Step 3: Completion
      setConversionStatus('completed');
      
      // Construct full download URL
      const dlUrl = convertData.download_url.startsWith('http') 
        ? convertData.download_url 
        : `${API_BASE_URL.replace('/api/v1', '')}${convertData.download_url}`;
        
      setDownloadUrl(dlUrl);

    } catch (err) {
      console.error(err);
      setConversionStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Reset when leaving converter
  const resetApp = () => {
     setFile(null);
     setMetadata(null);
     setShowScript(false);
     setGeneratedCommand('');
     setConversionStatus('idle');
     setDownloadUrl(null);
     setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-accent/30 selection:text-white overflow-hidden flex flex-col">
      
      {/* Landing View Background */}
      <AnimatePresence>
        {view === 'landing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            <Background3D variant={animationVariant} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LANDING PAGE HEADER */}
      <AnimatePresence>
        {view === 'landing' && (
          <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-20 w-full p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto"
          >
            <div className="w-12 md:w-24"></div>
            <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Ajuda</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contato</a>
            </div>
            <div className="w-12 md:w-24 flex justify-end">
              <button className="bg-white text-black px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold hover:bg-gray-200 transition-colors">
                Entrar
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        
        {/* Converter Header */}
        {view === 'converter' && (
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full p-4 md:p-6 border-b border-gray-800 bg-background/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-40"
          >
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('landing'); resetApp(); }}>
              <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center">
                 <RefreshCw size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Quantizer</span>
            </div>
          </motion.header>
        )}

        <AnimatePresence mode="wait">
          
          {/* LANDING PAGE CONTENT */}
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.8 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-[-60px] md:mt-[-80px]"
            >
              <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-8 md:mb-10 drop-shadow-2xl">
                Quantizer
              </h1>
              <button
                onClick={() => setView('converter')}
                className="group relative px-8 py-3 md:px-10 md:py-4 bg-white text-black font-bold text-base md:text-lg rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-15px_rgba(255,255,255,0.4)]"
              >
                <span className="relative z-10">
                  Quantificar Arquivo
                </span>
              </button>
            </motion.div>
          )}

          {/* CONVERTER PAGE CONTENT */}
          {view === 'converter' && (
            <motion.div
              key="converter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              // Ajuste de altura e centralização vertical: min-h para preencher a tela menos o header
              className="flex-1 container mx-auto max-w-5xl p-4 md:p-8 flex flex-col justify-center min-h-[calc(100vh-80px)]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
                
                {/* LEFT COLUMN: Input & Info */}
                <div className="lg:col-span-5 space-y-4 md:space-y-6">
                  {conversionStatus === 'idle' ? (
                     <DropZone onFileSelected={handleFileSelect} />
                  ) : (
                    /* Active Conversion Status Card */
                    <div className="bg-surface/50 border border-gray-700 rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center text-center h-[250px] md:h-[300px] relative overflow-hidden">
                        {conversionStatus === 'error' && (
                           <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                             <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <AlertTriangle size={32} />
                             </div>
                             <h3 className="text-xl font-bold text-white">Erro</h3>
                             <p className="text-red-300 text-sm max-w-[250px] mx-auto">{errorMsg}</p>
                             <button 
                               onClick={() => setConversionStatus('idle')}
                               className="text-sm underline text-gray-400 hover:text-white"
                             >
                               Tentar novamente
                             </button>
                           </div>
                        )}
                        
                        {conversionStatus === 'completed' && (
                          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 size={32} />
                             </div>
                             <h3 className="text-xl font-bold text-white">Conversão Concluída!</h3>
                             <p className="text-gray-400 text-sm">Download pronto.</p>
                             {downloadUrl && (
                               <a 
                                 href={downloadUrl}
                                 download // Hint to browser
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-2 bg-accent hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-full mt-4 transition-colors"
                               >
                                 <Download size={18} />
                                 Baixar Arquivo
                               </a>
                             )}
                          </div>
                        )}
                        
                        {(conversionStatus === 'uploading' || conversionStatus === 'converting' || conversionStatus === 'estimating') && (
                          <div className="w-full max-w-xs space-y-6">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto">
                               <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                               <div className="absolute inset-0 border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            </div>
                            <div>
                              <h3 className="font-medium text-lg mb-1">
                                {conversionStatus === 'uploading' ? 'Enviando...' : 'Processando...'}
                              </h3>
                              <p className="text-xs text-gray-500 font-mono truncate max-w-[200px] mx-auto">{file?.name}</p>
                            </div>
                            <ProgressBar 
                              progress={progress} 
                              status={
                                conversionStatus === 'uploading' ? 'Upload ao servidor' :
                                conversionStatus === 'estimating' ? 'Estimando...' :
                                'Convertendo (FFmpeg)'
                              } 
                            />
                          </div>
                        )}
                    </div>
                  )}
                  
                  {metadata && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-surface rounded-xl p-4 md:p-6 border border-gray-800"
                    >
                      <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Análise</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">Nome</span>
                          <span className="text-gray-200 text-sm font-medium truncate max-w-[150px] md:max-w-[200px]">{metadata.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">Tamanho</span>
                          <span className="text-gray-200 text-sm font-mono">{formatSize(metadata.size)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">Tipo</span>
                          <span className="text-gray-200 text-sm truncate max-w-[120px]">{metadata.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-500 text-sm">Extensão</span>
                           <span className="text-accent text-sm font-mono uppercase">.{metadata.extension}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* RIGHT COLUMN: Configuration */}
                <div className="lg:col-span-7 space-y-6">
                  <div className={`bg-surface rounded-xl border border-gray-800 p-5 md:p-8 relative transition-opacity duration-300 ${conversionStatus !== 'idle' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {!file && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl p-4 text-center">
                        <p className="text-gray-500 font-mono text-sm">Importe um arquivo para configurar as opções</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <Settings className="text-white" size={24} />
                      <h2 className="text-lg md:text-xl font-semibold">Matriz de Conversão</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      
                      {/* Container */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Formato de Destino <InfoTooltip text={TOOLTIPS.container} /></label>
                        <select 
                          className="w-full bg-background border border-gray-700 rounded-lg p-3 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
                          value={options.container}
                          onChange={(e) => {
                            const newContainer = e.target.value;
                            const updates: Partial<ConversionOptions> = { container: newContainer };
                            
                            // Prevent AudioCodec.NONE if switching to MP3
                            if (newContainer === 'mp3' && options.audioCodec === AudioCodecType.NONE) {
                              updates.audioCodec = AudioCodecType.MP3;
                            }
                            
                            setOptions({...options, ...updates});
                          }}
                        >
                          <option value="mp4">MP4 (Universal)</option>
                          <option value="mov">MOV (macOS)</option>
                          <option value="mkv">MKV (Moderno)</option>
                          <option value="webm">WebM (Web)</option>
                          <option value="mp3">MP3 (Apenas Áudio)</option>
                        </select>
                      </div>

                      {/* Video Codec */}
                      <div className="space-y-2">
                        <label className={`text-xs text-gray-500 font-mono uppercase ${options.container === 'mp3' ? 'opacity-50' : ''}`}>
                           Codec de Vídeo <InfoTooltip text={TOOLTIPS.videoCodec} />
                        </label>
                        <select 
                          className="w-full bg-background border border-gray-700 rounded-lg p-3 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                          value={options.videoCodec}
                          disabled={options.container === 'mp3'}
                          onChange={(e) => setOptions({...options, videoCodec: e.target.value as CodecType})}
                        >
                          <option value={CodecType.H264}>H.264 (AVC)</option>
                          <option value={CodecType.H265}>H.265 (HEVC)</option>
                          <option value={CodecType.PRORES}>ProRes</option>
                          <option value={CodecType.VP9}>VP9</option>
                          <option value={CodecType.COPY}>Copiar (Sem Recodificação)</option>
                        </select>
                      </div>

                       {/* Preset */}
                       <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Velocidade <InfoTooltip text={TOOLTIPS.preset} /></label>
                        <select 
                          className="w-full bg-background border border-gray-700 rounded-lg p-3 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none"
                          value={options.preset}
                          onChange={(e) => setOptions({...options, preset: e.target.value as PresetType})}
                        >
                          <option value={PresetType.ULTRAFAST}>Ultrafast (Baixa Qualidade)</option>
                          <option value={PresetType.FAST}>Fast (Rápido)</option>
                          <option value={PresetType.MEDIUM}>Medium (Balanceado)</option>
                          <option value={PresetType.SLOW}>Slow (Alta Qualidade)</option>
                          <option value={PresetType.VERYSLOW}>Very Slow (Melhor Tamanho)</option>
                        </select>
                      </div>

                       {/* CRF */}
                       <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase flex justify-between">
                          <span>Qualidade (CRF) <InfoTooltip text={TOOLTIPS.crf} /></span>
                          <span className="text-accent">{options.crf}</span>
                        </label>
                        <input 
                          type="range" 
                          min="0" 
                          max="51" 
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                          value={options.crf}
                          onChange={(e) => setOptions({...options, crf: parseInt(e.target.value)})}
                        />
                      </div>

                      {/* FPS Control */}
                      <div className="space-y-2">
                        <label className={`text-xs text-gray-500 font-mono uppercase flex justify-between items-center ${options.container === 'mp3' ? 'opacity-50' : ''}`}>
                          <span className="flex items-center">FPS <InfoTooltip text={TOOLTIPS.fps} /></span>
                        </label>
                        
                        <div className={`bg-background border border-gray-700 rounded-lg p-3 flex flex-col gap-3 ${options.container === 'mp3' ? 'opacity-30 pointer-events-none' : ''}`}>
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={options.fps === 'original'}
                                onChange={(e) => setOptions({...options, fps: e.target.checked ? 'original' : '30'})}
                                className="w-4 h-4 text-accent rounded border-gray-600 focus:ring-accent bg-transparent"
                              />
                              <span className="text-sm text-gray-300">Original</span>
                           </label>
                           
                           {options.fps !== 'original' && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-3"
                              >
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="120" 
                                  step="1"
                                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                                  value={options.fps}
                                  onChange={(e) => setOptions({...options, fps: e.target.value})}
                                />
                                <span className="text-accent font-mono w-8 text-right text-xs">{options.fps}</span>
                              </motion.div>
                           )}
                        </div>
                      </div>

                       {/* Audio Codec */}
                       <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Codec de Áudio <InfoTooltip text={TOOLTIPS.audioCodec} /></label>
                        <select 
                          className="w-full bg-background border border-gray-700 rounded-lg p-3 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none"
                          value={options.audioCodec}
                          onChange={(e) => setOptions({...options, audioCodec: e.target.value as AudioCodecType})}
                        >
                          <option value={AudioCodecType.AAC}>AAC</option>
                          <option value={AudioCodecType.MP3}>MP3</option>
                          <option value={AudioCodecType.COPY}>Copiar Original</option>
                          <option value={AudioCodecType.NONE} disabled={options.container === 'mp3'}>
                             {options.container === 'mp3' ? 'Nenhum' : 'Nenhum (Remover Áudio)'}
                          </option>
                        </select>
                      </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row gap-4">
                      
                      <button 
                        onClick={generateScript}
                        disabled={!file}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full"
                      >
                         <FileCode size={20} className="text-gray-400" />
                         <span>Gerar Script</span>
                      </button>

                      <button 
                        onClick={handleRealConversion}
                        disabled={!file}
                        className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full"
                      >
                         <HardDrive size={20} />
                         <span>Processar (API)</span>
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* SCRIPT MODAL / OVERLAY */}
        <AnimatePresence>
          {showScript && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowScript(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1e1e1e] border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              > 
                <div className="p-4 bg-[#252525] border-b border-gray-700 flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-3">
                      <Terminal size={18} className="text-gray-400" />
                      <span className="font-mono text-sm font-medium">Comando do Terminal</span>
                   </div>
                   <button onClick={() => setShowScript(false)} className="text-gray-500 hover:text-white">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto">
                   <div className="flex items-start gap-3 mb-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                      <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                      <div className="text-sm text-blue-200">
                        <p className="mb-2"><strong>Modo Wrapper Quantizer:</strong></p>
                        <p>A conversão direta no navegador é limitada. Copie o comando abaixo e cole-o no seu Terminal para executar a conversão com desempenho total do sistema.</p>
                      </div>
                   </div>

                   <div className="relative group">
                     <pre className="bg-black p-6 rounded-lg font-mono text-sm text-green-400 overflow-x-auto whitespace-pre-wrap break-all border border-gray-800">
                       {generatedCommand}
                     </pre>
                     <button 
                        onClick={copyToClipboard}
                        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                      >
                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                     </button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;