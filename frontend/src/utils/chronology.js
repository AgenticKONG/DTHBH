/**
 * 工具：解析编年数据、打标签并按年份聚合
 */

import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

/**
 * 简单 CSV 解析器（假设首行为表头，逗号分隔，内容中如有逗号已在源文件中处理）
 * @param {string} text
 * @returns {Array<Object>}
 */
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
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cols.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    cols.push(current);

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

/**
 * 从字符串日期中提取年份
 * @param {string} raw
 * @returns {{ year: number, month: (number|null), day: (number|null) }}
 */
export function parseDateToYMD(raw) {
  if (!raw) return { year: NaN, month: null, day: null };
  const parts = raw.split('.');
  const year = parseInt(parts[0], 10);
  if (Number.isNaN(year)) {
    return { year: NaN, month: null, day: null };
  }
  const month = parts[1] && /^\d+$/.test(parts[1]) ? parseInt(parts[1], 10) : null;
  const day = parts[2] && /^\d+$/.test(parts[2]) ? parseInt(parts[2], 10) : null;
  return { year, month, day };
}

/**
 * 依据 Subject_Action / Summary_Text / Details_Evidence 打主题标签
 * @param {Object} ev
 * @returns {string[]}
 */
export function assignThemes(ev) {
  const themes = new Set();
  const action = (ev.action || '').toLowerCase();
  const text = `${ev.summary || ''} ${ev.details || ''}`.toLowerCase();

  const includesAny = (target, keywords) =>
    keywords.some((k) => target.includes(k));

  // 学业与科举
  if (
    includesAny(action, ['書信', '书信', '聘任', '應試', '应试']) ||
    includesAny(text, ['童子試', '童子试', '府試', '府试', '院試', '院试', '書院', '书院', '講學', '讲学', '科舉', '科举'])
  ) {
    themes.add('education');
  }

  // 行旅与山水
  if (
    includesAny(action, ['紀游', '纪游', '位移']) ||
    includesAny(text, ['遊', '游', '行旅', '登', '寫生', '写生', '山', '江', '湖'])
  ) {
    themes.add('travel');
  }

  // 师承与交游
  if (
    includesAny(text, ['從', '从', '問學', '问学', '為師', '为师', '門人', '门人', '弟子', '友人', '同學', '同学'])
  ) {
    themes.add('teachers');
  }

  // 创作与鉴藏
  if (
    includesAny(text, ['作畫', '作画', '山水圖', '山水图', '刻印', '印譜', '印谱', '藏書', '藏画', '鑒定', '鉴定', '畫展', '画展'])
  ) {
    themes.add('creation');
  }

  // 时代与政局
  if (
    includesAny(text, ['戰爭', '战争', '革命', '起義', '起义', '太平軍', '甲午', '抗日', '政局', '官', '督學', '学政'])
  ) {
    themes.add('politics');
  }

  // 家族与日常
  if (
    includesAny(text, ['父', '母', '祖父', '祖母', '兄弟', '妻', '子女', '家道', '葬', '婚', '遷居', '迁居'])
  ) {
    themes.add('family');
  }

  // 确保至少有一个主题，避免空集合
  if (themes.size === 0) {
    themes.add('family'); // 兜底归入日常/家族，可根据需要调整
  }

  // 只返回在 CHRONOLOGY_THEMES 中声明过的主题 id
  const allowed = new Set(CHRONOLOGY_THEMES.map((t) => t.id));
  return Array.from(themes).filter((id) => allowed.has(id));
}

/**
 * 构建年度聚合桶
 * @param {Array<Object>} events
 * @returns {Array<Object>}
 */
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

