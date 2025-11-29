'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { CampaignType, EmailTone, EmailGoal } from '@/lib/types';
import OnboardingProgress from './OnboardingProgress';
import TypeSelection from './steps/TypeSelection';
import CampaignDetails from './steps/CampaignDetails';
import EmailCustomization from './steps/EmailCustomization';
import CSVFormatGuide from './steps/CSVFormatGuide';

interface CampaignOnboardingProps {
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = ['Type', 'Details', 'Customize', 'Format'];

export default function CampaignOnboarding({ onClose, onSuccess }: CampaignOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [campaignType, setCampaignType] = useState<CampaignType>('b2c');
  const [name, setName] = useState('');
  const [emailTone, setEmailTone] = useState<EmailTone>('professional');
  const [emailGoal, setEmailGoal] = useState<EmailGoal>('networking');
  const [customInstructions, setCustomInstructions] = useState('');

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Campaign type is always selected
      case 2:
        return name.trim().length > 0;
      case 3:
        return true; // Custom instructions are optional
      case 4:
        return true; // CSV guide is informational
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          campaign_type: campaignType,
          email_tone: emailTone,
          email_goal: emailGoal,
          custom_instructions: customInstructions || null,
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Failed to create campaign: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-purple-500/20 rounded-2xl shadow-2xl max-w-4xl w-full p-8 flex flex-col" style={{maxHeight: '90vh'}}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <h2 className="text-3xl font-bold text-white">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex-shrink-0 mb-8">
          <OnboardingProgress currentStep={currentStep} totalSteps={4} steps={STEPS} />
        </div>

        {/* Step Content - Scrollable */}
        <div className="flex-1 overflow-y-auto mb-8 pr-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50">
          {currentStep === 1 && (
            <TypeSelection selectedType={campaignType} onSelect={setCampaignType} />
          )}
          {currentStep === 2 && (
            <CampaignDetails
              name={name}
              emailTone={emailTone}
              emailGoal={emailGoal}
              onNameChange={setName}
              onToneChange={setEmailTone}
              onGoalChange={setEmailGoal}
            />
          )}
          {currentStep === 3 && (
            <EmailCustomization
              customInstructions={customInstructions}
              onInstructionsChange={setCustomInstructions}
            />
          )}
          {currentStep === 4 && <CSVFormatGuide campaignType={campaignType} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-purple-500/20 flex-shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800/80 text-white rounded-xl hover:bg-gray-700 transition-all font-medium disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 hover:border-gray-600"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-sm font-medium text-gray-400 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
            Step {currentStep} of {STEPS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/40 hover:scale-105"
          >
            {loading ? (
              'Creating...'
            ) : currentStep === 4 ? (
              'Create Campaign'
            ) : (
              <>
                Next
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
