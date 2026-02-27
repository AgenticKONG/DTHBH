const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜-from-doc.txt';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-events.json';

const BIRTH_YEAR = 1865;
const DEATH_YEAR = 1955;

const content = fs.readFileSync(inputFile, 'utf-8');

let inMainSection = false;
let currentYear = null;
let currentEra = null;
let currentAge = null;

const events = [];

// 将文本按行分割
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // 找到年谱正文开始
  if (line.includes('黄賓虹年譜') && !inMainSection) {
    inMainSection = true;
    continue;
  }
  
  if (!inMainSection) continue;
  
  // 匹配年份行: 公元XXXX年 (可能在行开头)
  const yearMatch = line.match(/^公元(\d{4})年/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= BIRTH_YEAR && year <= DEATH_YEAR) {
      currentYear = year;
      
      // 判断时代
      if (line.includes('民國')) {
        currentEra = '民國';
      } else if (line.includes('新中國') || line.includes('中華人民共和國')) {
        currentEra = '新中國';
      } else {
        currentEra = '晚清';
      }
      
      // 年龄
      const ageMatch = line.match(/(\d+)歲/);
      currentAge = ageMatch ? parseInt(ageMatch[1]) : (year - BIRTH_YEAR);
      
      continue;
    }
  }
  
  // 解析事件行 - 以日期开头的行，或年份后的其他事件行
  if (currentYear && line.length > 5) {
    // 月日格式: X月X日
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
      // 只有月份时，内容要短
      const rawContent = monthOnlyMatch[2].trim();
      if (rawContent.length < 80 && rawContent.length > 2) {
        month = parseInt(monthOnlyMatch[1]);
        eventContent = rawContent;
      }
    } else {
      // 没有日期前缀的事件行 - 检查是否为有效事件（非引用、非年份标记）
      // 跳过年份行、空行、纯引用、括号注释
      const isYearHeader = /^公元\d+年/.test(line);
      const isQuote = line.startsWith('《') || line.startsWith('[') || line.startsWith('（');
      const isParenthetical = /^\([^)]+\)$/.test(line) || /^\[.*\]$/.test(line);
      const isBlank = line.length < 3;
      const hasYearInParens = /\(\d{4}[—\-]\d{4}\)/.test(line);
      
      if (!isYearHeader && !isQuote && !isParenthetical && !isBlank) {
        // 检查是否是有效的简短事件描述
        if (line.length > 3 && line.length < 100) {
          eventContent = line;
        }
      }
    }
    
    // 过滤
    if (eventContent && eventContent.length > 2) {
      // 跳过纯引用
      if (!eventContent.startsWith('《') && !eventContent.startsWith('[') && !eventContent.startsWith('（')) {
        events.push({
          year: currentYear,
          era: currentEra,
          age: currentAge,
          month: month,
          day: day,
          content: eventContent
        });
      }
    }
  }
}

// 按年份分组
const byYear = {};
events.forEach(e => {
  if (!byYear[e.year]) byYear[e.year] = [];
  byYear[e.year].push(e);
});

// 每年取核心事件（有日期的优先）
const summaryEvents = [];
Object.keys(byYear).sort((a,b) => a-b).forEach(year => {
  const es = byYear[year];
  // 优先取有日期的事件，按日期排序
  const dated = es.filter(e => e.month !== null).sort((a,b) => {
    if (a.month !== b.month) return a.month - b.month;
    return (a.day || 0) - (b.day || 0);
  });
  const undated = es.filter(e => e.month === null);
  
  // 每年取2条
  const selected = [...dated.slice(0, 2), ...undated.slice(0, 1)].slice(0, 2);
  selected.forEach(e => summaryEvents.push(e));
});

const result = {
  metadata: {
    subject: '黄賓虹',
    birthYear: BIRTH_YEAR,
    deathYear: DEATH_YEAR,
    totalRawEvents: events.length,
    totalSummaryEvents: summaryEvents.length,
    yearSpan: DEATH_YEAR - BIRTH_YEAR + 1,
    source: '黄賓虹年譜 (DOC)',
    extractDate: new Date().toISOString()
  },
  events: summaryEvents,
  byYear: byYear
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ 提取完成！`);
console.log(`📊 原始事件: ${events.length} 条`);
console.log(`📊 摘要事件: ${summaryEvents.length} 条`);
console.log(`📁 已保存到: ${outputFile}`);

// 显示有事件的年份
const yearsWithEvents = Object.keys(byYear).sort((a,b) => a-b);
console.log(`\n📅 覆盖年份: ${yearsWithEvents.length} 年 (${yearsWithEvents[0]} - ${yearsWithEvents[yearsWithEvents.length-1]})`);

// 显示每年事件数
console.log('\n📈 各年份事件数:');
yearsWithEvents.forEach((y, i) => {
  if (i < 10 || i >= yearsWithEvents.length - 5 || byYear[y].length > 3) {
    console.log(`   ${y}年: ${byYear[y].length}条`);
  }
});

// 关键年份样例
console.log('\n📅 关键年份:');
[1865, 1900, 1912, 1928, 1937, 1948, 1955].forEach(y => {
  const es = events.filter(e => e.year === y);
  if (es.length > 0) {
    const e = es[0];
    const date = e.day ? `${e.month}月${e.day}日` : (e.month ? `${e.month}月` : '');
    console.log(`   [${y}] ${date} ${e.content.substring(0, 30)}...`);
  }
});
