
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Video, 
  X, 
  MapPin, 
  Hash, 
  Send,
  RotateCcw,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { QuickCaptureData } from '@/types/stories';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuickCaptureData) => Promise<void>;
}

export const QuickCapture: React.FC<QuickCaptureProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [step, setStep] = useState<'capture' | 'edit'>('capture');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Get user location
  useEffect(() => {
    if (isOpen && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get location name
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=your-mapbox-token`
            );
            const data = await response.json();
            const placeName = data.features?.[0]?.place_name || 'Current Location';
            
            setLocation({
              latitude,
              longitude,
              name: placeName
            });
          } catch (error) {
            setLocation({
              latitude,
              longitude,
              name: 'Current Location'
            });
          }
        },
        (error) => {
          console.warn('Could not get location:', error);
        }
      );
    }
  }, [isOpen]);

  // Initialize camera
  useEffect(() => {
    if (isOpen && step === 'capture') {
      initializeCamera();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, step]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: mediaType === 'video'
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        setCapturedMedia(file);
        setMediaPreview(URL.createObjectURL(blob));
        setStep('edit');
      }
    }, 'image/jpeg', 0.8);
  }, []);

  const startVideoRecording = useCallback(() => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: 'video/webm'
      });
      
      const file = new File([blob], `capture-${Date.now()}.webm`, {
        type: 'video/webm'
      });
      
      setCapturedMedia(file);
      setMediaPreview(URL.createObjectURL(blob));
      setStep('edit');
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Auto-stop after 30 seconds
    setTimeout(() => {
      if (isRecording) {
        stopVideoRecording();
      }
    }, 30000);
  }, [isRecording]);

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const addHashtag = (tag: string) => {
    const cleanTag = tag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanTag && !hashtags.includes(cleanTag)) {
      setHashtags(prev => [...prev, cleanTag]);
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!capturedMedia || !location) return;

    setSubmitting(true);
    
    try {
      await onSubmit({
        media: capturedMedia,
        mediaType,
        location,
        caption,
        hashtags
      });
      
      // Reset form
      setCapturedMedia(null);
      setMediaPreview('');
      setCaption('');
      setHashtags([]);
      setStep('capture');
      onClose();
    } catch (error) {
      console.error('Failed to submit story:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const retake = () => {
    setCapturedMedia(null);
    setMediaPreview('');
    setStep('capture');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50"
      >
        {step === 'capture' && (
          <div className="relative h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            
            <canvas ref={canvasRef} className="hidden" />

            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="flex gap-2">
                <Button
                  variant={mediaType === 'image' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMediaType('image')}
                  className="text-white"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant={mediaType === 'video' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMediaType('video')}
                  className="text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
              </div>
            </div>

            {/* Location indicator */}
            {location && (
              <div className="absolute top-16 left-4 flex items-center gap-1 bg-black/50 rounded-full px-3 py-1">
                <MapPin className="w-4 h-4 text-white" />
                <span className="text-white text-sm">{location.name}</span>
              </div>
            )}

            {/* Capture controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              {mediaType === 'image' ? (
                <Button
                  size="lg"
                  onClick={captureImage}
                  className="w-16 h-16 rounded-full bg-white hover:bg-gray-100"
                >
                  <Camera className="w-8 h-8 text-black" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={isRecording ? stopVideoRecording : startVideoRecording}
                  className={`w-16 h-16 rounded-full ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {isRecording ? (
                    <div className="w-6 h-6 bg-white rounded-sm" />
                  ) : (
                    <Video className="w-8 h-8 text-black" />
                  )}
                </Button>
              )}
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center gap-2 bg-red-500 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold">REC</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'edit' && (
          <div className="relative h-full flex flex-col">
            {/* Media preview */}
            <div className="flex-1 relative">
              {mediaType === 'image' ? (
                <img
                  src={mediaPreview}
                  alt="Captured"
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="h-full w-full object-cover"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Edit controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={retake}
                className="text-white hover:bg-white/10"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Caption and hashtags */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="space-y-4">
                <Textarea
                  placeholder="What's happening?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70 resize-none"
                  rows={3}
                />

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-white" />
                  <Input
                    placeholder="Add hashtag"
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        addHashtag(currentHashtag);
                      }
                    }}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  />
                </div>

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer"
                        onClick={() => removeHashtag(tag)}
                      >
                        #{tag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {location ? location.name : 'Getting location...'}
                  </span>
                  {!location && (
                    <span className="text-red-300 text-xs ml-2">Location required</span>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !caption.trim() || !location}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sharing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Share Story
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
