'use client';

import { Building2, User } from 'lucide-react';
import { CampaignType } from '@/lib/types';

interface TypeSelectionProps {
  selectedType: CampaignType;
  onSelect: (type: CampaignType) => void;
}

export default function TypeSelection({ selectedType, onSelect }: TypeSelectionProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Choose Your Campaign Type</h2>
        <p className="text-gray-400 text-lg">Select who you'll be reaching out to</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* B2B Card */}
        <button
          onClick={() => onSelect('b2b')}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-[1.02] hover:shadow-xl ${
            selectedType === 'b2b'
              ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-600/5 shadow-lg shadow-purple-500/20'
              : 'border-gray-700 bg-gradient-to-br from-gray-800/80 to-gray-900/50 hover:border-purple-500/50'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${
            selectedType === 'b2b' ? 'bg-purple-500/20 shadow-lg shadow-purple-500/30' : 'bg-gray-700'
          }`}>
            <Building2 size={28} className={selectedType === 'b2b' ? 'text-purple-400' : 'text-gray-400'} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">B2B Outreach</h3>
          <p className="text-gray-400 mb-4 text-sm leading-relaxed">
            Target businesses, companies, and organizations
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">✓</span>
              <span>Scrape company websites for insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">✓</span>
              <span>Business-focused personalization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">✓</span>
              <span>ROI and value proposition emphasis</span>
            </li>
          </ul>
          {selectedType === 'b2b' && (
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-full inline-flex items-center gap-2 shadow-lg">
              Selected
            </div>
          )}
        </button>

        {/* B2C Card */}
        <button
          onClick={() => onSelect('b2c')}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-[1.02] hover:shadow-xl ${
            selectedType === 'b2c'
              ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/5 shadow-lg shadow-blue-500/20'
              : 'border-gray-700 bg-gradient-to-br from-gray-800/80 to-gray-900/50 hover:border-blue-500/50'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${
            selectedType === 'b2c' ? 'bg-blue-500/20 shadow-lg shadow-blue-500/30' : 'bg-gray-700'
          }`}>
            <User size={28} className={selectedType === 'b2c' ? 'text-blue-400' : 'text-gray-400'} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">B2C Outreach</h3>
          <p className="text-gray-400 mb-4 text-sm leading-relaxed">
            Target individuals, professionals, and influencers
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Scrape social profiles for context</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Personal connection and interests</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">✓</span>
              <span>Individual benefits and value</span>
            </li>
          </ul>
          {selectedType === 'b2c' && (
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full inline-flex items-center gap-2 shadow-lg">
              Selected
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
