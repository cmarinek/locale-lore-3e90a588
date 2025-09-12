import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { DragDropZone } from '../upload/drag-drop-zone';
import { useAutosave } from '@/hooks/useAutosave';
import { cn } from '@/lib/utils';
import { 
  Save, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Upload
} from 'lucide-react';

interface AutosaveFormData {
  [key: string]: any;
}

interface AutosaveFormProps {
  initialData?: AutosaveFormData;
  onSubmit: (data: AutosaveFormData) => Promise<void>;
  onSave?: (data: AutosaveFormData) => Promise<void>;
  onLoad?: () => Promise<AutosaveFormData>;
  autosaveKey: string;
  fields: FormField[];
  className?: string;
  showSaveStatus?: boolean;
  validateOnSave?: boolean;
  children?: React.ReactNode;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'file' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validate?: (value: any) => boolean | string;
  className?: string;
}

export const AutosaveForm: React.FC<AutosaveFormProps> = ({
  initialData = {},
  onSubmit,
  onSave,
  onLoad,
  autosaveKey,
  fields,
  className,
  showSaveStatus = true,
  validateOnSave = true,
  children
}) => {
  const [formData, setFormData] = useState<AutosaveFormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);

  // Validation function
  const validateForm = (data: AutosaveFormData): boolean => {
    const errors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = data[field.name];
      
      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        errors[field.name] = `${field.label} is required`;
        return;
      }
      
      // Custom validation
      if (field.validate && value) {
        const result = field.validate(value);
        if (result !== true) {
          errors[field.name] = typeof result === 'string' ? result : 'Invalid value';
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Autosave setup
  const {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error: saveError,
    saveNow,
    loadSavedData,
    hasSavedData,
    clearSavedData,
    getSaveStatus
  } = useAutosave(formData, {
    key: autosaveKey,
    onSave: validateOnSave ? 
      async (data) => {
        if (validateForm(data)) {
          await onSave?.(data);
        }
      } : 
      onSave,
    onLoad,
    debounceMs: 2000
  });

  // Check for saved data on mount
  useEffect(() => {
    const checkSavedData = async () => {
      const hasSaved = await hasSavedData();
      if (hasSaved) {
        setShowLoadPrompt(true);
      }
    };
    
    checkSavedData();
  }, [hasSavedData]);

  // Update form field
  const updateField = (name: string, value: any) => {
    setFormData(current => ({
      ...current,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(current => {
        const { [name]: removed, ...rest } = current;
        return rest;
      });
    }
  };

  // Load saved data
  const handleLoadSavedData = async () => {
    const saved = await loadSavedData();
    if (saved) {
      setFormData(saved);
      setShowLoadPrompt(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(formData);
      clearSavedData(); // Clear autosave after successful submit
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Render form field
  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const hasError = !!validationErrors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(hasError && "border-destructive", field.className)}
            rows={4}
          />
        );
      
      case 'file':
        return (
          <DragDropZone
            onFilesAdded={(files) => updateField(field.name, files)}
            uploadedFiles={value || []}
            onFileRemove={(fileId) => {
              const currentFiles = value || [];
              updateField(field.name, currentFiles.filter((f: any) => f.id !== fileId));
            }}
            compact
            className={field.className}
          />
        );
      
      case 'select':
        return (
          <select
            id={field.name}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            className={cn(
              "w-full px-3 py-2 border border-border rounded-md bg-background",
              hasError && "border-destructive",
              field.className
            )}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <Input
            id={field.name}
            type={field.type}
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(hasError && "border-destructive", field.className)}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Load saved data prompt */}
      {showLoadPrompt && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>We found a saved draft of this form. Would you like to restore it?</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLoadPrompt(false)}
              >
                Discard
              </Button>
              <Button size="sm" onClick={handleLoadSavedData}>
                Restore
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Save status */}
      {showSaveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            {isSaving && (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            )}
            {!isSaving && !saveError && hasUnsavedChanges && (
              <>
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600">Unsaved changes</span>
              </>
            )}
            {!isSaving && !saveError && !hasUnsavedChanges && lastSaved && (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">All changes saved</span>
              </>
            )}
            {saveError && (
              <>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-600">Save failed</span>
              </>
            )}
          </div>
          
          {lastSaved && (
            <span className="text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          
          {hasUnsavedChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={saveNow}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save now
            </Button>
          )}
        </motion.div>
      )}

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="flex items-center gap-2">
                {field.label}
                {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </Label>
              
              {renderField(field)}
              
              {validationErrors[field.name] && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors[field.name]}
                </p>
              )}
            </div>
          ))}

          {children}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={submitting || isSaving}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={saveNow}
              disabled={isSaving || !hasUnsavedChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};