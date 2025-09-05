import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Compass, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action?: {
    label: string;
    path: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Local Lore',
    description: 'Discover amazing stories and legends from your local area. Let us show you around!',
    icon: Compass,
  },
  {
    id: 'explore',
    title: 'Explore Stories',
    description: 'Browse stories in list view or explore them on an interactive map to see exactly where they happened.',
    icon: Search,
    action: {
      label: 'Try Exploring',
      path: '/explore'
    }
  },
  {
    id: 'contribute',
    title: 'Share Your Stories',
    description: 'Know a local legend or historical fact? Share it with the community and help preserve local culture.',
    icon: Plus,
    action: {
      label: 'Share a Story',
      path: '/submit'
    }
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

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

  const handleActionClick = (path: string) => {
    onComplete();
    navigate(path);
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md p-8 relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="absolute top-4 right-4 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Step Content */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">{currentStepData.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Action Button */}
            {currentStepData.action && (
              <div className="mb-6">
                <Button
                  onClick={() => handleActionClick(currentStepData.action!.path)}
                  className="w-full"
                  size="lg"
                >
                  {currentStepData.action.label}
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  size="sm"
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep < onboardingSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Skip Link */}
            <div className="text-center mt-4">
              <button
                onClick={onSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};