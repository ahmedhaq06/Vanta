import Papa from 'papaparse';
import { CSVRow, PlatformType } from './types';

// NOTE: We now return ALL parsed rows (even invalid) and let the API route perform validation.
// This avoids silent loss when headers contain hidden characters (e.g. BOM \uFEFF) or slight casing differences.
export function parseCSV(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.replace(/\uFEFF/g, '').trim(),
      complete: (results) => {
        try {
          // Log raw headers for debugging
          // (Visible only in browser console – safe for development)
          console.log('🔎 Raw CSV Headers:', results.meta?.fields);

          const rawFields = results.meta?.fields || [];
          const singleCombinedHeader = rawFields.length === 1 ? rawFields[0] : null;
          const combinedHeaderDelimiter = singleCombinedHeader && (singleCombinedHeader.includes(';') ? ';' : (singleCombinedHeader.includes('\t') ? '\t' : null));

          let rows: CSVRow[] = results.data.map((raw: any, idx: number) => {
            let row: CSVRow = { name: '', email: '', profile_url: '' };

            if (combinedHeaderDelimiter) {
              // Fallback: header came in as one field e.g. "name;email;profile_url"
              const headerParts = singleCombinedHeader!.split(combinedHeaderDelimiter).map(h => h.trim().toLowerCase());
              const rawValue: string = raw[singleCombinedHeader!] || '';
              const valueParts = rawValue.split(combinedHeaderDelimiter).map(v => (typeof v === 'string' ? v.trim() : v));
              headerParts.forEach((h, i) => {
                if (h === 'name') row.name = valueParts[i] || '';
                if (h === 'email') row.email = valueParts[i] || '';
                if (h === 'profile_url') row.profile_url = valueParts[i] || '';
              });
              console.log(`🛠 Fallback parsed row ${idx + 1}:`, row);
            } else {
              // Normal path
              const normalized: Record<string, any> = {};
              Object.entries(raw).forEach(([k, v]) => {
                const nk = k.replace(/\uFEFF/g, '').trim().toLowerCase();
                normalized[nk] = typeof v === 'string' ? v.trim() : v;
              });
              row = {
                name: (normalized['name'] || '').trim(),
                email: (normalized['email'] || '').trim(),
                profile_url: (normalized['profile_url'] || '').trim(),
              };
              console.log(`📄 Row ${idx + 1} parsed:`, row);
            }
            return row;
          });
          // Filter out completely empty rows (all three fields blank)
          rows = rows.filter((r: CSVRow) => !(r.name === '' && r.email === '' && r.profile_url === ''));

          console.log('📦 Total rows after removing empty ones:', rows.length);
          if (combinedHeaderDelimiter) {
            console.warn(`⚠ Detected combined header with delimiter '${combinedHeaderDelimiter}'. Applied fallback parsing.`);
          }

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function detectPlatform(profileUrl: string): PlatformType | null {
  const url = profileUrl.toLowerCase();
  
  if (url.includes('linkedin.com')) {
    return 'LinkedIn';
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'X';
  } else if (url.includes('instagram.com')) {
    return 'Instagram';
  }
  
  return null;
}

export function validateCSVRow(row: CSVRow): string | null {
  if (!row.name) return 'Name is required';
  if (!row.email) return 'Email is required';
  if (!isValidEmail(row.email)) return 'Invalid email format';
  if (!row.profile_url) return 'Profile URL is required';
  const platform = detectPlatform(row.profile_url);
  if (!platform) return 'Profile URL must be from LinkedIn, X, or Instagram';
  return null;
}
