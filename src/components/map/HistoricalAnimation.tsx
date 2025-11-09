import React, { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VideoExportDialog } from './VideoExportDialog';

interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  categories?: {
    icon: string;
    color: string;
    slug: string;
    category_translations: {
      name: string;
      language_code: string;
    }[];
  };
}

interface HistoricalAnimationProps {
  map: mapboxgl.Map | null;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  mapContainerRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const HistoricalAnimation: React.FC<HistoricalAnimationProps> = ({
  map,
  isPlaying,
  onPlayStateChange,
  mapContainerRef,
  className
}) => {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(3000); // ms per event
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch historical events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('facts')
          .select(`
            id,
            title,
            description,
            latitude,
            longitude,
            created_at,
            categories (
              icon,
              color,
              slug,
              category_translations (name, language_code)
            )
          `)
          .eq('status', 'verified')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        if (data) {
          setEvents(data as HistoricalEvent[]);
        }
      } catch (error) {
        console.error('Error fetching historical events:', error);
        toast.error('Failed to load historical events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Stop any ongoing narration
  const stopNarration = useCallback(() => {
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      speechSynthesisRef.current = null;
    }
  }, []);

  // Narrate event
  const narrateEvent = useCallback((event: HistoricalEvent) => {
    if (!isNarrationEnabled || !('speechSynthesis' in window)) return;

    stopNarration();

    const categoryName = event.categories?.category_translations.find(
      t => t.language_code === 'en'
    )?.name || event.categories?.slug || 'location';

    const narrationText = `${event.title}. ${event.description || 'Exploring this ' + categoryName}.`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isNarrationEnabled, stopNarration]);

  // Animate to event
  const animateToEvent = useCallback((event: HistoricalEvent) => {
    if (!map) return;

    // Remove previous marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create animated marker
    const el = document.createElement('div');
    el.className = 'historical-event-marker';
    el.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${event.categories?.color || 'hsl(var(--primary))'};
      border: 4px solid white;
      cursor: pointer;
      box-shadow: 
        0 0 0 0 ${event.categories?.color || 'hsl(var(--primary))'};
      animation: historicalPulse 2s infinite;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      z-index: 100;
    `;
    
    const icon = document.createElement('span');
    icon.textContent = event.categories?.icon || '📍';
    icon.style.cssText = `
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    `;
    el.appendChild(icon);

    // Create popup
    const popup = new mapboxgl.Popup({ 
      offset: 35,
      closeButton: false,
      maxWidth: '300px'
    })
      .setHTML(`
        <div class="p-3">
          <h3 class="font-bold text-sm mb-1">${event.title}</h3>
          <p class="text-xs text-muted-foreground line-clamp-2">${event.description || ''}</p>
        </div>
      `);

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([event.longitude, event.latitude])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;
    popup.addTo(map);

    // Fly to location
    map.flyTo({
      center: [event.longitude, event.latitude],
      zoom: 12,
      duration: 2000,
      essential: true
    });

    // Narrate
    narrateEvent(event);
  }, [map, narrateEvent]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentEventIndex(prev => {
        const next = prev + 1;
        if (next >= events.length) {
          onPlayStateChange(false);
          toast.success('Animation completed!');
          return 0;
        }
        return next;
      });
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, events.length, animationSpeed, onPlayStateChange]);

  // Animate to current event
  useEffect(() => {
    if (events[currentEventIndex] && isPlaying) {
      animateToEvent(events[currentEventIndex]);
    }
  }, [currentEventIndex, events, animateToEvent, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNarration();
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [stopNarration]);

  const handlePlayPause = () => {
    if (!isPlaying && events.length === 0) {
      toast.error('No historical events to animate');
      return;
    }
    onPlayStateChange(!isPlaying);
  };

  const handleStepForward = () => {
    if (currentEventIndex < events.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
      onPlayStateChange(false);
    }
  };

  const handleStepBack = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(prev => prev - 1);
      onPlayStateChange(false);
    }
  };

  const handleReset = () => {
    setCurrentEventIndex(0);
    onPlayStateChange(false);
    stopNarration();
  };

  const handleExportClick = () => {
    if (isPlaying) {
      toast.error('Please stop the animation before exporting');
      return;
    }
    setShowExportDialog(true);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Reset to beginning and start playing
    setCurrentEventIndex(0);
    onPlayStateChange(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    onPlayStateChange(false);
  };

  const currentEvent = events[currentEventIndex];

  if (loading) {
    return (
      <Card className={`p-4 bg-background/95 backdrop-blur-sm border-border shadow-lg ${className}`}>
        <div className="text-center text-sm text-muted-foreground">
          Loading historical events...
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes historicalPulse {
          0% {
            box-shadow: 0 0 0 0 currentColor;
          }
          50% {
            box-shadow: 0 0 0 15px transparent;
          }
          100% {
            box-shadow: 0 0 0 0 transparent;
          }
        }
      `}</style>
      
      <Card className={`p-4 bg-background/95 backdrop-blur-sm border-border shadow-lg ${className}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Historical Journey</div>
              <div className="text-xs text-muted-foreground">
                Event {currentEventIndex + 1} of {events.length}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNarrationEnabled(!isNarrationEnabled)}
                className="h-8 w-8"
                title={isNarrationEnabled ? 'Mute narration' : 'Enable narration'}
              >
                {isNarrationEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportClick}
                className="h-8 w-8"
                disabled={isPlaying || isRecording}
                title="Export as video"
              >
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Event Info */}
          {currentEvent && (
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-2xl">{currentEvent.categories?.icon || '📍'}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {currentEvent.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {currentEvent.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleStepBack}
              disabled={currentEventIndex === 0}
              className="h-8 w-8"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              className="h-8 w-8"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleStepForward}
              disabled={currentEventIndex >= events.length - 1}
              className="h-8 w-8"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 px-3 text-xs"
            >
              Reset
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Speed:</span>
            <div className="flex gap-1">
              {[
                { label: 'Slow', value: 5000 },
                { label: 'Normal', value: 3000 },
                { label: 'Fast', value: 1500 }
              ].map(({ label, value }) => (
                <Button
                  key={label}
                  variant={animationSpeed === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnimationSpeed(value)}
                  disabled={isPlaying}
                  className="h-6 px-2 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentEventIndex + 1) / events.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Video Export Dialog */}
      <VideoExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        mapContainer={mapContainerRef?.current || null}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />
    </>
  );
};
