import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CSVRow, B2BCSVRow, B2CCSVRow, PlatformType, CampaignType } from './types';
import { detectPlatform, isValidEmail } from './csv-parser'; // reuse helpers

// Normalize header variants (expanded for common exports) - B2C
const B2C_HEADER_ALIASES: Record<string,string> = {
  // Name variants
  'name':'name','full name':'name','fullname':'name','first name':'name','contact name':'name',
  // Email variants
  'email':'email','e-mail':'email','mail':'email','work email':'email','business email':'email','email address':'email','address':'email',
  // Profile URL / social
  'profile_url':'profile_url','profile url':'profile_url','profile':'profile_url','linkedin':'profile_url','linkedin url':'profile_url','linkedin profile':'profile_url','linkedin profile url':'profile_url','link':'profile_url','url':'profile_url','social url':'profile_url','profile link':'profile_url'
};

// B2B header aliases
const B2B_HEADER_ALIASES: Record<string,string> = {
  // Business name variants
  'business_name':'business_name','business name':'business_name','company':'business_name','company name':'business_name','organization':'business_name','business':'business_name',
  // Niche variants
  'niche':'niche','industry':'niche','sector':'niche','category':'niche','vertical':'niche',
  // Website variants
  'website':'website','web':'website','site':'website','url':'website','website url':'website','company website':'website','web address':'website',
  // Email variants
  'email':'email','e-mail':'email','mail':'email','work email':'email','business email':'email','email address':'email','contact email':'email'
};

function normalizeHeader(h: string, campaignType: CampaignType = 'b2c'): string {
  const key = h.replace(/\uFEFF/g,'').trim().toLowerCase();
  const aliases = campaignType === 'b2b' ? B2B_HEADER_ALIASES : B2C_HEADER_ALIASES;
  return aliases[key] || key;
}

export async function parseLeadFile(file: File, campaignType: CampaignType): Promise<CSVRow[] | B2BCSVRow[]> {
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext === 'csv') return parseCSV(file, campaignType);
  if (ext === 'xlsx' || ext === 'xls') return parseXLSX(file, campaignType);
  throw new Error('Unsupported file type. Please upload CSV or Excel (.xlsx / .xls)');
}

