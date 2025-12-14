import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  }, [onFileSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
        ${isDragging ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-gray-700 hover:border-gray-500 bg-surface/50'}
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
        <div className={`p-4 rounded-full bg-surface border border-gray-700 transition-colors ${isDragging ? 'text-accent' : 'text-gray-400'}`}>
           {isDragging ? <FileVideo size={32} /> : <UploadCloud size={32} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-1">
            Arraste e Solte o Arquivo
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            ou <label htmlFor="file-upload" className="text-accent hover:text-cyan-300 cursor-pointer font-medium hover:underline">navegue pelos arquivos</label> no seu Mac
          </p>
          <p className="text-xs text-gray-600">
            Suporta .MOV, .MP4, .MKV, .AVI e mais
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;