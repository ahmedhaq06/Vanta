'use client';

// Prevent build-time data collection; this page fetches at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  order_id: string;
  amount: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_spent: 0,
    pending_amount: 0,
    completed_count: 0
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/billing/transactions');
      const data = await response.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        calculateStats(data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txs: Transaction[]) => {
    const completed = txs.filter(t => t.status === 'completed');
    const pending = txs.filter(t => t.status === 'created');
    setStats({
      total_spent: completed.reduce((sum, t) => sum + parseFloat(t.amount), 0),
      pending_amount: pending.reduce((sum, t) => sum + parseFloat(t.amount), 0),
      completed_count: completed.length
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'failed':
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <Clock className="text-yellow-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Order ID'];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.type === 'initial' ? 'Credits' : 'Meeting',
      `$${parseFloat(t.amount).toFixed(2)}`,
      t.status,
      t.order_id
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanta-billing-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </a>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Billing & Transactions</h1>
              <p className="text-gray-400">View your payment history and transaction details</p>
            </div>
            <button
              onClick={exportCSV}
              disabled={transactions.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="text-green-400" size={24} />
              <div className="text-sm text-gray-400">Total Spent</div>
            </div>
            <div className="text-3xl font-bold text-white">${stats.total_spent.toFixed(2)}</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-blue-400" size={24} />
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.completed_count}</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-yellow-400" size={24} />
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <div className="text-3xl font-bold text-white">${stats.pending_amount.toFixed(2)}</div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No transactions yet</p>
              <a href="/pay?type=initial" className="text-indigo-400 hover:text-indigo-300">
                Make your first purchase
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {tx.type === 'initial' ? (
                          <span className="px-2 py-1 bg-indigo-900/30 text-indigo-400 rounded-md text-xs font-medium">
                            Credits
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded-md text-xs font-medium">
                            Meeting
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        ${parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <span className={`capitalize ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {tx.order_id.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