async function parseXLSX(file: File, campaignType: CampaignType): Promise<CSVRow[] | B2BCSVRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  console.log('📘 XLSX sheets:', wb.SheetNames);

  const allRows: any[] = [];
  // Iterate sheets until we collect rows
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) {
      console.warn(`⚠ Sheet ${sheetName} has no ref / data range.`);
      continue;
    }
    const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
    console.log(`📘 Sheet '${sheetName}' raw rows (first 3):`, json.slice(0,3));

    let sheetRows: any[] = json.map((row, idx) => {
      const normalized: Record<string,string> = {};
      const keys = Object.keys(row);
      // Combined header fallback
      if (keys.length === 1) {
        const combinedHeader = keys[0];
        const delimiter = combinedHeader.includes(';') ? ';' : (combinedHeader.includes('\t') ? '\t' : (combinedHeader.includes(',') ? ',' : null));
        if (delimiter) {
          const headerParts = combinedHeader.split(delimiter).map(h => normalizeHeader(h, campaignType));
          const rawValue = String((row as any)[combinedHeader]);
          const valueParts = rawValue.split(delimiter).map(v => v.trim());
          headerParts.forEach((h,i) => { normalized[h] = valueParts[i] || ''; });
          console.warn(`⚠ XLSX combined header detected using delimiter '${delimiter}' at row ${idx+1} (sheet ${sheetName})`);
        }
      }
      if (Object.keys(normalized).length === 0) {
        Object.entries(row).forEach(([k,v]) => {
          normalized[normalizeHeader(k, campaignType)] = String(v).trim();
        });
      }
      
      if (campaignType === 'b2b') {
        const r: B2BCSVRow = {
          business_name: normalized['business_name'] || '',
          niche: normalized['niche'] || '',
          website: normalized['website'] || '',
          email: normalized['email'] || ''
        };
        console.log(`📘 [${sheetName}] B2B row ${idx+1} parsed:`, r);
        return r;
      } else {
        const r: CSVRow = {
          name: normalized['name'] || '',
          email: normalized['email'] || '',
          profile_url: normalized['profile_url'] || ''
        };
        console.log(`📘 [${sheetName}] B2C row ${idx+1} parsed:`, r);
        return r;
      }
    }).filter(r => {
      if (campaignType === 'b2b') {
        const b2bRow = r as B2BCSVRow;
        return !(b2bRow.business_name === '' && b2bRow.niche === '' && b2bRow.website === '');
      } else {
        const b2cRow = r as CSVRow;
        return !(b2cRow.name === '' && b2cRow.email === '' && b2cRow.profile_url === '');
      }
    });

    // Manual fallback if sheet_to_json produced 0 data rows but there appears to be a header row
    if (sheetRows.length === 0) {
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const headerRowIndex = range.s.r; // first row
      const headerCells: string[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddr = XLSX.utils.encode_cell({ r: headerRowIndex, c });
        const cell = sheet[cellAddr];
        headerCells.push(cell ? String(cell.v).trim() : '');
      }
      const normalizedHeaders = headerCells.map(h => normalizeHeader(h, campaignType)).filter(h => h);
      console.log(`🔍 Manual header inspection for sheet '${sheetName}':`, normalizedHeaders);
      // Heuristic 1: Proper headers present (normal case)
      const hasHeaderSet = campaignType === 'b2b' 
        ? (normalizedHeaders.some(h => h === 'business_name') && normalizedHeaders.some(h => h === 'niche') && normalizedHeaders.some(h => h === 'website'))
        : (normalizedHeaders.some(h => h === 'name') && (normalizedHeaders.some(h => h === 'email') || normalizedHeaders.some(h => h === 'mail')) && normalizedHeaders.some(h => h === 'profile_url'));

      // Heuristic 2: Header row actually looks like data (headerless sheet). e.g. first row contains an email/URL.
      const headerRowLooksLikeData = headerCells.some(v => /@/.test(v)) && headerCells.some(v => /https?:\/\//i.test(v));

      if (hasHeaderSet) {
        // Build rows from subsequent lines using headers
        for (let rIndex = headerRowIndex + 1; rIndex <= range.e.r; rIndex++) {
          const draft: Record<string,string> = {};
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cellAddr = XLSX.utils.encode_cell({ r: rIndex, c });
            const cell = sheet[cellAddr];
            const header = normalizedHeaders[c - range.s.c];
            if (header) draft[header] = cell ? String(cell.v).trim() : '';
          }
          if (campaignType === 'b2b') {
            const r: B2BCSVRow = {
              business_name: draft['business_name'] || '',
              niche: draft['niche'] || '',
              website: draft['website'] || '',
              email: draft['email'] || ''
            };
            if (!(r.business_name === '' && r.niche === '' && r.website === '')) {
              console.log(`🛠 Manual XLSX B2B row constructed (${sheetName}) r=${rIndex - headerRowIndex}:`, r);
              sheetRows.push(r);
            }
          } else {
            const r: CSVRow = {
              name: draft['name'] || '',
              email: draft['email'] || draft['mail'] || '',
              profile_url: draft['profile_url'] || ''
            };
            if (!(r.name === '' && r.email === '' && r.profile_url === '')) {
              console.log(`🛠 Manual XLSX B2C row constructed (${sheetName}) r=${rIndex - headerRowIndex}:`, r);
              sheetRows.push(r);
            }
          }
        }
      } else if (headerRowLooksLikeData) {
        console.warn(`⚠ Treating first row as data (headerless sheet) for '${sheetName}'.`);
        // Map columns by position
        const extractRow = (rIndex: number): CSVRow | B2BCSVRow => {
          const vals: string[] = [];
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cellAddr = XLSX.utils.encode_cell({ r: rIndex, c });
            const cell = sheet[cellAddr];
            vals.push(cell ? String(cell.v).trim() : '');
          }
          if (campaignType === 'b2b') {
            return {
              business_name: vals[0] || '',
              niche: vals[1] || '',
              website: vals[2] || '',
              email: vals[3] || ''
            };
          } else {
            const candidate: CSVRow = {
              name: vals[0] || '',
              email: vals[1] || '',
              profile_url: vals[2] || ''
            };
            // If 4th column is a platform and profile_url missing protocol, attempt to build URL or accept explicit platform URL later.
            if (!candidate.profile_url && vals[3]) {
              candidate.profile_url = vals[3];
            }
            return candidate;
          }
        };
        for (let rIndex = headerRowIndex; rIndex <= range.e.r; rIndex++) {
          const r = extractRow(rIndex);
          if (campaignType === 'b2b') {
            const b2bRow = r as B2BCSVRow;
            if (!(b2bRow.business_name === '' && b2bRow.niche === '' && b2bRow.website === '')) {
              console.log(`🛠 Headerless XLSX B2B row ${rIndex - headerRowIndex + 1} (${sheetName}):`, r);
              sheetRows.push(r);
            }
          } else {
            const b2cRow = r as CSVRow;
            if (!(b2cRow.name === '' && b2cRow.email === '' && b2cRow.profile_url === '')) {
              console.log(`🛠 Headerless XLSX B2C row ${rIndex - headerRowIndex + 1} (${sheetName}):`, r);
              sheetRows.push(r);
            }
          }
        }
      } else {
        console.warn(`⚠ Manual fallback skipped for sheet '${sheetName}' due to missing expected headers and data heuristics.`);
      }
    }

    if (sheetRows.length > 0) {
      console.log(`✅ Sheet '${sheetName}' produced ${sheetRows.length} rows.`);
      allRows.push(...sheetRows);
    } else {
      console.warn(`⚠ Sheet '${sheetName}' produced 0 usable rows.`);
    }
  }

  console.log('📘 XLSX total aggregated rows:', allRows.length);
  return allRows;
}

