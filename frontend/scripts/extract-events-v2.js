const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜-from-doc.txt';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-events.json';

const BIRTH_YEAR = 1865;
const DEATH_YEAR = 1955;

const content = fs.readFileSync(inputFile, 'utf-8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l);

let inMainSection = false;
let currentYear = null;
let currentEra = null;
let currentAge = null;

const events = [];

function parseYearHeader(line) {
  // 匹配: 公元1865年清穆宗 同治四年  乙丑  二歲
  const match = line.match(/公元(\d{4})年/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  if (year < BIRTH_YEAR || year > DEATH_YEAR) return null;
  
  let era = '晚清';
  if (line.includes('民國')) era = '民國';
  if (line.includes('中華人民共和國') || line.includes('新中國')) era = '新中國';
  
  let age = null;
  const ageMatch = line.match(/(\d+)歲/);
  if (ageMatch) age = parseInt(ageMatch[1]);
  
  return { year, era, age };
}

function parseEventLine(line, prevLine) {
  // 跳过空行和太短的行
  if (line.length < 5) return null;
  
  // 跳过纯引用来源行
  if (/^《[^》]+》/.test(line)) return null;
  if (/^\[.*\]$/.test(line)) return null;
  
  let month = null;
  let day = null;
  let eventContent = line;
  
  // 匹配日期: X月X日
  const dateMatch = line.match(/^(\d{1,2})月(\d{1,2})日/);
  if (dateMatch) {
    month = parseInt(dateMatch[1]);
    day = parseInt(dateMatch[2]);
    eventContent = line.substring(dateMatch[0].length).trim();
  } else {
    // 只有月份
    const monthMatch = line.match(/^(\d{1,2})月/);
    if (monthMatch && line.length < 30) {
      month = parseInt(monthMatch[1]);
      eventContent = line.substring(monthMatch[0].length).trim();
    }
  }
  
  // 过滤太长的引用内容
  if (eventContent.length > 150) return null;
  if (eventContent.length < 3) return null;
  
  // 必须有日期才保留，或者上一行是日期行
  const hasDate = month !== null;
  if (!hasDate && !prevLine) return null;
  
  return {
    month,
    day,
    content: eventContent,
    hasDate
  };
}

let prevLine = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // 找到年谱正文开始
  if (line.includes('黄賓虹年譜') && !inMainSection) {
    inMainSection = true;
    continue;
  }
  
  if (!inMainSection) continue;
  
  const yearInfo = parseYearHeader(line);
  if (yearInfo) {
    currentYear = yearInfo.year;
    currentEra = yearInfo.era;
    currentAge = yearInfo.age;
    prevLine = false;
    continue;
  }
  
  if (currentYear === null) continue;
  
  const event = parseEventLine(line, prevLine);
  if (event && event.content) {
    events.push({
      year: currentYear,
      era: currentEra,
      age: currentAge || (currentYear - BIRTH_YEAR),
      month: event.month,
      day: event.day,
      content: event.content
    });
    prevLine = event.hasDate;
  } else {
    prevLine = false;
  }
}

// 按年份分组
const byYear = {};
events.forEach(e => {
  if (!byYear[e.year]) byYear[e.year] = [];
  byYear[e.year].push(e);
});

// 只取每年有日期的主要事件（1-3条）
const summaryEvents = [];
Object.keys(byYear).sort((a,b) => a-b).forEach(year => {
  const yearEvents = byYear[year];
  // 取有日期的事件优先
  const datedEvents = yearEvents.filter(e => e.month !== null);
  const undatedEvents = yearEvents.filter(e => e.month === null);
  
  // 每年取最多3条主要事件
  const selected = [...datedEvents.slice(0, 2), ...undatedEvents.slice(0, 1)].slice(0, 3);
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
    source: '黄賓虹年譜 (DOC转换)',
    extractDate: new Date().toISOString()
  },
  events: summaryEvents,
  byYear: byYear
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ 提取完成！`);
console.log(`📊 原始事件: ${events.length} 条`);
console.log(`📊 年度摘要事件: ${summaryEvents.length} 条`);
console.log(`📁 已保存到: ${outputFile}`);

// 显示每年事件数
const yearCounts = {};
events.forEach(e => yearCounts[e.year] = (yearCounts[e.year] || 0) + 1);

console.log('\n📈 各年份事件数 (部分展示):');
Object.keys(yearCounts).sort((a,b) => a-b).forEach((y, i) => {
  if (i < 5 || i >= Object.keys(yearCounts).length - 3 || yearCounts[y] > 3) {
    console.log(`   ${y}年: ${yearCounts[y]}条`);
  }
});

console.log('\n📅 事件样例:');
[1865, 1907, 1919, 1937, 1943, 1955].forEach(y => {
  const es = events.filter(e => e.year === y);
  if (es.length > 0) {
    const e = es[0];
    const date = e.day ? `${e.month}月${e.day}日` : (e.month ? `${e.month}月` : '');
    console.log(`   [${y}] ${date} ${e.content.substring(0, 40)}...`);
  }
});
