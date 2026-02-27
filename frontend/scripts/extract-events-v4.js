const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜-from-doc.txt';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-events-v4.json';

const BIRTH_YEAR = 1865;
const DEATH_YEAR = 1955;

const content = fs.readFileSync(inputFile, 'utf-8');

let inMainSection = false;
let currentYear = null;
let currentEra = null;
let currentAge = null;

const allEvents = [];

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('黄賓虹年譜') && !inMainSection) {
    inMainSection = true;
    continue;
  }
  
  if (!inMainSection) continue;
  
  // 只在找到具体年份后遇到后记才停止（避免误判文件开头）
  if (currentYear && (line.includes('初版後記') || line.includes('主要參考書目') || line.includes('附錄：'))) {
    break;
  }
  
  const yearMatch = line.match(/^公元(\d{4})年/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= BIRTH_YEAR && year <= DEATH_YEAR) {
      currentYear = year;
      
      if (line.includes('民國')) {
        currentEra = '民國';
      } else if (line.includes('新中國') || line.includes('中華人民共和國')) {
        currentEra = '新中國';
      } else {
        currentEra = '晚清';
      }
      
      const ageMatch = line.match(/(\d+)歲/);
      currentAge = ageMatch ? parseInt(ageMatch[1]) : (year - BIRTH_YEAR);
      
      continue;
    }
  }
  
  if (currentYear && line.length > 3) {
    const dateMatch = line.match(/^(\d{1,2})月(\d{1,2})日(.+)/);
    const monthOnlyMatch = line.match(/^(\d{1,2})月(.+)/);
    
    let month = null;
    let day = null;
    let eventContent = '';
    
    if (dateMatch) {
      month = parseInt(dateMatch[1]);
      day = parseInt(dateMatch[2]);
      eventContent = dateMatch[3].trim();
    } else if (monthOnlyMatch) {
      const rawContent = monthOnlyMatch[2].trim();
      if (rawContent.length > 2) {
        month = parseInt(monthOnlyMatch[1]);
        eventContent = rawContent;
      }
    } else {
      const isYearHeader = /^公元\d+年/.test(line);
      const isQuote = line.startsWith('《') || line.startsWith('[') || line.startsWith('（');
      const isParenthetical = /^\([^)]+\)$/.test(line) || /^\[.*\]$/.test(line);
      const isBlank = line.length < 3;
      const hasYearInParens = /\(\d{4}[—\-]\d{4}\)/.test(line);
      
      if (!isYearHeader && !isQuote && !isParenthetical && !isBlank) {
        if (line.length > 3 && line.length < 120) {
          eventContent = line;
        }
      }
    }
    
    if (eventContent && eventContent.length > 2) {
      const isPureQuote = eventContent.startsWith('《') || eventContent.startsWith('[') || eventContent.startsWith('（') || eventContent.startsWith('「');
      const hasQuoteMark = eventContent.includes('《') || eventContent.includes('[') || eventContent.includes('「') || eventContent.includes('"') || eventContent.includes('"');
      const isAnnotation = eventContent.startsWith('按：') || eventContent.startsWith('按:') || eventContent.startsWith('赘语');
      const isFamilyEvent = /^(祖父|祖母|父|母|弟|妹|兄|姐|妻|子|女|伯|叔|舅|姨)/.test(eventContent) && !eventContent.includes('黄賓虹') && !eventContent.includes('先生');
      
      const categoryKeywords = {
        '出生': ['生於', '出生', '诞生', '诞辰'],
        '求学': ['入学', '肆业', '修业', '从师', '问业', '从', '习', '讀', '读', '学习', '畢業', '毕业'],
        '艺术': ['作畫', '作画', '畫', '画', '書法', '书法', '篆刻', '刻印', '臨摹', '临摹', '寫生', '写生', '山水', '花卉', '花鳥', '花鸟'],
        '交游': ['访', '来谒', '来见', '相访', '会见', '遇', '识', '交', '游', '赴', '去', '至', '抵', '同行'],
        '职业': ['任教', '任职', '聘', '辞', '赴任', '就职', '辞职', '创办', '设立', '成立', '开会', '参加'],
        '展览': ['展出', '展览', '展售', '画展', '个展', '陈列'],
        '著作': ['著', '编', '印行', '出版', '发行', '发表', '稿'],
        '家族': ['弟', '妹', '兄', '姐', '妻', '子', '婚', '嫁', '卒', '死', '逝', '病'],
        '逝世': ['去世', '逝世', '病逝', '卒于', '终于', '逝世', '亡'],
        '迁徙': ['迁', '搬', '移', '居', '住', '赴', '去', '至', '抵'],
      };
      
      let category = '其他';
      for (const [cat, kws] of Object.entries(categoryKeywords)) {
        if (kws.some(kw => eventContent.includes(kw))) {
          category = cat;
          break;
        }
      }
      
      const qualityIndicators = {
        high: ['，', '。', '：', '——'],
        low: ['。']
      };
      const hasProperPunctuation = /[，。、：；？！""''『』]/.test(eventContent);
      const isComplete = hasProperPunctuation || eventContent.length > 15;
      const quality = isComplete ? 'medium' : 'low';
      
      const isKeyEvent = /去世|逝世|病逝|卒于|终于|亡|長辭|诞辰|出生|始|创办|成立|任教|辞职|结婚|嫁|娶|獲獎|獲賞|捐獻|捐贈|出售|遷移|搬遷|遊歷|遊學|回國|出国|歸國|赴京|來訪|來謁/.test(eventContent);
      
      allEvents.push({
        id: `${currentYear}-${allEvents.length}`,
        year: currentYear,
        era: currentEra,
        age: currentAge,
        month: month,
        day: day,
        content: eventContent,
        flags: {
          isPureQuote: isPureQuote,
          hasQuoteMark: hasQuoteMark,
          isAnnotation: isAnnotation,
          isFamilyEvent: isFamilyEvent,
          isKeyEvent: isKeyEvent,
        },
        category: category,
        quality: quality,
      });
    }
  }
}

