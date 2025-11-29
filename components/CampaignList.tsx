'use client';

import { useState } from 'react';
import { Plus, Upload, Play, Pause, Trash2, Eye } from 'lucide-react';
import { Campaign } from '@/lib/types';
import CampaignOnboarding from '@/components/onboarding/CampaignOnboarding';
import CampaignDetails from '@/components/CampaignDetails';

interface CampaignListProps {
  campaigns: Campaign[];
  onRefresh: () => void;
  loading: boolean;
}

export default function CampaignList({ campaigns, onRefresh, loading }: CampaignListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleStartCampaign = async (campaignId: string) => {
    try {
      await fetch(`/api/campaigns/${campaignId}/start`, {
        method: 'POST'
      });
      onRefresh();
    } catch (error) {
      console.error('Error starting campaign:', error);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' })
      });
      onRefresh();
    } catch (error) {
      console.error('Error pausing campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleBulkAction = async (action: 'pause' | 'resume' | 'delete') => {
    if (selectedCampaigns.length === 0) return;
    
    if (action === 'delete' && !confirm(`Delete ${selectedCampaigns.length} campaigns?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      const response = await fetch('/api/campaigns/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds: selectedCampaigns, action }),
      });

      if (response.ok) {
        setSelectedCampaigns([]);
        onRefresh();
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleCampaignSelection = (id: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCampaigns.length === campaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(campaigns.map((c) => c.id));
    }
  };

  if (selectedCampaign) {
    return (
      <CampaignDetails
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaigns</h1>
          <p className="text-gray-400">Manage your outreach campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium"
        >
          <Plus size={20} />
          New Campaign
        </button>
      </div>

      {/* Bulk Actions Toolbar */}
      {campaigns.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-400">
                {selectedCampaigns.length > 0
                  ? `${selectedCampaigns.length} selected`
                  : 'Select all'}
              </span>
            </label>
          </div>

          {selectedCampaigns.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('pause')}
                disabled={bulkLoading}
                className="px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded-lg hover:bg-yellow-600/30 transition disabled:opacity-50 text-sm"
              >
                <Pause className="w-4 h-4 inline mr-1" />
                Pause
              </button>
              <button
                onClick={() => handleBulkAction('resume')}
                disabled={bulkLoading}
                className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition disabled:opacity-50 text-sm"
              >
                <Play className="w-4 h-4 inline mr-1" />
                Resume
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkLoading}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50 text-sm"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No campaigns yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-400 hover:text-blue-300"
          >
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`bg-gray-900 border rounded-lg p-6 hover:border-gray-700 transition-all ${
                selectedCampaigns.includes(campaign.id) ? 'border-purple-600' : 'border-gray-800'
              }`}
            >
              {/* Campaign Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(campaign.id)}
                    onChange={() => toggleCampaignSelection(campaign.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                    <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{campaign.name}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Leads</span>
                  <span className="text-white font-medium">{campaign.total_leads}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sent</span>
                  <span className="text-white font-medium">{campaign.sent_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Opened</span>
                  <span className="text-green-400 font-medium">{campaign.opened_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Replied</span>
                  <span className="text-blue-400 font-medium">{campaign.replied_count}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCampaign(campaign)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  <Eye size={16} />
                  View
                </button>
                
                {campaign.status === 'draft' || campaign.status === 'paused' ? (
                  <button
                    onClick={() => handleStartCampaign(campaign.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Play size={16} />
                  </button>
                ) : campaign.status === 'active' ? (
                  <button
                    onClick={() => handlePauseCampaign(campaign.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                  >
                    <Pause size={16} />
                  </button>
                ) : null}
                
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CampaignOnboarding
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
