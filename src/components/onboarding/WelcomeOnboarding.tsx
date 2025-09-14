import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Compass, 
  MapPin, 
  Crown, 
  Heart, 
  MessageSquare, 
  Star,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';

interface WelcomeOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Local Lore!',
    description: 'Discover amazing stories and legends from around the world. Your journey into local culture starts here.',
    icon: Compass,
    gradient: 'from-primary/20 to-secondary/20'
  },
  {
    id: 'explore',
    title: 'Explore Stories',
    description: 'Browse fascinating local stories in list view or explore them on our interactive map to see exactly where they happened.',
    icon: MapPin,
    gradient: 'from-secondary/20 to-accent/20',
    action: {
      label: 'Start Exploring',
      path: '/explore'
    }
  },
  {
    id: 'community',
    title: 'Join the Community',
    description: 'Vote on stories, interact with content, and discover what makes each place special through the eyes of locals.',
    icon: Heart,
    gradient: 'from-accent/20 to-primary/20'
  },
  {
    id: 'contribute',
    title: 'Become a Contributor',
    description: 'Ready to share your own stories? Upgrade to a contributor account to submit local legends and engage with the community.',
    icon: Crown,
    gradient: 'from-primary/20 to-secondary/20',
    action: {
      label: 'Learn About Contributing',
      path: '/billing'
    }
  }
];

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

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
          <Card className="w-full max-w-lg p-8 relative overflow-hidden">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData.gradient} opacity-50`} />
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="absolute top-4 right-4 h-8 w-8 p-0 z-10"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Content */}
            <div className="relative z-10">
              {/* Step Progress */}
              <div className="flex items-center justify-center mb-6">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-primary scale-125' 
                        : index < currentStep 
                        ? 'bg-primary/60' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <IconComponent className="w-10 h-10 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold mb-4">{currentStepData.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {currentStepData.description}
                </p>
              </div>

              {/* Action Button */}
              {currentStepData.action && (
                <div className="mb-6">
                  <Button
                    onClick={() => handleActionClick(currentStepData.action!.path)}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    {currentStepData.action.label}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep < onboardingSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Skip Link */}
              <div className="text-center mt-6">
                <button
                  onClick={onSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip tour
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};