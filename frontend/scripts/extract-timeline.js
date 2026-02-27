const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜.txt';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-data.json';

const BIRTH_YEAR = 1865;

const categoryDefs = {
  birth: { name: '诞生', desc: '出生、幼年、童年' },
  family: { name: '家族', desc: '兄弟、姊妹、家庭事务' },
  education: { name: '求学', desc: '从师学习、教育经历' },
  art_start: { name: '艺术启蒙', desc: '开始学习书画、启蒙老师' },
  art_creation: { name: '艺术创作', desc: '书画创作，写生、作品' },
  teaching: { name: '教育活动', desc: '任教，教学、课程' },
  publication: { name: '著作出版', desc: '编辑、出版、著作' },
  social: { name: '交游', desc: '结识名人、社交活动' },
  exhibition: { name: '展览', desc: '画展、展出、展览' },
  travel: { name: '游历', desc: '出游，写生、考察' },
  move: { name: '迁徙', desc: '迁居、搬家、移居' },
  career: { name: '职业', desc: '任职、工作、职务' },
  honor: { name: '荣誉', desc: '获奖、任命，当选' },
  health: { name: '健康', desc: '疾病、疗养' },
  death: { name: '逝世', desc: '去世、逝世' },
  life: { name: '综合', desc: '综合事件' }
};

function calcAge(year) {
  return year - BIRTH_YEAR;
}

function getCategory(text, year) {
  if (year === 1955) return 'death';
  if (year === 1865) return 'birth';
  
  const catScores = {
    death: 0, birth: 0, family: 0, education: 0,
    art_start: 0, art_creation: 0, teaching: 0, publication: 0,
    social: 0, exhibition: 0, travel: 0, move: 0, career: 0, honor: 0, health: 0, life: 0
  };
  
  if (text.includes('逝世') || text.includes('去世')) catScores.death += 5;
  if (text.includes('結婚') || text.includes('娶妻')) catScores.family += 8;
  if (text.includes('二弟生')) catScores.family += 8;
  if (text.includes('三弟生')) catScores.family += 8;
  if (text.includes('四弟生')) catScores.family += 8;
  if (text.includes('妹生')) catScores.family += 8;
  
  if (text.includes('始習畫') || text.includes('開始學')) catScores.art_start += 10;
  if (text.includes('作山水') || text.includes('作畫') || text.includes('作詩')) catScores.art_creation += 8;
  if (text.includes('作幅') || text.includes('作圖') || text.includes('寫生')) catScores.art_creation += 8;
  if (text.includes('作畫') || text.includes('作書') || text.includes('作詩')) catScores.art_creation += 6;
  
  if (text.includes('任教') || text.includes('教授') || text.includes('教書')) catScores.teaching += 8;
  if (text.includes('講學') || text.includes('授課')) catScores.teaching += 8;
  
  if (text.includes('編') && text.includes('出版')) catScores.publication += 10;
  if (text.includes('出版') || text.includes('印行')) catScores.publication += 8;
  if (text.includes('發表') || text.includes('著作')) catScores.publication += 6;
  
  if (text.includes('認識') || text.includes('结识')) catScores.social += 8;
  if (text.includes('相交') || text.includes('晤')) catScores.social += 6;
  if (text.includes('訪') || text.includes('謁')) catScores.social += 5;
  
  if (text.includes('展覽') || text.includes('展出')) catScores.exhibition += 10;
  if (text.includes('畫展') || text.includes('個展')) catScores.exhibition += 10;
  
  if (text.includes('遷居') || text.includes('搬家') || text.includes('移居')) catScores.move += 10;
  
  if (text.includes('遊') || text.includes('遊')) catScores.travel += 6;
  if (text.includes('赴') && !text.includes('任教')) catScores.travel += 4;
  
  if (text.includes('當選') || text.includes('任命')) catScores.career += 8;
  if (text.includes('聘')) catScores.career += 5;
  
  if (text.includes('獲獎') || text.includes('獲譽')) catScores.honor += 10;
  
  if (text.includes('眼疾') || text.includes('生病')) catScores.health += 10;
  
  if (text.includes('從師') || text.includes('從學') || text.includes('求學')) catScores.education += 5;
  if (text.includes('讀書') && text.includes('私塾')) catScores.education += 5;
  
  let maxScore = 0;
  let bestCat = 'life';
  for (const [cat, score] of Object.entries(catScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCat = cat;
    }
  }
  
  return bestCat;
}

