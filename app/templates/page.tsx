'use client';

import { useState } from 'react';
import { emailTemplates, getAllCategories, getTemplatesByCategory } from '@/lib/email-templates';
import { Mail, Search, Copy, Check } from 'lucide-react';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', ...getAllCategories()];
  
  const filteredTemplates = emailTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyTemplate = (subject: string, body: string, id: string) => {
    const text = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Templates</h1>
          <p className="text-gray-400">Pre-written templates to jumpstart your campaigns</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Subject:</p>
                  <p className="text-sm text-gray-300 font-medium">{template.subject}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <p className="text-sm text-gray-400 line-clamp-4 whitespace-pre-line">
                    {template.body}
                  </p>
                </div>

                {template.variables.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400"
                        >
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => copyTemplate(template.subject, template.body, template.id)}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                {copiedId === template.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Template
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No templates found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
