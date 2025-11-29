'use client';

import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function OnboardingProgress({ currentStep, totalSteps, steps }: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    isCompleted
                      ? 'bg-purple-600 text-white'
                      : isCurrent
                      ? 'bg-purple-600 text-white ring-4 ring-purple-600/30'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : stepNumber}
                </div>
                <div
                  className={`mt-2 text-xs font-medium text-center ${
                    isCurrent ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {step}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-purple-600' : 'bg-gray-700'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
