
export interface MediaFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  moderationReason?: string;
  uploader?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface MediaUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  autoCompress?: boolean;
  generateThumbnail?: boolean;
}

export interface MediaModerationResult {
  approved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
}

export interface MediaAnalytics {
  totalFiles: number;
  totalSize: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  byType: {
    images: number;
    videos: number;
    documents: number;
  };
  recentUploads: MediaFile[];
  topUploaders: {
    userId: string;
    username: string;
    uploadCount: number;
  }[];
}
