'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Play, Pause, Trash2 } from 'lucide-react';
import { Campaign, Lead } from '@/lib/types';
import { parseLeadFile } from '@/lib/file-parser';

interface CampaignDetailsProps {
  campaign: Campaign;
  onBack: () => void;
  onRefresh: () => void;
}

export default function CampaignDetails({ campaign, onBack, onRefresh }: CampaignDetailsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    sent_count: campaign.sent_count,
    opened_count: campaign.opened_count,
    clicked_count: campaign.clicked_count,
    replied_count: campaign.replied_count
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLeads();
    loadStats();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      loadStats();
      loadLeads();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [campaign.id]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`);
      const data = await response.json();
      if (data.campaign) {
        setStats({
          sent_count: data.campaign.sent_count || 0,
          opened_count: data.campaign.opened_count || 0,
          clicked_count: data.campaign.clicked_count || 0,
          replied_count: data.campaign.replied_count || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/leads`);
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', file.name, file.size, 'bytes');
    setUploading(true);
    try {
      const rows = await parseLeadFile(file, campaign.campaign_type);
      console.log('📊 Parsed CSV rows:', rows.length);
      console.log('Sample row:', rows[0]);
      
      const response = await fetch('/api/leads/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          leads: rows
        })
      });

      const result = await response.json();
      console.log('📤 Upload response:', result);

      if (response.ok) {
        alert(`✅ Successfully uploaded ${result.inserted} leads!${result.errors > 0 ? `\n⚠️ ${result.errors} rows had minor issues.` : ''}`);
        loadLeads();
        onRefresh();
      } else {
        console.error('Upload failed:', result);
        // Build human-readable summary
        let summary = '';
        if (result.reasonCounts) {
          summary += '\nReasons:';
          Object.entries(result.reasonCounts).forEach(([reason, count]) => {
            summary += `\n - ${reason}: ${count}`;
          });
        }
        const firstErrors = (result.errorDetails || []).slice(0, 5)
          .map((e: any) => `Row ${e.rowNumber}: ${e.error}`)
          .join('\n');
        alert(`❌ Upload failed: ${result.error}\n${summary}\n\nFirst rows with issues:\n${firstErrors || 'None'}\n\nTip: Open the CSV in Notepad and confirm headers are exactly: name,email,profile_url (lowercase, commas).`);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV. Please check the format and console.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartCampaign = async () => {
    console.log('🟢 Start button clicked for campaign', campaign.id);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/start?mode=sync`, {
        method: 'POST'
      });
      const json = await res.json();
      console.log('🟢 Start response:', json);
      if (!res.ok) {
        alert(`Failed to start campaign: ${json.error || res.statusText}`);
      } else {
        if (json.processed !== undefined) {
          // Sync mode detailed summary
            const lines = [
              `Processed: ${json.processed}`,
              `Pending at start: ${json.pending}`,
              `Status counts: ${Object.entries(json.counts || {}).map(([k,v]) => k+'='+v).join(', ')}`
            ];
            if (Array.isArray(json.results)) {
              lines.push('\nLeads:');
              json.results.slice(0,5).forEach((r: any, i: number) => {
                lines.push(`${i+1}. id=${r.id.substring(0,8)} status=${r.finalStatus} emailLen=${r.emailLength || 0} mockScrape=${r.usedMockScrape ? 'yes':'no'}${r.error? ' error='+r.error:''}`);
              });
              if (json.results.length > 5) lines.push(`(+${json.results.length-5} more)`);
            }
            alert(lines.join('\n'));
        } else {
          alert(`Workflow started asynchronously. Pending leads: ${json.pending || 0}`);
        }
      }
      onRefresh();
      loadLeads();
    } catch (error) {
      console.error('Error starting campaign:', error);
      alert('Error starting campaign. Check console / server logs.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-400';
      case 'opened': return 'text-blue-400';
      case 'clicked': return 'text-purple-400';
      case 'replied': return 'text-pink-400';
      case 'meeting_booked': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleMarkMeeting = async (leadId: string) => {
    if (!confirm('Mark this lead as meeting booked? This will charge $19 to your account.')) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}/meeting`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('✅ Meeting marked as booked! $19 added to your monthly bill.');
        loadLeads();
        loadStats();
      } else {
        const error = await response.json();
        alert(`Failed to mark meeting: ${error.error}`);
      }
    } catch (error) {
      console.error('Error marking meeting:', error);
      alert('Error marking meeting. Please try again.');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Campaigns
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
            <p className="text-gray-400">{campaign.total_leads} leads • {campaign.sent_count} sent</p>
          </div>
          
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium disabled:opacity-50"
            >
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            
            {campaign.status !== 'active' ? (
              <button
                onClick={handleStartCampaign}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                <Play size={20} />
                Start Campaign
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Sent</div>
          <div className="text-3xl font-bold text-white">{stats.sent_count}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Opened</div>
          <div className="text-3xl font-bold text-green-400">{stats.opened_count}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.sent_count > 0 ? `${Math.round((stats.opened_count / stats.sent_count) * 100)}%` : '0%'}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Clicked</div>
          <div className="text-3xl font-bold text-blue-400">{stats.clicked_count}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.sent_count > 0 ? `${Math.round((stats.clicked_count / stats.sent_count) * 100)}%` : '0%'}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Replied</div>
          <div className="text-3xl font-bold text-purple-400">{stats.replied_count}</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.sent_count > 0 ? `${Math.round((stats.replied_count / stats.sent_count) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Leads</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 mb-4">No leads yet</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-400 hover:text-blue-300"
            >
              Upload your first file (CSV/XLSX)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sent At</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{lead.platform}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status === 'meeting_booked' ? '📅 Meeting Booked' : lead.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {lead.sent_at ? new Date(lead.sent_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {lead.status !== 'meeting_booked' && lead.status !== 'pending' && lead.status !== 'failed' ? (
                        <button
                          onClick={() => handleMarkMeeting(lead.id)}
                          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-medium transition-all"
                        >
                          Mark Meeting
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
