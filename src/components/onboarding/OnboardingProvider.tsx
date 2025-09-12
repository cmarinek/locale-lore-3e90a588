import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const startOnboarding = useCallback((onboardingSteps: OnboardingStep[]) => {
    setSteps(onboardingSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStep, steps.length]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipOnboarding = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setTargetElement(null);
    // Mark as completed in localStorage
    localStorage.setItem('onboarding-completed', 'true');
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setTargetElement(null);
    localStorage.setItem('onboarding-completed', 'true');
  }, []);

  // Update target element when step changes
  useEffect(() => {
    if (!isActive || !steps[currentStep]?.target) {
      setTargetElement(null);
      return;
    }

    const element = document.querySelector(steps[currentStep].target!);
    setTargetElement(element);

    // Scroll element into view
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive, currentStep, steps]);

  // Execute step action
  useEffect(() => {
    if (isActive && steps[currentStep]?.action) {
      steps[currentStep].action!();
    }
  }, [isActive, currentStep, steps]);

  const currentStepData = steps[currentStep];
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startOnboarding,
        nextStep,
        previousStep,
        skipOnboarding,
        completeOnboarding
      }}
    >
      {children}

      <AnimatePresence>
        {isActive && currentStepData && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={skipOnboarding}
            />

            {/* Spotlight for target element */}
            {targetElement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed z-50 pointer-events-none"
                style={{
                  top: targetElement.getBoundingClientRect().top - 8,
                  left: targetElement.getBoundingClientRect().left - 8,
                  width: targetElement.getBoundingClientRect().width + 16,
                  height: targetElement.getBoundingClientRect().height + 16,
                  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  borderRadius: '8px'
                }}
              />
            )}

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "fixed z-50 bg-card border rounded-lg shadow-lg p-6 max-w-sm",
                targetElement
                  ? getTooltipPosition(targetElement, currentStepData.position)
                  : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              )}
            >
              {/* Close button */}
              <button
                onClick={skipOnboarding}
                className="absolute top-2 right-2 p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <motion.div
                    className="bg-primary h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-semibold mb-2">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {currentStepData.description}
              </p>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipOnboarding}
                  >
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    onClick={nextStep}
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </OnboardingContext.Provider>
  );
};

function getTooltipPosition(element: Element, position: string = 'bottom'): string {
  const rect = element.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  switch (position) {
    case 'top':
      return `top: ${rect.top + scrollY - 20}px; left: ${rect.left + scrollX + rect.width / 2}px; transform: translateX(-50%) translateY(-100%);`;
    case 'bottom':
      return `top: ${rect.bottom + scrollY + 20}px; left: ${rect.left + scrollX + rect.width / 2}px; transform: translateX(-50%);`;
    case 'left':
      return `top: ${rect.top + scrollY + rect.height / 2}px; left: ${rect.left + scrollX - 20}px; transform: translateX(-100%) translateY(-50%);`;
    case 'right':
      return `top: ${rect.top + scrollY + rect.height / 2}px; left: ${rect.right + scrollX + 20}px; transform: translateY(-50%);`;
    default:
      return `top: ${rect.bottom + scrollY + 20}px; left: ${rect.left + scrollX + rect.width / 2}px; transform: translateX(-50%);`;
  }
}