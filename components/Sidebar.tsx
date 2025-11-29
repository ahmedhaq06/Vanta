'use client';

import { BarChart3, Zap, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: 'campaigns' | 'analytics';
  setActiveView: (view: 'campaigns' | 'analytics') => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 bg-black border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <a href="/" target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Vanta
          </h1>
          <p className="text-xs text-gray-500 mt-1">AI Outreach Automation</p>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <button
            onClick={() => setActiveView('campaigns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'campaigns'
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
            }`}
          >
            <Zap size={20} />
            <span className="font-medium">Campaigns</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'analytics'
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
            }`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Analytics</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <a
          href="/templates"
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-gray-900/50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium">Templates</span>
        </a>
        <a
          href="/settings"
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-gray-900/50 transition-all"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </a>
      </div>
    </aside>
  );
}