const byYear = {};
allEvents.forEach(e => {
  if (!byYear[e.year]) byYear[e.year] = [];
  byYear[e.year].push(e);
});

const contentMap = new Map();
allEvents.forEach(e => {
  const key = e.content.substring(0, 30);
  if (!contentMap.has(key)) {
    contentMap.set(key, []);
  }
  contentMap.get(key).push(e.id);
});

contentMap.forEach((ids, key) => {
  if (ids.length > 1) {
    ids.forEach(id => {
      const event = allEvents.find(e => e.id === id);
      if (event) {
        event.flags.isDuplicate = true;
        event.flags.duplicateOf = ids.filter(i => i !== id);
      }
    });
  }
});

const summaryEvents = [];
Object.keys(byYear).sort((a,b) => a-b).forEach(year => {
  const es = byYear[year];
  const dated = es.filter(e => e.month !== null).sort((a,b) => {
    if (a.month !== b.month) return a.month - b.month;
    return (a.day || 0) - (b.day || 0);
  });
  const undated = es.filter(e => e.month === null);
  
  const selected = [...dated.slice(0, 2), ...undated.slice(0, 1)].slice(0, 2);
  selected.forEach(e => summaryEvents.push(e));
});

const result = {
  metadata: {
    subject: '黄賓虹',
    birthYear: BIRTH_YEAR,
    deathYear: DEATH_YEAR,
    totalRawEvents: allEvents.length,
    totalSummaryEvents: summaryEvents.length,
    yearSpan: DEATH_YEAR - BIRTH_YEAR + 1,
    yearsWithEvents: Object.keys(byYear).length,
    source: '黄賓虹年譜 (DOC)',
    extractDate: new Date().toISOString(),
    version: 'v4 - with semantic flags'
  },
  summary: summaryEvents,
  events: allEvents,
  byYear: byYear,
  stats: {
    pureQuotes: allEvents.filter(e => e.flags.isPureQuote).length,
    hasQuoteMarks: allEvents.filter(e => e.flags.hasQuoteMark).length,
    annotations: allEvents.filter(e => e.flags.isAnnotation).length,
    familyEvents: allEvents.filter(e => e.flags.isFamilyEvent).length,
    keyEvents: allEvents.filter(e => e.flags.isKeyEvent).length,
    duplicates: allEvents.filter(e => e.flags.isDuplicate).length,
    categories: Object.entries(allEvents.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {})).sort((a,b) => b[1] - a[1])
  }
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ v4 提取完成！`);
console.log(`📊 总事件: ${allEvents.length} 条`);
console.log(`📊 摘要事件: ${summaryEvents.length} 条`);
console.log(`📁 已保存到: ${outputFile}`);
console.log(`\n📊 标记统计:`);
console.log(`  - 纯引用: ${result.stats.pureQuotes}`);
console.log(`  - 含引用标记: ${result.stats.hasQuoteMarks}`);
console.log(`  - 注释按语: ${result.stats.annotations}`);
console.log(`  - 家族事件: ${result.stats.familyEvents}`);
console.log(`  - 关键事件: ${result.stats.keyEvents}`);
console.log(`  - 重复事件: ${result.stats.duplicates}`);
console.log(`\n📊 分类统计:`);
result.stats.categories.forEach(([cat, count]) => {
  console.log(`  - ${cat}: ${count}`);
});
