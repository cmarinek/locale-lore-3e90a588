import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import * as React from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, description, containerClassName, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Input
          id={inputId}
          ref={ref}
          className={cn(
            "transition-all duration-200 ease-ios",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : description ? `${inputId}-description` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        {description && !error && (
          <p id={`${inputId}-description`} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";