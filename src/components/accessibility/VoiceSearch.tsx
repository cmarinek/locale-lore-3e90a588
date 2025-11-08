import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { log } from '@/utils/logger';

interface VoiceSearchProps {
  onTranscript: (text: string) => void;
  onCommand?: (command: string) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onTranscript,
  onCommand,
  className,
  size = 'default'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Voice commands mapping
  const commands = {
    'search for': (query: string) => onTranscript(query),
    'find': (query: string) => onTranscript(query),
    'show me': (query: string) => onTranscript(query),
    'navigate to': (page: string) => onCommand?.(`navigate:${page}`),
    'go to': (page: string) => onCommand?.(`navigate:${page}`),
    'open': (page: string) => onCommand?.(`navigate:${page}`),
    'clear search': () => onTranscript(''),
    'clear': () => onTranscript(''),
    'help': () => onCommand?.('help'),
    'stop': () => stopListening()
  };

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.success('Voice search activated - speak now');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          processTranscript(finalTranscript.trim());
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        log.error('Speech recognition error', event.error, { component: 'VoiceSearch', errorType: event.error });
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.');
            break;
          case 'network':
            toast.error('Network error. Check your connection.');
            break;
          case 'not-allowed':
            toast.error('Microphone access denied.');
            break;
          default:
            toast.error('Voice recognition error. Please try again.');
        }
      };
    }

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const processTranscript = useCallback((text: string) => {
    setTranscript(text);
    
    // Check for voice commands
    const lowerText = text.toLowerCase();
    let commandProcessed = false;

    for (const [command, action] of Object.entries(commands)) {
      if (lowerText.startsWith(command)) {
        const query = text.substring(command.length).trim();
        action(query);
        commandProcessed = true;
        break;
      }
    }

    if (!commandProcessed) {
      onTranscript(text);
    }

    // Provide audio feedback
    if (synthRef.current && confidence > 0.7) {
      speak(`Searching for ${text}`);
    }
  }, [onTranscript, onCommand, confidence]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      toast.error('Voice search is not supported in your browser');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      log.error('Error starting voice recognition', error, { component: 'VoiceSearch', action: 'startListening' });
      toast.error('Failed to start voice search');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;

    // Stop current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const toggleSpeech = useCallback(() => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  if (!isSupported) {
    return null;
  }

  const buttonSize = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12'
  }[size];

  const iconSize = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Voice search button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="icon"
        className={`${buttonSize} relative`}
        onClick={isListening ? stopListening : startListening}
        disabled={!isSupported}
      >
        {isListening ? (
          <MicOff className={iconSize} />
        ) : (
          <Mic className={iconSize} />
        )}

        {/* Listening indicator */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-primary"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </Button>

      {/* Speech toggle button */}
      {synthRef.current && (
        <Button
          variant="ghost"
          size="icon"
          className={buttonSize}
          onClick={toggleSpeech}
        >
          {isSpeaking ? (
            <VolumeX className={iconSize} />
          ) : (
            <Volume2 className={iconSize} />
          )}
        </Button>
      )}

      {/* Live transcript display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-1 text-sm"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-muted-foreground italic">"{transcript}"</span>
            {confidence > 0 && (
              <span className="text-xs text-muted-foreground">
                {Math.round(confidence * 100)}%
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};