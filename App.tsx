import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Settings, Terminal, CheckCircle2, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import Background3D, { AnimationVariant } from './components/Background3D';
import DropZone from './components/DropZone';
import InfoTooltip from './components/InfoTooltip';
import { FileMetadata, ConversionOptions, CodecType, AudioCodecType, PresetType } from './types';
import { TOOLTIPS, INITIAL_OPTIONS } from './constants';

const App: React.FC = () => {
  // CONFIGURATION: Developer can switch between 'sphere' and 'knot' here
  const animationVariant: AnimationVariant = 'knot'; 

  // Navigation State
  const [view, setView] = useState<'landing' | 'converter'>('landing');
  const [showScript, setShowScript] = useState(false);
  
  // Data State
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [options, setOptions] = useState<ConversionOptions>(INITIAL_OPTIONS);
  const [generatedCommand, setGeneratedCommand] = useState('');
  const [copied, setCopied] = useState(false);

  // Logic to process file selection
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
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

    // Sanitize filename: replace spaces and non-ascii characters with underscore
    const originalNameNoExt = file.name.substring(0, file.name.lastIndexOf('.'));
    const sanitizedBaseName = originalNameNoExt
      .replace(/\s+/g, '_') // Replace spaces
      .replace(/[^\x00-\x7F]/g, '_'); // Replace non-ASCII

    const input = `"${file.name}"`;
    const outputName = `${sanitizedBaseName}_converted.${options.container}`;
    const output = `"${outputName}"`;

    const parts = ['ffmpeg', '-i', input];

    // Video Codec
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

    // Audio
    if (options.removeAudio) {
      parts.push('-an');
    } else {
      parts.push('-c:a', options.audioCodec);
    }

    // Strict standard for certain codecs
    if (options.audioCodec === AudioCodecType.AAC) {
       parts.push('-movflags', '+faststart');
    }

    parts.push(output);

    setGeneratedCommand(parts.join(' '));
    setShowScript(true);
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
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-accent/30 selection:text-white overflow-hidden flex flex-col">
      
      {/* Landing View Background - Only visible on landing */}
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

      {/* LANDING PAGE HEADER - Only on landing */}
      <AnimatePresence>
        {view === 'landing' && (
          <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-20 w-full p-8 flex justify-between items-center max-w-7xl mx-auto"
          >
            {/* Left Spacer / Invisible Logo to balance layout if needed, or just empty */}
            <div className="w-24"></div>

            {/* Center Links */}
            <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Ajuda</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contato</a>
            </div>

            {/* Right Button */}
            <div className="w-24 flex justify-end">
              <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                Entrar
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>


      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Converter Header */}
        {view === 'converter' && (
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full p-6 border-b border-gray-800 bg-background/80 backdrop-blur-md flex justify-between items-center"
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
              className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-[-80px]" // Negative margin to center vertically accounting for header
            >
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-10 drop-shadow-2xl">
                Quantizer
              </h1>
              
              <button
                onClick={() => setView('converter')}
                className="group relative px-10 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-15px_rgba(255,255,255,0.4)]"
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
              className="flex-1 container mx-auto max-w-5xl p-6 md:p-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Input & Info */}
                <div className="lg:col-span-5 space-y-6">
                  <DropZone onFileSelected={handleFileSelect} />
                  
                  {metadata && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-surface rounded-xl p-6 border border-gray-800"
                    >
                      <h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Análise</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">Nome do Arquivo</span>
                          <span className="text-gray-200 text-sm font-medium truncate max-w-[200px]">{metadata.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">Tamanho</span>
                          <span className="text-gray-200 text-sm font-mono">{formatSize(metadata.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">Tipo</span>
                          <span className="text-gray-200 text-sm">{metadata.type}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500 text-sm">Extensão</span>
                           <span className="text-accent text-sm font-mono uppercase">.{metadata.extension}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* RIGHT COLUMN: Configuration */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Removing overflow-hidden to allow tooltips to show */}
                  <div className="bg-surface rounded-xl border border-gray-800 p-6 md:p-8 relative">
                    {!file && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl">
                        <p className="text-gray-500 font-mono text-sm">Importe um arquivo para configurar as opções</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-8">
                      <Settings className="text-white" size={24} />
                      <h2 className="text-xl font-semibold">Matriz de Conversão</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Container */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Formato de Destino <InfoTooltip text={TOOLTIPS.container} /></label>
                        <select 
                          className="w-full bg-background border border-gray-700 rounded-lg p-3 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
                          value={options.container}
                          onChange={(e) => setOptions({...options, container: e.target.value})}
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
                        <label className="text-xs text-gray-500 font-mono uppercase">Codec de Vídeo <InfoTooltip text={TOOLTIPS.videoCodec} /></label>
                        <select 
                          className="w-full bg-background border border-gray-700 rounded-lg p-3 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none"
                          value={options.videoCodec}
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
                        <label className="text-xs text-gray-500 font-mono uppercase">Velocidade de Codificação <InfoTooltip text={TOOLTIPS.preset} /></label>
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

                       {/* Audio Codec */}
                       <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-mono uppercase">Codec de Áudio <InfoTooltip text={TOOLTIPS.audioCodec} /></label>
                        <select 
                          className="w-full bg-background border border-gray-700 rounded-lg p-3 text-sm focus:border-white focus:ring-1 focus:ring-white outline-none"
                          value={options.audioCodec}
                          disabled={options.removeAudio}
                          onChange={(e) => setOptions({...options, audioCodec: e.target.value as AudioCodecType})}
                        >
                          <option value={AudioCodecType.AAC}>AAC</option>
                          <option value={AudioCodecType.MP3}>MP3</option>
                          <option value={AudioCodecType.COPY}>Copiar Original</option>
                        </select>
                      </div>

                      {/* Toggles */}
                      <div className="space-y-2 flex flex-col justify-end">
                         <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-white rounded border-gray-600 focus:ring-white bg-transparent"
                              checked={options.removeAudio}
                              onChange={(e) => setOptions({...options, removeAudio: e.target.checked})}
                            />
                            <span className="text-sm">Remover Faixa de Áudio</span>
                            <InfoTooltip text={TOOLTIPS.removeAudio} />
                         </label>
                      </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                      <button 
                        onClick={generateScript}
                        disabled={!file}
                        className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-8 rounded-lg shadow-lg active:transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                         <FileCode size={20} />
                         Gerar Comando
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
                className="bg-[#1e1e1e] border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="p-4 bg-[#252525] border-b border-gray-700 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <Terminal size={18} className="text-gray-400" />
                      <span className="font-mono text-sm font-medium">Comando do Terminal</span>
                   </div>
                   <button onClick={() => setShowScript(false)} className="text-gray-500 hover:text-white">&times;</button>
                </div>

                <div className="p-6">
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