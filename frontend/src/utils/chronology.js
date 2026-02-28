/**
 * 工具：解析编年数据、打标签并按年份聚合
 */

import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const cols = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j += 1) {
      const ch = line[j];
      if (ch === '"') { inQuotes = !inQuotes; } 
      else if (ch === ',' && !inQuotes) { cols.push(current); current = ''; } 
      else { current += ch; }
    }
    cols.push(current);

    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

export function parseDateToYMD(raw) {
  if (!raw) return { year: NaN, month: null, day: null };
  const parts = raw.split('.');
  const year = parseInt(parts[0], 10);
  if (Number.isNaN(year)) return { year: NaN, month: null, day: null };
  const month = parts[1] && /^\d+$/.test(parts[1]) ? parseInt(parts[1], 10) : null;
  const day = parts[2] && /^\d+$/.test(parts[2]) ? parseInt(parts[2], 10) : null;
  return { year, month, day };
}

/**
 * 依據專業關鍵詞優化打標邏輯
 */
export function assignThemes(ev) {
  const themes = new Set();
  const action = (ev.action || '').toLowerCase();
  const text = `${ev.summary || ''} ${ev.details || ''}`.toLowerCase();

  const includesAny = (target, keywords) => keywords.some((k) => target.includes(k));

  // 1. 學業與科舉 (Education)
  if (
    includesAny(action, ['聘任', '應試', '授課', '講學', '主講', '校長']) ||
    includesAny(text, ['童子試', '府試', '院試', '書院', '入學', '留學', '科舉', '貢生', '教授'])
  ) {
    themes.add('education');
  }

  // 2. 行旅與山水 (Travel)
  if (
    includesAny(action, ['紀游', '位移', '考察', '寫生']) ||
    includesAny(text, ['游', '行旅', '登', '至', '抵', '山', '峽', '江', '湖', '名勝', '入蜀', '歸粵'])
  ) {
    themes.add('travel');
  }

  // 3. 師承與交游 (Networking)
  if (
    includesAny(action, ['雅集', '書信', '函', '訪', '晤']) ||
    includesAny(text, ['從', '問學', '友人', '同門', '同學', '致', '酬唱', '詩友', '結社', '知音'])
  ) {
    themes.add('teachers');
  }

  // 4. 創作與鑒藏 (Artistic Practice)
  if (
    includesAny(action, ['展覽', '出版', '編纂']) ||
    includesAny(text, ['畫', '墨', '印', '藏', '鑒', '鑒定', '出版', '國光', '神州', '變法', '黑密', '厚重', '簡筆', '題跋'])
  ) {
    themes.add('creation');
  }

  // 5. 時代與政局 (History & Politics)
  if (
    includesAny(text, ['戰爭', '革命', '軍', '甲午', '抗日', '政局', '新中國', '太平', '清', '官', '職', '沒收', '亂', '局'])
  ) {
    themes.add('politics');
  }

  // 6. 家族與日常 (Family & Daily)
  if (
    includesAny(text, ['父', '母', '祖', '兄', '弟', '妻', '子', '女', '葬', '婚', '遷', '病', '壽', '生', '卒'])
  ) {
    themes.add('family');
  }

  // 兜底邏輯
  if (themes.size === 0) themes.add('family');

  const allowed = new Set(CHRONOLOGY_THEMES.map((t) => t.id));
  return Array.from(themes).filter((id) => allowed.has(id));
}

export function buildYearBuckets(events) {
  const map = new Map();
  events.forEach((ev) => {
    if (!Number.isFinite(ev.year)) return;
    if (!map.has(ev.year)) {
      map.set(ev.year, {
        year: ev.year,
        events: [],
        totalWeight: 0,
        maxWeight: 0,
        byTheme: {}
      });
    }
    const bucket = map.get(ev.year);
    const w = ev.socialWeight || 0;
    bucket.events.push(ev);
    bucket.totalWeight += w;
    if (w > bucket.maxWeight) bucket.maxWeight = w;

    (ev.themes || []).forEach((themeId) => {
      if (!bucket.byTheme[themeId]) {
        bucket.byTheme[themeId] = { count: 0, totalWeight: 0 };
      }
      bucket.byTheme[themeId].count += 1;
      bucket.byTheme[themeId].totalWeight += w;
    });
  });
  return Array.from(map.values()).sort((a, b) => a.year - b.year);
}