function extractSemanticTitle(text, year, category) {
  const lines = text.split('\n').filter(l => l.trim());
  let firstLine = lines[0] || '';
  
  firstLine = firstLine.replace(/^\d+年[^，]*/, '').trim();
  if (firstLine.includes('，')) {
    firstLine = firstLine.substring(0, firstLine.indexOf('，'));
  }
  
  const titlePatterns = {
    birth: () => {
      const match = text.match(/生於([^。，]+)/);
      return match ? `出生于${match[1]}` : '出生';
    },
    death: () => '逝世',
    family: () => {
      if (text.includes('二弟')) return '二弟出生';
      if (text.includes('三弟')) return '三弟出生';
      if (text.includes('四弟')) return '四弟出生';
      if (text.includes('妹')) return '姐妹出生';
      if (text.includes('結婚')) return '结婚';
      return '家庭事务';
    },
    art_creation: () => {
      const works = [];
      if (text.includes('山水')) works.push('山水');
      if (text.includes('花卉') || text.includes('花鳥')) works.push('花鸟');
      if (text.includes('寫生')) works.push('写生');
      if (works.length > 0) return `创作${works.join('')}`;
      return '艺术创作';
    },
    teaching: () => {
      if (text.includes('任教')) return '任教';
      if (text.includes('教授')) return '教授';
      return '教育活动';
    },
    publication: () => {
      const bookMatch = text.match(/《([^》]+)》/);
      if (bookMatch) return `出版《${bookMatch[1]}》`;
      return '著作出版';
    },
    social: () => '社交活动',
    exhibition: () => '参加/举办展览',
    move: () => '迁居',
    travel: () => '游历',
    career: () => '职业发展',
    honor: () => '获得荣誉',
    health: () => '健康',
    education: () => '求学',
    life: () => firstLine.substring(0, 15) || '综合事件'
  };
  
  const title = (titlePatterns[category] || titlePatterns.life)();
  return title.substring(0, 20);
}

const content = fs.readFileSync(inputFile, 'utf-8');
const timeline = [];
const lines = content.split('\n');

let currentYear = null;
let currentEra = null;
let currentContent = [];
let inMainSection = false;

function parseYearLine(line) {
  const match = line.match(/^公元(\d{4})年/);
  return match ? parseInt(match[1]) : null;
}

function parseEra(line) {
  const yearMatch = line.match(/(\d{4})年/);
  if (!yearMatch) return '晚清';
  const year = parseInt(yearMatch[1]);
  if (year <= 1911) return '晚清';
  if (year <= 1948) return '民國';
  return '新中國';
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('黄賓虹年譜') && !inMainSection) {
    inMainSection = true;
    continue;
  }
  
  if (!inMainSection) continue;
  
  if (line.startsWith('公元') && line.includes('年')) {
    const year = parseYearLine(line);
    if (year && year >= 1865 && year <= 1955) {
      if (currentYear !== null && currentContent.length > 0) {
        const fullContent = currentContent.join('\n');
        const category = getCategory(fullContent, currentYear);
        
        timeline.push({
          year: currentYear,
          era: currentEra,
          age: calcAge(currentYear),
          title: extractSemanticTitle(fullContent, currentYear, category),
          content: fullContent.substring(0, 600),
          category: category,
          categoryName: categoryDefs[category]?.name || '综合'
        });
      }
      
      currentYear = year;
      currentEra = parseEra(line);
      currentContent = [];
    }
  } else if (currentYear !== null && line.length > 3) {
    currentContent.push(line);
  }
}

if (currentYear !== null && currentContent.length > 0) {
  const fullContent = currentContent.join('\n');
  const category = getCategory(fullContent, currentYear);
  timeline.push({
    year: currentYear,
    era: currentEra,
    age: calcAge(currentYear),
    title: extractSemanticTitle(fullContent, currentYear, category),
    content: fullContent.substring(0, 600),
    category: category,
    categoryName: categoryDefs[category]?.name || '综合'
  });
}

const result = {
  metadata: {
    subject: '黄賓虹',
    birthYear: BIRTH_YEAR,
    deathYear: 1955,
    totalRecords: timeline.length,
    source: '黄賓虹年譜',
    extractDate: new Date().toISOString(),
    categories: categoryDefs
  },
  timeline: timeline
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ 提取完成！共 ${timeline.length} 条记录`);
console.log(`📁 文件已保存到: ${outputFile}`);

const categoryCount = {};
timeline.forEach(item => {
  categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
});
console.log('\n📊 事件分类统计:');
Object.entries(categoryCount).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`   ${categoryDefs[cat]?.name || cat}: ${count}`);
});

console.log('\n📅 关键年份预览:');
[1865, 1907, 1919, 1937, 1943, 1948, 1955].forEach(y => {
  const item = timeline.find(t => t.year === y);
  if (item) console.log(`   [${item.year}年|${item.age}岁] ${item.title} (${item.categoryName})`);
});
