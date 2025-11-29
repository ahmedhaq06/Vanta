'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import CampaignList from '@/components/CampaignList';
import Analytics from '@/components/Analytics';
import { AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

export default function Home() {
  const [activeView, setActiveView] = useState<'campaigns' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
      }
    };
    checkAuth();
  }, []);

  const loadCampaigns = async () => {
    try {
      setError(null);
      const response = await fetch('/api/campaigns');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load campaigns');
      }
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error: any) {
      console.error('Error loading campaigns:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show error state if database isn't set up
  if (error && error.includes('relation') || error && error.includes('does not exist')) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl">
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500 mb-4">Database Setup Required</h2>
                  <p className="text-gray-300 mb-4">
                    The database tables haven't been created yet. Please follow these steps:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
                    <li>Open your Supabase dashboard</li>
                    <li>Go to SQL Editor</li>
                    <li>Run the SQL from <code className="bg-gray-800 px-2 py-1 rounded">supabase-schema.sql</code></li>
                    <li>Run the SQL from <code className="bg-gray-800 px-2 py-1 rounded">supabase-functions.sql</code></li>
                    <li>Refresh this page</li>
                  </ol>
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.open('https://supabase.com/dashboard/project/eqhvrzwfrlgxwpwpokfm/sql', '_blank')}
                      className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium"
                    >
                      Open Supabase SQL Editor
                    </button>
                    <button
                      onClick={loadCampaigns}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
                    >
                      Retry Connection
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    See <code className="bg-gray-800 px-2 py-1 rounded">SETUP.md</code> for detailed instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 overflow-auto">
        {activeView === 'campaigns' ? (
          <CampaignList campaigns={campaigns} onRefresh={loadCampaigns} loading={loading} />
        ) : (
          <Analytics campaigns={campaigns} />
        )}
      </main>
    </div>
  );
}
