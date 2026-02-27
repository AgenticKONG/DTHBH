const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜.txt';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-events.json';

const BIRTH_YEAR = 1865;
const DEATH_YEAR = 1955;

const content = fs.readFileSync(inputFile, 'utf-8');
const lines = content.split('\n');

let inMainSection = false;
let currentYear = null;
let currentEra = null;
let currentCyclical = null;
let currentAge = null;

const events = [];

function parseYearHeader(line) {
  const match = line.match(/^公元(\d{4})年/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  if (year < BIRTH_YEAR || year > DEATH_YEAR) return null;
  
  let era = '晚清';
  if (line.includes('民國')) era = '民國';
  if (line.includes('中華人民共和國') || line.includes('新中國')) era = '新中國';
  
  let cyclical = '';
  const cyclicalMatch = line.match(/(\w+)\s+年/);
  if (cyclicalMatch && !cyclicalMatch[1].includes('民國') && !cyclicalMatch[1].includes('公元')) {
    cyclical = cyclicalMatch[1];
  }
  
  let age = null;
  const ageMatch = line.match(/(\d+)歲/);
  if (ageMatch) age = parseInt(ageMatch[1]);
  
  return { year, era, cyclical, age };
}

function parseEventLine(line, prevLineWasEvent) {
  line = line.trim();
  if (line.length < 4) return null;
  
  // 跳过纯引用行（以《》开头）
  if (/^《[^》]+》/.test(line)) return null;
  // 跳过引用内容行
  if (/^"[^"]+"|'[^']+'/.test(line)) return null;
  
  let month = null;
  let day = null;
  let eventContent = line;
  let hasDate = false;
  
  // 完整日期: X月X日
  const fullDateMatch = line.match(/^(\d+)月(\d+)日/);
  if (fullDateMatch) {
    month = parseInt(fullDateMatch[1]);
    day = parseInt(fullDateMatch[2]);
    eventContent = line.substring(line.indexOf(day) + day.toString().length).trim();
    hasDate = true;
  } else {
    // 只有月份
    const monthOnlyMatch = line.match(/^(\d+)月/);
    if (monthOnlyMatch && line.length < 30) {
      month = parseInt(monthOnlyMatch[1]);
      eventContent = line.substring(line.indexOf(month) + month.toString().length).trim();
      hasDate = true;
    }
  }
  
  // 只保留有日期的事件，或者没有日期但是简短的主要描述行
  if (!hasDate && !prevLineWasEvent) return null;
  if (eventContent.length < 3) return null;
  
  // 过滤掉太长的引用内容
  if (eventContent.length > 200) return null;
  
  return {
    month,
    day,
    content: eventContent,
    hasDate
  };
}

let prevLineWasEvent = false;

for (const line of lines) {
  if (line.includes('黄賓虹年譜') && !inMainSection) {
    inMainSection = true;
    continue;
  }
  
  if (!inMainSection) continue;
  
  const yearInfo = parseYearHeader(line);
  if (yearInfo) {
    currentYear = yearInfo.year;
    currentEra = yearInfo.era;
    currentCyclical = yearInfo.cyclical;
    currentAge = yearInfo.age;
    prevLineWasEvent = false;
    continue;
  }
  
  if (currentYear === null) continue;
  
  const event = parseEventLine(line, prevLineWasEvent);
  if (event && event.content) {
    events.push({
      year: currentYear,
      era: currentEra,
      cyclical: currentCyclical,
      age: currentAge || (currentYear - BIRTH_YEAR),
      month: event.month,
      day: event.day,
      content: event.content.substring(0, 150)
    });
    prevLineWasEvent = event.hasDate;
  } else {
    prevLineWasEvent = false;
  }
}

const yearGroups = {};
events.forEach(e => {
  if (!yearGroups[e.year]) yearGroups[e.year] = [];
  yearGroups[e.year].push(e);
});

const result = {
  metadata: {
    subject: '黄賓虹',
    birthYear: BIRTH_YEAR,
    deathYear: DEATH_YEAR,
    totalEvents: events.length,
    yearSpan: DEATH_YEAR - BIRTH_YEAR + 1,
    source: '黄賓虹年譜',
    extractDate: new Date().toISOString()
  },
  events: events,
  byYear: yearGroups
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ 提取完成！`);
console.log(`📊 共 ${events.length} 条核心事件，跨越 ${DEATH_YEAR - BIRTH_YEAR + 1} 年`);
console.log(`📁 已保存到: ${outputFile}`);

const yearCounts = {};
events.forEach(e => yearCounts[e.year] = (yearCounts[e.year] || 0) + 1);

console.log('\n📈 事件数量 (前15年):');
Object.keys(yearCounts).sort((a,b) => a-b).slice(0, 15).forEach(y => {
  console.log(`   ${y}年: ${yearCounts[y]}条`);
});

console.log('\n📈 事件数量 (后15年):');
Object.keys(yearCounts).sort((a,b) => a-b).slice(-15).forEach(y => {
  console.log(`   ${y}年: ${yearCounts[y]}条`);
});

console.log('\n📅 事件样例 (每10年取1条):');
[1865, 1875, 1885, 1895, 1905, 1915, 1925, 1935, 1945, 1955].forEach(y => {
  const e = events.find(e => e.year === y);
  if (e) {
    const date = e.day ? `${e.month}月${e.day}日` : (e.month ? `${e.month}月` : '');
    console.log(`   [${e.year}] ${date} ${e.content.substring(0, 35)}...`);
  }
});
