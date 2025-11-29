'use client';

import { Target, Handshake, DollarSign, Users, MessageSquare, Lightbulb, Video } from 'lucide-react';
import { EmailTone, EmailGoal } from '@/lib/types';

interface CampaignDetailsProps {
  name: string;
  emailTone: EmailTone;
  emailGoal: EmailGoal;
  onNameChange: (name: string) => void;
  onToneChange: (tone: EmailTone) => void;
  onGoalChange: (goal: EmailGoal) => void;
}

const TONES: { value: EmailTone; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-oriented' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'persuasive', label: 'Persuasive', description: 'Compelling and action-driven' },
];

const GOALS: { value: EmailGoal; label: string; icon: any; color: string }[] = [
  { value: 'meeting', label: 'Schedule Meeting', icon: Target, color: 'blue' },
  { value: 'demo', label: 'Book Demo', icon: Video, color: 'purple' },
  { value: 'partnership', label: 'Partnership', icon: Handshake, color: 'green' },
  { value: 'sale', label: 'Make Sale', icon: DollarSign, color: 'yellow' },
  { value: 'networking', label: 'Networking', icon: Users, color: 'pink' },
  { value: 'feedback', label: 'Get Feedback', icon: MessageSquare, color: 'orange' },
  { value: 'collaboration', label: 'Collaborate', icon: Lightbulb, color: 'cyan' },
];

export default function CampaignDetails({
  name,
  emailTone,
  emailGoal,
  onNameChange,
  onToneChange,
  onGoalChange,
}: CampaignDetailsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-3">Campaign Details</h3>
        <p className="text-gray-400 text-lg">Define your campaign's purpose and style</p>
      </div>

      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Campaign Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Q1 SaaS Outreach"
          className="w-full px-5 py-4 bg-gray-800/80 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          required
        />
      </div>

      {/* Email Goal */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Primary Goal <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GOALS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = emailGoal === goal.value;
            return (
              <button
                key={goal.value}
                onClick={() => onGoalChange(goal.value)}
                className={`p-5 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 hover:shadow-lg ${
                  isSelected
                    ? `border-${goal.color}-500 bg-${goal.color}-500/15 shadow-md shadow-${goal.color}-500/20`
                    : 'border-gray-700 bg-gray-800/70 hover:border-gray-600'
                }`}
              >
                <Icon size={32} className={`mx-auto mb-3 ${isSelected ? `text-${goal.color}-400` : 'text-gray-400'}`} />
                <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {goal.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Tone */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Email Tone <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TONES.map((tone) => (
            <button
              key={tone.value}
              onClick={() => onToneChange(tone.value)}
              className={`p-5 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-center ${
                emailTone === tone.value
                  ? 'border-purple-500 bg-purple-500/15 shadow-md shadow-purple-500/20'
                  : 'border-gray-700 bg-gray-800/70 hover:border-gray-600'
              }`}
            >
              <div className={`text-base font-semibold mb-2 ${emailTone === tone.value ? 'text-white' : 'text-gray-300'}`}>
                {tone.label}
              </div>
              <div className="text-xs leading-relaxed text-gray-400">{tone.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
