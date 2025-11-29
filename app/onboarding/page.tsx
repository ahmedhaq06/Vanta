'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { CheckCircle, Upload, Mail, BarChart3, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Welcome to Vanta',
    description: 'Book meetings on autopilot with AI-powered email outreach',
    icon: CheckCircle,
  },
  {
    id: 2,
    title: 'Upload Your Leads',
    description: 'Import a CSV with names, emails, and company names',
    icon: Upload,
  },
  {
    id: 3,
    title: 'Create a Campaign',
    description: 'Write your outreach email and set daily limits',
    icon: Mail,
  },
  {
    id: 4,
    title: 'Track Results',
    description: 'Monitor opens, clicks, replies, and meetings booked',
    icon: BarChart3,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.push('/signup');
      } else {
        setLoading(false);
      }
    });
  }, [router, supabase]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding, redirect to pay page
      router.push('/pay');
    }
  };

  const handleSkip = () => {
    router.push('/pay');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const Step = steps[currentStep];
  const Icon = Step.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded ${
                  idx <= currentStep ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-800'
                } ${idx > 0 ? 'ml-2' : ''}`}
              />
            ))}
          </div>
          <div className="text-center text-gray-400 text-sm">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full">
            <Icon className="w-12 h-12 text-purple-400" />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{Step.title}</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">{Step.description}</p>
          </div>

          {currentStep === 0 && (
            <div className="bg-gray-900/50 border border-white/10 rounded-lg p-8 max-w-2xl mx-auto text-left">
              <h3 className="text-lg font-semibold mb-4">How it works:</h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-400 font-bold mr-3">1.</span>
                  <span>Pay $2 for 500 test email credits to get started</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 font-bold mr-3">2.</span>
                  <span>Upload your leads and create personalized campaigns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 font-bold mr-3">3.</span>
                  <span>We send emails automatically and track engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 font-bold mr-3">4.</span>
                  <span>Pay $19 only when meetings are booked (no hidden fees)</span>
                </li>
              </ol>
            </div>
          )}

          {currentStep === 1 && (
            <div className="bg-gray-900/50 border border-white/10 rounded-lg p-8 max-w-2xl mx-auto text-left">
              <h3 className="text-lg font-semibold mb-4">CSV Format:</h3>
              <div className="bg-gray-800 p-4 rounded font-mono text-sm text-gray-300">
                <div>firstName,lastName,email,companyName</div>
                <div className="text-gray-500">John,Doe,john@example.com,Acme Corp</div>
                <div className="text-gray-500">Jane,Smith,jane@company.com,Tech Inc</div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                💡 Make sure your CSV has these exact column names for best results
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-gray-900/50 border border-white/10 rounded-lg p-8 max-w-2xl mx-auto text-left">
              <h3 className="text-lg font-semibold mb-4">Pro Tips:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <span>Personalize with variables: {`{{firstName}}`}, {`{{companyName}}`}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <span>Keep subject lines short and intriguing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <span>Start with 50 emails/day to warm up your sender reputation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">✓</span>
                  <span>Include a clear call-to-action (book a meeting)</span>
                </li>
              </ul>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-gray-900/50 border border-white/10 rounded-lg p-8 max-w-2xl mx-auto text-left">
              <h3 className="text-lg font-semibold mb-4">Dashboard Features:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">📊</span>
                  <span>Real-time analytics on opens, clicks, and replies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">📅</span>
                  <span>Automatic meeting detection and booking confirmation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">💳</span>
                  <span>Transparent billing - track all payments and credits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">⚡</span>
                  <span>Pause/resume campaigns anytime with one click</span>
                </li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-8">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-400 hover:text-white transition"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
