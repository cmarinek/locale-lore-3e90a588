
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  uploadedBy: string;
  uploadedAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationReason?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  metadata?: {
    duration?: number;
    format?: string;
    bitrate?: number;
    fps?: number;
  };
}

export interface MediaUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface MediaModerationResult {
  safe: boolean;
  categories: string[];
  confidence: number;
  flags: string[];
}

export interface MediaAnalytics {
  totalUploads: number;
  totalSize: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  storageUsage: number;
  bandwidthUsage: number;
}
