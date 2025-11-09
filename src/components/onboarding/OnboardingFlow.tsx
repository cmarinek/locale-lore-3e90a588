import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Map, Book, Users, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to LocaleLore',
    description: 'Discover and share the hidden stories of your world',
    icon: Sparkles,
    content: 'LocaleLore connects you with the rich tapestry of local stories, cultural gems, and community experiences around you.',
  },
  {
    id: 'explore',
    title: 'Explore the Map',
    description: 'Navigate stories and locations',
    icon: Map,
    content: 'Use our interactive map to discover stories near you. Explore neighborhoods, landmarks, and hidden gems through the eyes of locals.',
  },
  {
    id: 'stories',
    title: 'Share Your Stories',
    description: 'Contribute to the community',
    icon: Book,
    content: 'Create and share your own stories. Add photos, descriptions, and connect with others who share your passion for local culture.',
  },
  {
    id: 'community',
    title: 'Join the Community',
    description: 'Connect with local storytellers',
    icon: Users,
    content: 'Follow creators, engage with stories, and become part of a vibrant community preserving and celebrating local heritage.',
  },
];

export const OnboardingFlow = ({ open, onComplete, onSkip }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl border-border/50 p-0 overflow-hidden">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <Progress value={progress} className="h-1 rounded-none" />
          </div>

          {/* Content */}
          <div className="p-8 pt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">{step.title}</h2>
                  <p className="text-lg text-muted-foreground">{step.description}</p>
                </div>

                <p className="text-center text-foreground/80 max-w-md mx-auto leading-relaxed">
                  {step.content}
                </p>

                {/* Step Indicators */}
                <div className="flex justify-center gap-2 pt-4">
                  {onboardingSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 gap-4">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className="gap-2 min-w-[120px]"
                >
                  {currentStep < onboardingSteps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
