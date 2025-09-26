import React from 'react';
import { GracefulFallback } from '@/components/auth/GracefulFallback';

interface FeatureGateProps {
  children: React.ReactNode;
  requiresContributor?: boolean;
  feature: string;
  description?: string;
  benefits?: string[];
  showPreview?: boolean;
  className?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  requiresContributor = true,
  feature,
  description,
  benefits = [
    'Advanced tools',
    'Revenue sharing', 
    'Priority support',
    'Exclusive features'
  ],
  showPreview = true,
  className
}) => {
  return (
    <div className={className}>
      <GracefulFallback
        contributorOnly={requiresContributor}
        feature={feature}
        previewMode={showPreview}
        fallbackContent={
          description ? (
            <div className="p-8 text-center space-y-4">
              <h3 className="text-lg font-semibold">{feature}</h3>
              <p className="text-muted-foreground">{description}</p>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3 text-sm">
                    ✨ {benefit}
                  </div>
                ))}
              </div>
            </div>
          ) : undefined
        }
      >
        {children}
      </GracefulFallback>
    </div>
  );
};