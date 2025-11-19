import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/ios-badge';
import { StepBasicInfo } from './steps/StepBasicInfo';
import { StepContent } from './steps/StepContent';
import { StepMedia } from './steps/StepMedia';
import { StepLocation } from './steps/StepLocation';
import { StepPreview } from './steps/StepPreview';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LoreSubmissionData {
  title: string;
  description: string;
  category_id: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  media_urls: string[];
  route_drawing?: GeoJSON.Feature | null;
}

interface LoreSubmissionWizardProps {
  isContributor: boolean;
}

const steps = [
  { id: 1, title: 'Basic Info', description: 'Title and category' },
  { id: 2, title: 'Content', description: 'Description and details' },
  { id: 3, title: 'Media', description: 'Images and videos' },
  { id: 4, title: 'Location', description: 'Map and coordinates' },
  { id: 5, title: 'Preview', description: 'Review and submit' }
];

export const LoreSubmissionWizard: React.FC<LoreSubmissionWizardProps> = ({
  isContributor
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionData, setSubmissionData] = useState<LoreSubmissionData>({
    title: '',
    description: '',
    category_id: '',
    location_name: '',
    latitude: null,
    longitude: null,
    media_urls: [],
    route_drawing: null
  });
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!user || !submissionData.title) return;

    setAutoSaveStatus('saving');
    try {
      const submissionPayload = {
        user_id: user.id,
        title: submissionData.title,
        description: submissionData.description,
        location_name: submissionData.location_name,
        latitude: submissionData.latitude,
        longitude: submissionData.longitude,
        category_id: submissionData.category_id || null,
        media_urls: submissionData.media_urls,
        step_completed: currentStep,
        is_draft: true,
        submission_data: JSON.stringify(submissionData) as any
      };

      if (draftId) {
        const { error } = await supabase
          .from('lore_submissions')
          .update(submissionPayload)
          .eq('id', draftId);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('lore_submissions')
          .insert(submissionPayload)
          .select()
          .single();
        
        if (error) throw error;
        setDraftId(data.id);
      }
      
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    }
  }, [submissionData, currentStep, user, draftId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Auto-save when data changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeout);
  }, [submissionData, autoSave]);

  const updateSubmissionData = (updates: Partial<LoreSubmissionData>) => {
    setSubmissionData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return submissionData.title.trim() && submissionData.category_id;
      case 2:
        return submissionData.description.trim();
      case 3:
        return true; // Media is optional
      case 4:
        return submissionData.location_name && submissionData.latitude !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const submitLore = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('facts')
        .insert({
          author_id: user.id,
          title: submissionData.title,
          description: submissionData.description,
          location_name: submissionData.location_name,
          latitude: submissionData.latitude,
          longitude: submissionData.longitude,
          category_id: submissionData.category_id,
          media_urls: submissionData.media_urls,
          status: 'pending'
        });

      if (error) throw error;

      // Clean up draft
      if (draftId) {
        await supabase.from('lore_submissions').delete().eq('id', draftId);
      }

      toast({
        title: "Success!",
        description: "Your lore has been submitted for review.",
      });

      navigate('/discovery');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit lore. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: submissionData,
      onChange: updateSubmissionData,
      isContributor
    };

    switch (currentStep) {
      case 1:
        return <StepBasicInfo {...stepProps} />;
      case 2:
        return <StepContent {...stepProps} />;
      case 3:
        return <StepMedia {...stepProps} />;
      case 4:
        return <StepLocation {...stepProps} />;
      case 5:
        return <StepPreview {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant={autoSaveStatus === 'saved' ? 'default' : autoSaveStatus === 'saving' ? 'secondary' : 'destructive'}>
                <Save className="w-3 h-3 mr-1" />
                {autoSaveStatus === 'saved' ? 'Saved' : autoSaveStatus === 'saving' ? 'Saving...' : 'Error'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((step) => (
                <span
                  key={step.id}
                  className={currentStep >= step.id ? 'text-primary' : ''}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep === steps.length ? (
            <Button
              onClick={submitLore}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Lore'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};