'use client';

import { Campaign } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticsProps {
  campaigns: Campaign[];
}

export default function Analytics({ campaigns }: AnalyticsProps) {
  // Calculate overall stats
  const totalLeads = campaigns.reduce((sum, c) => sum + c.total_leads, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent_count, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened_count, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked_count, 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + c.replied_count, 0);

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0';

  // Prepare chart data
  const campaignData = campaigns.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    sent: c.sent_count,
    opened: c.opened_count,
    clicked: c.clicked_count,
    replied: c.replied_count
  }));

  const conversionData = [
    { stage: 'Sent', count: totalSent },
    { stage: 'Opened', count: totalOpened },
    { stage: 'Clicked', count: totalClicked },
    { stage: 'Replied', count: totalReplied }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Overview of your outreach performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Sent</span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{totalSent}</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Opened</span>
            <span className="text-xs text-green-500">{openRate}%</span>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">{totalOpened}</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${openRate}%` }}></div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Clicked</span>
            <span className="text-xs text-blue-500">{clickRate}%</span>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">{totalClicked}</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${clickRate}%` }}></div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Replied</span>
            <span className="text-xs text-purple-500">{replyRate}%</span>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">{totalReplied}</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${replyRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Campaign Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="sent" fill="#3B82F6" name="Sent" />
              <Bar dataKey="opened" fill="#10B981" name="Opened" />
              <Bar dataKey="replied" fill="#8B5CF6" name="Replied" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="stage" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign List */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">All Campaigns</h2>
        </div>
        
        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">No campaigns yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Open Rate</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Click Rate</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Reply Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {campaigns.map((campaign) => {
                  const cOpenRate = campaign.sent_count > 0 
                    ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) 
                    : '0';
                  const cClickRate = campaign.sent_count > 0 
                    ? ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1) 
                    : '0';
                  const cReplyRate = campaign.sent_count > 0 
                    ? ((campaign.replied_count / campaign.sent_count) * 100).toFixed(1) 
                    : '0';

                  return (
                    <tr key={campaign.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{campaign.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{campaign.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">{campaign.sent_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-400">{cOpenRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-400">{cClickRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-400">{cReplyRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
