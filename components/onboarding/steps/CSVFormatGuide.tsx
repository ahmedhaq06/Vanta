'use client';

import { FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';
import { CampaignType } from '@/lib/types';

interface CSVFormatGuideProps {
  campaignType: CampaignType;
}

export default function CSVFormatGuide({ campaignType }: CSVFormatGuideProps) {
  const downloadTemplate = () => {
    let csvContent = '';
    let filename = '';

    if (campaignType === 'b2b') {
      csvContent = 'business_name,niche,website,email\n';
      csvContent += 'Acme Corp,SaaS,https://acmecorp.com,contact@acmecorp.com\n';
      csvContent += 'TechStart Inc,AI/ML,https://techstart.io,hello@techstart.io\n';
      csvContent += 'GrowthCo,Marketing,https://growthco.com,team@growthco.com';
      filename = 'b2b_template.csv';
    } else {
      csvContent = 'name,email,profile_url\n';
      csvContent += 'John Doe,john@example.com,https://linkedin.com/in/johndoe\n';
      csvContent += 'Jane Smith,jane@example.com,https://twitter.com/janesmith\n';
      csvContent += 'Mike Johnson,mike@example.com,https://linkedin.com/in/mikejohnson';
      filename = 'b2c_template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">CSV File Format</h2>
        <p className="text-gray-400 text-lg">
          {campaignType === 'b2b' ? 'Business data format for B2B outreach' : 'Individual data format for B2C outreach'}
        </p>
      </div>

      {/* Download Template Button */}
      <div className="flex justify-center">
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-semibold shadow-lg hover:scale-105"
        >
          <Download size={20} />
          Download CSV Template
        </button>
      </div>

      {/* Format Instructions */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <FileSpreadsheet size={24} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {campaignType === 'b2b' ? 'B2B CSV Format' : 'B2C CSV Format'}
            </h3>
            <p className="text-sm text-gray-400">
              Your CSV file must include the following columns (case-sensitive):
            </p>
          </div>
        </div>

        {campaignType === 'b2b' ? (
          <div className="space-y-4">
            {/* B2B Required Fields */}
            <div className="bg-black/30 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle2 size={14} />
                Required Fields
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded text-xs">
                      business_name
                    </code>
                    <span className="text-xs text-red-400">*</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-2">
                    Company or business name
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded text-xs">
                      niche
                    </code>
                    <span className="text-xs text-red-400">*</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-2">
                    Business industry or niche (e.g., "SaaS", "E-commerce", "Marketing Agency")
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded text-xs">
                      website
                    </code>
                    <span className="text-xs text-red-400">*</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-2">
                    Company website URL (used for scraping business information)
                  </p>
                </div>
              </div>
            </div>

            {/* B2B Optional Fields */}
            <div className="bg-black/30 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-blue-400 mb-2">Optional Fields</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded text-xs">
                      email
                    </code>
                  </div>
                  <p className="text-xs text-gray-400 pl-2">
                    Contact email (if not provided, we'll attempt to find it from the website)
                  </p>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="bg-black/40 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-white mb-2">Example CSV:</h4>
              <pre className="text-xs text-gray-300 overflow-x-auto" style={{fontSize: '0.7rem'}}>
{`business_name,niche,website,email
Acme Corp,SaaS,https://acmecorp.com,contact@acmecorp.com
TechStart Inc,AI/ML,https://techstart.io,hello@techstart.io
GrowthCo,Marketing,https://growthco.com,team@growthco.com`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {/* B2C Required Fields */}
            <div className="bg-black/30 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle2 size={14} />
                Required Fields
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded text-xs">
                      name
                    </code>
                    <span className="text-xs text-red-400">*</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-2">
                    Full name of the person
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded text-xs">
                      email
                    </code>
                    <span className="text-xs text-red-400">*</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-2">
                    Email address of the person
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded text-xs">
                      profile_url
                    </code>
                    <span className="text-xs text-red-400">*</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-2">
                    Social profile URL (LinkedIn, Twitter/X, or Instagram)
                  </p>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="bg-black/40 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-white mb-2">Example CSV:</h4>
              <pre className="text-xs text-gray-300 overflow-x-auto" style={{fontSize: '0.7rem'}}>
{`name,email,profile_url
John Doe,john@example.com,https://linkedin.com/in/johndoe
Jane Smith,jane@example.com,https://twitter.com/janesmith
Mike Johnson,mike@example.com,https://linkedin.com/in/mikejohnson`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-yellow-400 mb-2">⚠️ Important Notes</h4>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>• Column names must be <strong>exactly as shown</strong> (lowercase, underscores)</li>
          <li>• First row must contain the column headers</li>
          <li>• All required fields must have values (no empty cells)</li>
          <li>• Supported file formats: CSV (.csv), Excel (.xlsx, .xls)</li>
          <li>• Maximum file size: 10MB</li>
          {campaignType === 'b2b' && <li>• Website URLs should include https:// or http://</li>}
          {campaignType === 'b2c' && <li>• Profile URLs must be from LinkedIn, Twitter/X, or Instagram</li>}
        </ul>
      </div>
    </div>
  );
}