function parseCSV(file: File, campaignType: CampaignType): Promise<CSVRow[] | B2BCSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => normalizeHeader(header, campaignType),
      complete: (results) => {
        try {
          const rawFields = results.meta?.fields || [];
          const singleCombinedHeader = rawFields.length === 1 ? rawFields[0] : null;
          const combinedHeaderDelimiter = singleCombinedHeader && (singleCombinedHeader.includes(';') ? ';' : (singleCombinedHeader.includes('\t') ? '\t' : (singleCombinedHeader.includes(',') ? ',' : null)));
          if (combinedHeaderDelimiter) {
            console.warn(`⚠ CSV combined header detected using delimiter '${combinedHeaderDelimiter}'`);
          }
          const rows: any[] = (results.data as any[]).map((raw, idx) => {
            const norm: Record<string,string> = {};
            if (combinedHeaderDelimiter && singleCombinedHeader) {
            const headerParts = singleCombinedHeader.split(combinedHeaderDelimiter).map(h => normalizeHeader(h, campaignType));
            const rawValue = String((raw as any)[singleCombinedHeader] || '');
            const valueParts = rawValue.split(combinedHeaderDelimiter).map(v => v.trim());
            headerParts.forEach((h,i) => { norm[h] = valueParts[i] || ''; });
            } else {
              Object.entries(raw).forEach(([k,v]) => {
                norm[normalizeHeader(k, campaignType)] = typeof v === 'string' ? v.trim() : String(v);
              });
            }
            
            if (campaignType === 'b2b') {
              const row: B2BCSVRow = {
                business_name: norm['business_name'] || '',
                niche: norm['niche'] || '',
                website: norm['website'] || '',
                email: norm['email'] || ''
              };
              console.log(`📄 CSV B2B row ${idx+1} parsed:`, row);
              return row;
            } else {
              const row: CSVRow = {
                name: norm['name'] || '',
                email: norm['email'] || '',
                profile_url: norm['profile_url'] || ''
              };
              console.log(`📄 CSV B2C row ${idx+1} parsed:`, row);
              return row;
            }
          }).filter(r => {
            if (campaignType === 'b2b') {
              const b2bRow = r as B2BCSVRow;
              return !(b2bRow.business_name === '' && b2bRow.niche === '' && b2bRow.website === '');
            } else {
              const b2cRow = r as CSVRow;
              return !(b2cRow.name === '' && b2cRow.email === '' && b2cRow.profile_url === '');
            }
          });
          console.log('📄 CSV total parsed after empty-filter:', rows.length);
          resolve(rows);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err)
    });
  });
}

export function summarizeRows(rows: CSVRow[] | B2BCSVRow[]) {
  if (rows.length === 0) return {};
  
  // Check if B2B or B2C based on first row
  const firstRow = rows[0];
  const isB2B = 'business_name' in firstRow;
  
  if (isB2B) {
    // For B2B, count by niche
    const nicheCounts: Record<string, number> = {};
    (rows as B2BCSVRow[]).forEach(r => {
      const niche = r.niche || 'unknown';
      nicheCounts[niche] = (nicheCounts[niche] || 0) + 1;
    });
    return nicheCounts;
  } else {
    // For B2C, count by platform
    const platformCounts: Record<string, number> = {};
    (rows as CSVRow[]).forEach(r => {
      const p = detectPlatform(r.profile_url);
      platformCounts[p || 'unknown'] = (platformCounts[p || 'unknown'] || 0) + 1;
    });
    return platformCounts;
  }
}
