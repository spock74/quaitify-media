import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    // Check MIME type first
    if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
      return true;
    }
    
    // Fallback to extension check for files where OS might not set MIME type correctly
    const fileName = file.name.toLowerCase();
    const validExtensions = [
      '.mov', '.mkv', '.mp4', '.avi', '.webm', '.flv', '.wmv', '.m4v', 
      '.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.bmp', '.tiff'
    ];
    
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
      setError(null); // Reset error when user starts dragging a new file
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setError(null);
        onFileSelected(file);
      } else {
        setError('Arquivo não suportado. Por favor, envie um vídeo ou imagem.');
      }
    }
  }, [onFileSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setError(null);
        onFileSelected(file);
      } else {
        setError('Arquivo não suportado. Por favor, envie um vídeo ou imagem.');
      }
    }
    // Reset input so same file can be selected again if needed, or if error occurred
    e.target.value = '';
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
      className={`
        relative group border-2 border-dashed rounded-2xl p-4 md:p-10 text-center transition-all duration-300 cursor-pointer
        ${isDragging ? 'border-accent bg-accent/5 scale-[1.01]' : error ? 'border-red-500 bg-red-500/5' : 'border-gray-700 hover:border-gray-500 bg-surface/50 active:bg-surface/80'}
      `} 
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleInputChange}
        accept="video/*,image/*,.mov,.mkv,.mp4,.avi,.webm"
      />
      
      <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
        <div className={`p-3 md:p-4 rounded-full bg-surface border transition-colors ${
          error ? 'border-red-500 text-red-500' : 
          isDragging ? 'border-accent text-accent' : 
          'border-gray-700 text-gray-400 group-hover:text-white'
        }`}>
           {error ? <AlertCircle size={28} className="md:w-8 md:h-8" /> : (isDragging ? <FileVideo size={28} className="md:w-8 md:h-8" /> : <UploadCloud size={28} className="md:w-8 md:h-8" />)}
        </div>
        <div>
          <h3 className={`text-base md:text-lg font-medium mb-1 ${error ? 'text-red-400' : 'text-white'}`}>
            {error ? 'Erro no Arquivo' : 'Selecione o Arquivo'}
          </h3>
          <p className={`text-sm ${error ? 'text-red-300/70' : 'text-gray-500'}`}>
            {error || (
              <>
                <span className="md:hidden">Toque para buscar na galeria</span>
                <span className="hidden md:inline">Arraste e solte ou <span className="text-accent hover:underline">navegue</span></span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;