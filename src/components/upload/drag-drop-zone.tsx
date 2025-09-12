import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  File,
  Check,
  AlertCircle,
  Camera,
  Folder
} from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface DragDropZoneProps {
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadComplete?: (fileId: string, url: string) => void;
  onUploadError?: (fileId: string, error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  uploadedFiles?: UploadedFile[];
  className?: string;
  disabled?: boolean;
  showPreviews?: boolean;
  allowMultiple?: boolean;
  compact?: boolean;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  onFilesAdded,
  onFileRemove,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/*', 'video/*'],
  uploadedFiles = [],
  className,
  disabled = false,
  showPreviews = true,
  allowMultiple = true,
  compact = false
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsDragActive(false);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessage = errors.map((e: any) => e.message).join(', ');
        onUploadError?.(file.name, errorMessage);
      });
    }

    // Check if we would exceed max files
    const totalFiles = uploadedFiles.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      const allowedCount = maxFiles - uploadedFiles.length;
      if (allowedCount > 0) {
        onFilesAdded(acceptedFiles.slice(0, allowedCount));
        onUploadError?.('excess-files', `Maximum ${maxFiles} files allowed. Only first ${allowedCount} files will be uploaded.`);
      } else {
        onUploadError?.('max-files-reached', `Maximum ${maxFiles} files already uploaded.`);
      }
    } else {
      onFilesAdded(acceptedFiles);
    }
  }, [uploadedFiles.length, maxFiles, onFilesAdded, onUploadError]);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: allowMultiple,
    disabled
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-6 h-6" />;
    if (file.type.startsWith('video/')) return <Video className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const borderColor = isDragAccept ? 'border-green-500' : 
                     isDragReject ? 'border-red-500' : 
                     isDragActive ? 'border-primary' : 'border-dashed border-border';

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "relative p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            borderColor,
            disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
            "text-center"
          )}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          <div className="flex items-center justify-center gap-3">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </span>
            <Button variant="outline" size="sm" type="button">
              Browse
            </Button>
          </div>
        </div>

        {showPreviews && uploadedFiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedFiles.map((uploadedFile) => (
              <FilePreview
                key={uploadedFile.id}
                uploadedFile={uploadedFile}
                onRemove={() => onFileRemove(uploadedFile.id)}
                compact
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative p-8 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
          borderColor,
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-muted/20",
          "text-center"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "p-4 rounded-full",
              isDragActive ? "bg-primary/20" : "bg-muted/50"
            )}>
              <Upload className={cn(
                "w-8 h-8",
                isDragActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive ? 'Drop your files here' : 'Upload files'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop files here, or{' '}
              <Button variant="link" className="p-0 h-auto" onClick={handleBrowseClick}>
                browse your device
              </Button>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports {acceptedFileTypes.join(', ')} up to {Math.round(maxFileSize / 1024 / 1024)}MB each
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <Button variant="outline" onClick={handleBrowseClick} className="gap-2">
              <Folder className="w-4 h-4" />
              Browse Files
            </Button>
            <Button variant="outline" className="gap-2" disabled>
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {showPreviews && uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uploadedFiles.map((uploadedFile) => (
              <FilePreview
                key={uploadedFile.id}
                uploadedFile={uploadedFile}
                onRemove={() => onFileRemove(uploadedFile.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// File preview component
interface FilePreviewProps {
  uploadedFile: UploadedFile;
  onRemove: () => void;
  compact?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  uploadedFile, 
  onRemove, 
  compact = false 
}) => {
  const { file, preview, progress, status, error } = uploadedFile;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative group"
      >
        <Card className="p-2 hover:shadow-md transition-shadow">
          <div className="aspect-square bg-muted rounded overflow-hidden mb-2">
            {preview ? (
              <img src={preview} alt={file.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <File className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="text-xs truncate">{file.name}</div>
          
          {status === 'uploading' && (
            <Progress value={progress} className="h-1 mt-1" />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          >
            <X className="w-3 h-3" />
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* File icon or preview */}
          <div className="flex-shrink-0">
            {preview ? (
              <img 
                src={preview} 
                alt={file.name} 
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                <File className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* File info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium truncate">{file.name}</p>
              {status === 'success' && <Check className="w-4 h-4 text-green-500" />}
              {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            
            {status === 'uploading' && (
              <div className="mt-2 space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{progress}% uploaded</p>
              </div>
            )}
            
            {status === 'error' && error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};