
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  preview?: string;
  error?: string;
  url?: string;
}

export interface MediaAnalytics {
  totalFiles: number;
  totalUploads: number;
  storageUsed: number;
  storageUsage: number;
  bandwidthUsed: number;
  bandwidthUsage: number;
  fileTypes: {
    images: number;
    videos: number;
    audio: number;
    documents: number;
  };
  moderationStats: {
    approved: number;
    rejected: number;
    pending: number;
    flagged: number;
  };
  uploadTrends: {
    date: string;
    uploads: number;
    storage: number;
  }[];
}

export interface ModerationItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  ai_analysis?: {
    adult_content: boolean;
    violence: boolean;
    medical: boolean;
    copyright_concern: boolean;
    confidence_score: number;
  };
  admin_notes?: string;
  file_url: string;
  thumbnail_url?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
}

export interface MediaUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}
