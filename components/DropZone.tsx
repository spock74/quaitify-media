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
      className={`
        relative group border-2 border-dashed rounded-2xl p-6 md:p-10 text-center transition-all duration-300
        ${isDragging ? 'border-accent bg-accent/5 scale-[1.01]' : error ? 'border-red-500 bg-red-500/5' : 'border-gray-700 hover:border-gray-500 bg-surface/50'}
      `} 
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleInputChange}
        accept="video/*,image/*,.mov,.mkv,.mp4,.avi,.webm"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full bg-surface border transition-colors ${
          error ? 'border-red-500 text-red-500' : 
          isDragging ? 'border-accent text-accent' : 
          'border-gray-700 text-gray-400'
        }`}>
           {error ? <AlertCircle size={32} /> : (isDragging ? <FileVideo size={32} /> : <UploadCloud size={32} />)}
        </div>
        <div>
          <h3 className={`text-lg font-medium mb-1 ${error ? 'text-red-400' : 'text-white'}`}>
            {error ? 'Erro no Arquivo' : 'Arraste e Solte o Arquivo'}
          </h3>
          <p className={`text-sm mb-4 ${error ? 'text-red-300/70' : 'text-gray-500'}`}>
            {error || (
              <>
                ou <label htmlFor="file-upload" className="text-accent hover:text-cyan-300 cursor-pointer font-medium hover:underline">navegue pelos arquivos</label> no seu Mac
              </>
            )}
          </p>
          {!error && (
            <p className="text-xs text-gray-600 hidden md:block">
              Suporta .MOV, .MP4, .MKV, .AVI e mais
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropZone;