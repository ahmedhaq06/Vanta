'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, CreditCard, Save, Loader2, Zap, ArrowLeft, X } from 'lucide-react';

interface UserSettings {
  daily_email_limit: number;
  emails_sent_today: number;
  test_credits_remaining: number;
  test_credits_purchased: number;
  meetings_booked_this_month: number;
  total_meetings_booked: number;
  total_amount_due: number;
  billing_status: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  payment_method: string;
}

type TabType = 'usage' | 'billing' | 'unsubscribe';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('usage');
  const [settings, setSettings] = useState<UserSettings>({
    daily_email_limit: 100,
    emails_sent_today: 0,
    test_credits_remaining: 500,
    test_credits_purchased: 500,
    meetings_booked_this_month: 0,
    total_meetings_booked: 0,
    total_amount_due: 0,
    billing_status: 'active'
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempLimit, setTempLimit] = useState(100);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    if (activeTab === 'billing') {
      loadTransactions();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
        setTempLimit(data.settings.daily_email_limit);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/billing/transactions');
      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsubscribeEmail.trim()) return;

    setUnsubscribeLoading(true);
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unsubscribeEmail }),
      });

      if (response.ok) {
        alert('✅ Email unsubscribed successfully!');
        setUnsubscribeEmail('');
      } else {
        const data = await response.json();
        alert(`❌ ${data.error || 'Failed to unsubscribe'}`);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('❌ Error processing unsubscribe request');
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_email_limit: tempLimit
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        alert('✅ Settings saved successfully!');
      } else {
        alert('❌ Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const progressPercentage = (settings.emails_sent_today / settings.daily_email_limit) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </a>
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="text-purple-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-gray-400">Manage your account preferences and limits</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'usage'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Usage
            {activeTab === 'usage' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'billing'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Billing
            {activeTab === 'billing' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('unsubscribe')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'unsubscribe'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Unsubscribe
            {activeTab === 'unsubscribe' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        </div>

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <>
            {/* Daily Email Limit */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
              <div className="flex items-start gap-3 mb-6">
                <Mail className="text-purple-500 mt-1" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Daily Email Limit</h2>
                  <p className="text-gray-400 text-sm">
                    Control how many emails are sent per day to warm up your sender reputation
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-700 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 font-medium">Today's Progress</span>
                  <span className="text-white font-bold">
                    {settings.emails_sent_today} / {settings.daily_email_limit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      progressPercentage >= 100 ? 'bg-red-500' : progressPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Set Daily Limit
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={tempLimit}
                    onChange={(e) => setTempLimit(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Start with 50-100/day, gradually increase
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || tempLimit === settings.daily_email_limit}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Credits */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <Zap className="text-purple-500 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Test Credits</h2>
              <p className="text-gray-400 text-sm">
                Track your remaining lead credits ($2 per 500 leads)
              </p>
            </div>
          </div>

          {/* Credits Usage */}
          <div className="bg-black/40 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 font-medium">Credits Remaining</span>
              <span className="text-white font-bold text-xl">
                {settings.test_credits_remaining} / 500
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  settings.test_credits_remaining <= 50
                    ? 'bg-red-500'
                    : settings.test_credits_remaining <= 200
                    ? 'bg-yellow-500'
                    : 'bg-white'
                }`}
                style={{ width: `${(settings.test_credits_remaining / 500) * 100}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {500 - settings.test_credits_remaining} leads used
              </span>
              <span className="text-xs text-gray-500">
                Total purchased: {settings.test_credits_purchased}
              </span>
            </div>
          </div>

          {/* Low Credits Warning */}
          {settings.test_credits_remaining <= 50 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-red-400 mb-2">⚠️ Low Credits</h4>
              <p className="text-xs text-gray-300 mb-3">
                You're running low on credits. Purchase more to continue using the platform.
              </p>
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all">
                Buy 500 Credits - $2
              </button>
            </div>
          )}

          {settings.test_credits_remaining === 0 && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-red-400 mb-2">🚫 No Credits Remaining</h4>
              <p className="text-sm text-gray-300 mb-4">
                You've used all your credits. Purchase more to upload leads and start campaigns.
              </p>
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg">
                Buy 500 Credits - $2
              </button>
            </div>
          )}
        </div>

            {/* Meeting-Based Billing */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <div className="flex items-start gap-3 mb-6">
            <CreditCard className="text-purple-500 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Meeting-Based Billing</h2>
              <p className="text-gray-400 text-sm">
                Pay $19 only when you book a qualified meeting
              </p>
            </div>
          </div>

          {/* This Month's Meetings */}
          <div className="bg-black/40 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Meetings This Month</div>
                <div className="text-3xl font-bold text-white">{settings.meetings_booked_this_month}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Amount Due</div>
                <div className="text-3xl font-bold text-white">${settings.total_amount_due.toFixed(2)}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Total meetings booked: {settings.total_meetings_booked}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-black/40 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-3">💰 Pricing Structure</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span>Test Credits (500 leads)</span>
                <span className="font-bold text-white">$2</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Per Qualified Meeting Booked</span>
                <span className="font-bold text-white">$19</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Only charged when you successfully book a qualified meeting. No hidden fees.
            </p>
          </div>
            </div>
          </>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex items-start gap-3 mb-6">
              <CreditCard className="text-purple-500 mt-1" size={24} />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">Transaction History</h2>
                <p className="text-gray-400 text-sm">
                  View all your payment transactions and invoices
                </p>
              </div>
              <a
                href="/pay"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
              >
                Buy Credits
              </a>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Total Spent</div>
                <div className="text-2xl font-bold text-white">
                  ${transactions
                    .filter((t) => t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </div>
              </div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Completed</div>
                <div className="text-2xl font-bold text-white">
                  {transactions.filter((t) => t.status === 'completed').length}
                </div>
              </div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">
                  ${transactions
                    .filter((t) => t.status === 'pending')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-800 hover:bg-black/20">
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300 capitalize">
                          {transaction.type.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-white">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'completed'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400 capitalize">
                          {transaction.payment_method}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Unsubscribe Tab */}
        {activeTab === 'unsubscribe' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex items-start gap-3 mb-6">
              <X className="text-red-500 mt-1" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Unsubscribe Email</h2>
                <p className="text-gray-400 text-sm">
                  Remove an email address from all future campaigns
                </p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Important</h4>
              <p className="text-xs text-gray-300">
                Once unsubscribed, this email will be automatically skipped in all current and future campaigns.
                This action cannot be undone.
              </p>
            </div>

            <form onSubmit={handleUnsubscribe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address to Unsubscribe
                </label>
                <input
                  type="email"
                  required
                  value={unsubscribeEmail}
                  onChange={(e) => setUnsubscribeEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={unsubscribeLoading || !unsubscribeEmail.trim()}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {unsubscribeLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <X size={16} />
                    Unsubscribe Email
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 bg-black/40 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">How it Works</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>The email will be added to your suppression list</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Future campaigns will automatically skip this email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Active campaigns will respect this unsubscribe immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>This helps maintain good sender reputation and comply with CAN-SPAM</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
