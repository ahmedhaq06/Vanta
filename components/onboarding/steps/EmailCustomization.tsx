'use client';

import { Sparkles, Target, MessageSquare, TrendingUp } from 'lucide-react';

interface EmailCustomizationProps {
  customInstructions: string;
  onInstructionsChange: (instructions: string) => void;
}

const EXAMPLE_PROMPTS = [
  {
    category: 'Product Launch',
    prompt: 'We just launched our new AI-powered analytics dashboard. Mention how it helps companies make data-driven decisions 10x faster.',
  },
  {
    category: 'Cost Savings',
    prompt: 'Emphasize that our solution reduces operational costs by 40% on average. Focus on ROI and budget efficiency.',
  },
  {
    category: 'Social Proof',
    prompt: 'Reference that we work with over 500 companies including Fortune 500 brands. Build credibility and trust.',
  },
  {
    category: 'Pain Point',
    prompt: 'Address their struggle with manual data entry and time-consuming workflows. Position us as the automation solution.',
  },
];

export default function EmailCustomization({
  customInstructions,
  onInstructionsChange,
}: EmailCustomizationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-3">Personalization Instructions</h3>
        <p className="text-gray-400">Tell the AI how to craft compelling, personalized emails</p>
      </div>

      {/* Main Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
          <Sparkles size={18} className="text-purple-400" />
          Your Instructions
        </label>
        <textarea
          value={customInstructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Example: We help SaaS companies reduce churn by 30%. Focus on their customer retention pain points and mention our case study with Acme Corp..."
          rows={6}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none text-sm"
        />
        <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
          <span>💡</span>
          <span>Be specific about your value prop, target pain points, and what makes your solution unique</span>
        </div>
      </div>

      {/* Example Templates */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-400" />
          Quick Start Templates
        </h4>
        <div className="grid gap-2">
          {EXAMPLE_PROMPTS.map((example, idx) => (
            <button
              key={idx}
              onClick={() => onInstructionsChange(example.prompt)}
              className="text-left p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-500/50 rounded-lg transition-all group"
            >
              <div className="text-xs font-medium text-purple-400 mb-1">{example.category}</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">{example.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* What Gets Personalized */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Target size={16} className="text-green-400" />
          What AI Automatically Personalizes
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Company name and industry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Recipient's first name and role</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Company website and products</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Recent company news</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Pain points from their industry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Social proof and case studies</span>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          Best Practices
        </h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">→</span>
            <span><strong>Be specific:</strong> "Mention our 30-day free trial" instead of "talk about pricing"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">→</span>
            <span><strong>Include stats:</strong> "We help reduce costs by 40%" gives concrete value</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">→</span>
            <span><strong>Reference timely events:</strong> "Our Q4 promotion" or "Black Friday offer"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">→</span>
            <span><strong>Highlight differentiators:</strong> What makes you different from competitors?</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
