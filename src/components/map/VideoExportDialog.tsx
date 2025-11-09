import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Video, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VideoExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapContainer: HTMLElement | null;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const VideoExportDialog: React.FC<VideoExportDialogProps> = ({
  open,
  onOpenChange,
  mapContainer,
  isRecording,
  onStartRecording,
  onStopRecording
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!mapContainer) {
        toast.error('Map container not found');
        return;
      }

      // Setup audio context for speech synthesis
      audioContextRef.current = new AudioContext();
      audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();

      // Get screen capture stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        },
        audio: false
      });

      // Combine video stream with audio destination
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioDestinationRef.current.stream.getAudioTracks()
      ]);

      // Create media recorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        setRecordingState('processing');
        
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setVideoBlob(blob);
        setRecordingState('ready');
        
        // Stop all tracks
        combinedStream.getTracks().forEach(track => track.stop());
        
        toast.success('Video ready for download!');
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingState('error');
        toast.error('Recording failed');
      };

      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second
      setRecordingState('recording');
      setRecordingDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Notify parent to start animation
      onStartRecording();

      toast.success('Recording started! Play your animation now.');
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingState('error');
      toast.error('Failed to start recording. Make sure to select the browser window when prompted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      onStopRecording();
      setProgress(100);
    }
  };

  const downloadVideo = () => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-animation-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Video downloaded!');
  };

  const reset = () => {
    setRecordingState('idle');
    setProgress(0);
    setVideoBlob(null);
    setRecordingDuration(0);
    chunksRef.current = [];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Export Timeline Animation
          </DialogTitle>
          <DialogDescription>
            Record your timeline animation with narration to share on social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recording Instructions */}
          {recordingState === 'idle' && (
            <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Instructions:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Click "Start Recording" below</li>
                <li>Select this browser tab when prompted</li>
                <li>Play your timeline animation</li>
                <li>Click "Stop Recording" when done</li>
                <li>Download your video!</li>
              </ol>
            </div>
          )}

          {/* Recording Status */}
          {recordingState === 'recording' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                  Recording
                </Badge>
                <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Recording in progress... Play your animation now!
                </p>
              </div>
            </div>
          )}

          {/* Processing */}
          {recordingState === 'processing' && (
            <div className="flex items-center justify-center gap-3 p-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm">Processing video...</span>
            </div>
          )}

          {/* Ready */}
          {recordingState === 'ready' && videoBlob && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 p-4 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">Video ready!</span>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Size: {(videoBlob.size / 1024 / 1024).toFixed(2)} MB
                <br />
                Duration: {formatDuration(recordingDuration)}
              </div>
            </div>
          )}

          {/* Error */}
          {recordingState === 'error' && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm">Recording failed. Please try again.</span>
            </div>
          )}

          {/* Progress bar for processing */}
          {(recordingState === 'recording' || recordingState === 'processing') && (
            <Progress value={progress} className="w-full" />
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {recordingState === 'idle' && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={startRecording}>
                <Video className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </>
          )}

          {recordingState === 'recording' && (
            <Button variant="destructive" onClick={stopRecording}>
              Stop Recording
            </Button>
          )}

          {recordingState === 'ready' && (
            <>
              <Button variant="outline" onClick={reset}>
                Record Again
              </Button>
              <Button onClick={downloadVideo}>
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </Button>
            </>
          )}

          {recordingState === 'error' && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={reset}>
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
