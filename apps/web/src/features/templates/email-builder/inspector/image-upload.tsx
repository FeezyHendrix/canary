import { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    key: string;
    filename: string;
    contentType: string;
    size: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const uploadFile = async (file: File): Promise<void> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/uploads/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      if (data.data?.url) {
        onChange(data.data.url);
        toast({ title: 'Image uploaded successfully' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      toast({ title: message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    } else {
      toast({ title: 'Please drop an image file', variant: 'destructive' });
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showUrlInput ? 'Upload' : 'Enter URL'}
        </button>
      </div>

      {showUrlInput ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {value ? (
            <div className="relative group">
              <img
                src={value}
                alt="Preview"
                className="w-full h-32 object-contain rounded-lg bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button type="button" size="sm" variant="secondary" asChild>
                    <span>Replace</span>
                  </Button>
                </label>
                <Button type="button" size="sm" variant="destructive" onClick={handleClear}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer block p-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isDragging ? (
                  <ImageIcon className="h-8 w-8" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isUploading
                      ? 'Uploading...'
                      : isDragging
                        ? 'Drop image here'
                        : 'Drop image or click to upload'}
                  </p>
                  <p className="text-xs">PNG, JPG, GIF, WebP up to 5MB</p>
                </div>
              </div>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
